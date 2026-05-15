# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Setup

Copy `.env.local.example` to `.env.local` and fill in your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check (no emit)
npm test             # Run all unit/integration tests (Vitest, single run)
npm run test:watch   # Vitest in watch mode
npm run e2e          # Start dev server + run Cypress E2E tests
npm run cypress:open # Open Cypress interactive runner (server must already be running)
```

To run a single test file:
```bash
npx vitest run src/hooks/use-graph-layout.test.ts
```

## Architecture

A real-time multi-agent research dashboard. The user submits a research query; a Claude orchestrator agent decomposes it into parallel sub-tasks; each sub-task is executed by a Claude sub-agent; progress streams to the UI via SSE as AgentEvents; HITL approval nodes pause the orchestrator mid-execution and wait for human sign-off.

### Full Data Flow

```
User query (ResearchForm)
  → POST /api/research                    creates session, returns sessionId
    → GET /api/events?sessionId=...       opens SSE stream, triggers orchestration
      → runOrchestration() [claude-opus-4-7]
          spawn_research_subtask tool
            → runSubAgent() [claude-sonnet-4-6]
                web_search / analyze_content tools
                → TOOL_CALL_STARTED / NODE_STATUS_UPDATED events
            → NODE_STATUS_UPDATED (COMPLETED/FAILED) event
          request_human_approval tool
            → APPROVAL_REQUESTED event → UI blocks → POST /api/approve
            → orchestrator resumes → APPROVAL_RESOLVED event
          finalize_research tool
            → TASK_SPAWNED (Research Complete) → endSession()
      ← SSE events → useExecutionEvents → store.dispatch
        → ExecutionGraph (Dagre layout → SVG + NodeCards)
```

### Session Lifecycle

Each research run is a **session** (UUID) managed in `src/lib/session-store.ts`:
- `POST /api/research` → `createSession(query)` → returns sessionId (no orchestration yet)
- `GET /api/events?sessionId=` → `attachController()` → kicks off `runOrchestration()`
- `POST /api/approve` → `resolveApproval()` → unblocks the waiting orchestrator Promise

> The in-memory session store is single-process only. For multi-instance deployments, replace with Redis pub/sub.

### State Design

The Zustand store in `src/store/execution-store.ts` holds a **flat normalized** graph:
- `nodes: Record<string, ExecutionNode>` — keyed by node ID
- `edges: Record<string, ExecutionEdge>` — keyed by `"sourceId->targetId"`

All mutations go through `dispatch(event: AgentEvent)`. Topology (which nodes are blocked) is derived client-side in `src/utils/topological-sort.ts`.

### Event Types

Defined as Zod schemas in `src/schemas/agent-events.ts`, inferred into TypeScript in `src/types/`:

| Event | Effect on store |
|---|---|
| `TASK_SPAWNED` / `TOOL_CALL_STARTED` | Adds node + edges |
| `NODE_STATUS_UPDATED` | Updates status/result/error on existing node |
| `APPROVAL_REQUESTED` | Moves node to `LOCKED`, attaches payload |
| `APPROVAL_RESOLVED` | Moves node to `COMPLETED` or `FAILED` |

### HITL (Human-in-the-Loop)

When the orchestrator calls `request_human_approval`:
1. `TASK_SPAWNED` (type `APPROVAL`) + `APPROVAL_REQUESTED` events are emitted
2. Orchestrator awaits `waitForApproval(sessionId, nodeId)` — a Promise stored in the session
3. `ApprovalFence` renders on the node card; user clicks Approve or Reject
4. `useApprovalAction` dispatches optimistic Zustand update **and** POSTs to `POST /api/approve`
5. `resolveApproval()` fulfills the Promise; orchestrator emits `APPROVAL_RESOLVED` and continues

### Node Statuses

`PENDING` → `RUNNING` → `COMPLETED` | `FAILED`
`PENDING` → `LOCKED` (HITL) → `COMPLETED` | `FAILED`

A node is visually "blocked" if any of its dependencies have not yet reached `COMPLETED`.

### Graph Layout

`useGraphLayout` wraps Dagre in `useMemo`. It consumes the normalized store state and returns absolute `(x, y)` positions and bezier `points[]` for all nodes/edges. Config lives in `GRAPH_CONFIG` in `src/constants.ts`.

### Key Rules

- **Types**: Infer from Zod schemas in `src/schemas/`. Do not duplicate schema shapes by hand.
- **Constants**: All hardcoded values, endpoints, and config go in `src/constants.ts`.
- **Logging**: Use `logger` from `src/utils/logger.ts` (Pino). `debug` for flow/perf, `info` for connections/user actions, `error` for failures.
- **SRP**: Hooks own logic, components own rendering, the store owns state.
- **`@` alias**: `@/` maps to `src/` — use it for all cross-directory imports.
- **Web search**: `executeResearchTool('web_search', ...)` in `agent-orchestrator.ts` is simulated. Swap in Tavily, Exa, or Brave Search for production.
