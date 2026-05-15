import Anthropic from '@anthropic-ai/sdk';
import { pushEvent, waitForApproval, endSession } from './session-store';
import { logger } from '@/utils/logger';

// Lazy-initialized so importing this module in test environments doesn't
// trigger the Anthropic SDK's browser-check at module evaluation time.
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

// ---------------------------------------------------------------------------
// Orchestrator tools — what the top-level planner agent can call
// ---------------------------------------------------------------------------

const ORCHESTRATOR_TOOLS: Anthropic.Tool[] = [
  {
    name: 'spawn_research_subtask',
    description:
      'Spawn a specialized research sub-agent to investigate a specific aspect of the query. ' +
      'Returns the sub-agent\'s findings. Subtasks with the same depends_on list run in parallel.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Short display name shown in the graph (max 40 chars)' },
        description: { type: 'string', description: 'Detailed research goal for the sub-agent' },
        depends_on: {
          type: 'array',
          items: { type: 'string' },
          description: 'Node IDs of subtasks whose output is required before this one starts',
        },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'request_human_approval',
    description:
      'Pause execution and surface a payload to the human operator for review. ' +
      'Execution resumes only after the human approves or rejects.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Short label for the approval node' },
        question: { type: 'string', description: 'The question posed to the human' },
        payload: { type: 'object', description: 'Structured data the human needs to review' },
        depends_on: {
          type: 'array',
          items: { type: 'string' },
          description: 'Node IDs that must complete before this approval is surfaced',
        },
      },
      required: ['name', 'question', 'payload'],
    },
  },
  {
    name: 'finalize_research',
    description: 'Mark the entire research run as complete and emit the synthesized summary.',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Final synthesized research answer' },
      },
      required: ['summary'],
    },
  },
];

// ---------------------------------------------------------------------------
// Research sub-agent tools — what each leaf agent can call
// ---------------------------------------------------------------------------

const RESEARCH_TOOLS: Anthropic.Tool[] = [
  {
    name: 'web_search',
    description: 'Search the internet for relevant information.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyze_content',
    description: 'Deeply analyze a body of text and extract structured insights.',
    input_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Text to analyze' },
        focus: { type: 'string', description: 'Specific angle or question to focus on' },
      },
      required: ['content', 'focus'],
    },
  },
];

// Simulated tool execution — swap with real APIs (Tavily, Exa, etc.) in production
async function executeResearchTool(
  toolName: string,
  input: Record<string, unknown>,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400)); // realistic latency sim

  if (toolName === 'web_search') {
    const q = String(input.query);
    return JSON.stringify({
      results: [
        { title: `Overview: ${q}`, snippet: `${q} is a rapidly evolving field with applications in...` },
        { title: `Recent developments in ${q}`, snippet: `New research shows that ${q} leads to significant improvements in...` },
        { title: `Challenges in ${q}`, snippet: `Key obstacles include scalability, interpretability, and alignment concerns...` },
      ],
    });
  }

  if (toolName === 'analyze_content') {
    const focus = String(input.focus);
    return JSON.stringify({
      key_points: [
        `${focus}: primary finding shows a 3× improvement over baseline`,
        `Caveats: sample sizes remain small in most published studies`,
        `Recommended next steps: replicate with larger corpora`,
      ],
      confidence: 0.82,
    });
  }

  return JSON.stringify({ error: `Unknown tool: ${toolName}` });
}

// ---------------------------------------------------------------------------
// Sub-agent runner — runs one research leaf task, emitting TOOL_CALL nodes
// ---------------------------------------------------------------------------

async function runSubAgent(
  sessionId: string,
  taskNodeId: string,
  description: string,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: description },
  ];

  for (let turn = 0; turn < 5; turn++) {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system:
        'You are a specialized research agent. Use your tools to gather and analyze information, ' +
        'then synthesize a concise, structured answer. Be specific and cite your sources.',
      tools: RESEARCH_TOOLS,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n');
      return text;
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      // Parallel tool execution within a single sub-agent turn
      await Promise.all(
        response.content
          .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
          .map(async (toolUse) => {
            const toolNodeId = crypto.randomUUID();

            pushEvent(sessionId, {
              type: 'TOOL_CALL_STARTED',
              node: {
                id: toolNodeId,
                type: 'TOOL_CALL',
                status: 'RUNNING',
                name: toolUse.name.replace(/_/g, ' '),
              },
              dependencies: [taskNodeId],
            });

            let result: string;
            try {
              result = await executeResearchTool(
                toolUse.name,
                toolUse.input as Record<string, unknown>,
              );
              pushEvent(sessionId, {
                type: 'NODE_STATUS_UPDATED',
                nodeId: toolNodeId,
                status: 'COMPLETED',
                result: JSON.parse(result),
              });
            } catch (err) {
              const error = err instanceof Error ? err.message : String(err);
              pushEvent(sessionId, {
                type: 'NODE_STATUS_UPDATED',
                nodeId: toolNodeId,
                status: 'FAILED',
                error,
              });
              result = JSON.stringify({ error });
            }

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: result,
            });
          }),
      );

      messages.push({ role: 'user', content: toolResults });
    }
  }

  return 'Sub-agent reached turn limit without finalizing.';
}

// ---------------------------------------------------------------------------
// Orchestrator runner — the top-level multi-agent planner
// ---------------------------------------------------------------------------

export async function runOrchestration(sessionId: string, query: string): Promise<void> {
  logger.info({ sessionId, query }, 'Starting orchestration');

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Research query: ${query}`,
    },
  ];

  // Map from orchestrator-chosen names to real node IDs so depends_on works
  const nodeIdByName = new Map<string, string>();

  try {
    for (let turn = 0; turn < 10; turn++) {
      const response = await getClient().messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 4096,
        system:
          'You are a research orchestration agent. Break the query into parallel research subtasks. ' +
          'Use spawn_research_subtask for each subtask (they can run in parallel). ' +
          'Use request_human_approval before any action that could have irreversible consequences. ' +
          'Once all subtasks complete, call finalize_research with a synthesized summary. ' +
          'Prefer 2-4 focused subtasks over many coarse ones.',
        tools: ORCHESTRATOR_TOOLS,
        messages,
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        break;
      }

      if (response.stop_reason === 'tool_use') {
        const toolCalls = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        );

        const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
          toolCalls.map(async (toolUse) => {
            const input = toolUse.input as Record<string, unknown>;

            if (toolUse.name === 'spawn_research_subtask') {
              const nodeId = crypto.randomUUID();
              const name = String(input.name);
              nodeIdByName.set(name, nodeId);

              const dependsOnNames = (input.depends_on as string[] | undefined) ?? [];
              const dependencies = dependsOnNames
                .map((n) => nodeIdByName.get(n))
                .filter((id): id is string => id !== undefined);

              pushEvent(sessionId, {
                type: 'TASK_SPAWNED',
                node: { id: nodeId, type: 'TASK', status: 'RUNNING', name },
                dependencies,
              });

              let result: string;
              try {
                result = await runSubAgent(sessionId, nodeId, String(input.description));
                pushEvent(sessionId, {
                  type: 'NODE_STATUS_UPDATED',
                  nodeId,
                  status: 'COMPLETED',
                  result,
                });
              } catch (err) {
                const error = err instanceof Error ? err.message : String(err);
                pushEvent(sessionId, {
                  type: 'NODE_STATUS_UPDATED',
                  nodeId,
                  status: 'FAILED',
                  error,
                });
                result = `Error: ${error}`;
              }

              return {
                type: 'tool_result' as const,
                tool_use_id: toolUse.id,
                content: result,
              };
            }

            if (toolUse.name === 'request_human_approval') {
              const nodeId = crypto.randomUUID();
              const name = String(input.name);
              nodeIdByName.set(name, nodeId);

              const dependsOnNames = (input.depends_on as string[] | undefined) ?? [];
              const dependencies = dependsOnNames
                .map((n) => nodeIdByName.get(n))
                .filter((id): id is string => id !== undefined);

              pushEvent(sessionId, {
                type: 'TASK_SPAWNED',
                node: { id: nodeId, type: 'APPROVAL', status: 'LOCKED', name },
                dependencies,
              });

              pushEvent(sessionId, {
                type: 'APPROVAL_REQUESTED',
                nodeId,
                payload: { question: input.question, ...((input.payload as object) ?? {}) },
              });

              const { approved, reason } = await waitForApproval(sessionId, nodeId);

              pushEvent(sessionId, {
                type: 'APPROVAL_RESOLVED',
                nodeId,
                status: approved ? 'COMPLETED' : 'FAILED',
                result: { approved, reason: reason ?? null },
              });

              return {
                type: 'tool_result' as const,
                tool_use_id: toolUse.id,
                content: JSON.stringify({ approved, reason }),
              };
            }

            if (toolUse.name === 'finalize_research') {
              const rootId = crypto.randomUUID();
              pushEvent(sessionId, {
                type: 'TASK_SPAWNED',
                node: {
                  id: rootId,
                  type: 'TASK',
                  status: 'COMPLETED',
                  name: 'Research Complete',
                  result: input.summary,
                },
                dependencies: [...nodeIdByName.values()],
              });

              endSession(sessionId);

              return {
                type: 'tool_result' as const,
                tool_use_id: toolUse.id,
                content: 'Research finalized.',
              };
            }

            return {
              type: 'tool_result' as const,
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `Unknown tool: ${toolUse.name}` }),
            };
          }),
        );

        messages.push({ role: 'user', content: toolResults });
      }
    }
  } catch (err) {
    logger.error({ err, sessionId }, 'Orchestration failed');
    endSession(sessionId);
  }
}
