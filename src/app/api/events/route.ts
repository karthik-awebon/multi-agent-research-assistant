import { NextRequest } from 'next/server';
import { getSession, attachController } from '@/lib/session-store';
import { runOrchestration } from '@/lib/agent-orchestrator';
import { logger } from '@/utils/logger';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId query parameter', { status: 400 });
  }

  const session = getSession(sessionId);

  if (!session) {
    return new Response('Session not found or already completed', { status: 404 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      attachController(sessionId, controller);
      logger.info({ sessionId }, 'SSE stream opened — starting orchestration');

      // Orchestration runs in the background; events are pushed into this stream
      runOrchestration(sessionId, session.query).catch((err) => {
        logger.error({ err, sessionId }, 'Unhandled orchestration error');
        try {
          controller.error(err);
        } catch {
          // controller may already be closed
        }
      });
    },
    cancel() {
      logger.info({ sessionId }, 'Client disconnected from SSE stream');
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
