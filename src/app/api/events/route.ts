import { AgentEvent } from '@/schemas/agent-events';

const mockEvents: AgentEvent[] = [
  {
    type: 'TASK_SPAWNED',
    node: { id: '1', type: 'TASK', status: 'COMPLETED', name: 'Initialize Research' },
    dependencies: [],
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: '2', type: 'TASK', status: 'RUNNING', name: 'Gather Data Sources' },
    dependencies: ['1'],
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: '3', type: 'TOOL_CALL', status: 'PENDING', name: 'Search Web API' },
    dependencies: ['2'],
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: '4', type: 'APPROVAL', status: 'LOCKED', name: 'Review Search Query', payload: { query: 'NextJS Architecture' } },
    dependencies: ['2'],
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: '5', type: 'TASK', status: 'PENDING', name: 'Summarize Results' },
    dependencies: ['3', '4'],
  }
];

export async function GET() {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < mockEvents.length; i++) {
        // Delay between events (1.5s), except for the first one
        if (i !== 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        const event = mockEvents[i];
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      // Send a done message so the client stops reconnecting
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      
      // After all events are sent, close the stream
      controller.close();
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
