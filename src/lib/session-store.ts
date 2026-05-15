import { AgentEvent } from '@/types';
import { logger } from '@/utils/logger';

type ApprovalResolver = (result: { approved: boolean; reason?: string }) => void;

interface Session {
  query: string;
  controller: ReadableStreamDefaultController<Uint8Array> | null;
  pendingApprovals: Map<string, ApprovalResolver>;
  encoder: TextEncoder;
}

// In-memory store — replace with Redis for multi-instance deployments
const sessions = new Map<string, Session>();

export function createSession(query: string): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    query,
    controller: null,
    pendingApprovals: new Map(),
    encoder: new TextEncoder(),
  });
  logger.info({ sessionId }, 'Session created');
  return sessionId;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function attachController(
  sessionId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.controller = controller;
    logger.info({ sessionId }, 'SSE controller attached');
  }
}

export function pushEvent(sessionId: string, event: AgentEvent): void {
  const session = sessions.get(sessionId);
  if (!session?.controller) {
    logger.warn({ sessionId }, 'pushEvent: no controller attached');
    return;
  }
  const data = `data: ${JSON.stringify(event)}\n\n`;
  session.controller.enqueue(session.encoder.encode(data));
}

export function endSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session?.controller) return;
  session.controller.enqueue(session.encoder.encode('data: [DONE]\n\n'));
  session.controller.close();
  sessions.delete(sessionId);
  logger.info({ sessionId }, 'Session ended and stream closed');
}

export function waitForApproval(
  sessionId: string,
  nodeId: string,
): Promise<{ approved: boolean; reason?: string }> {
  return new Promise((resolve) => {
    const session = sessions.get(sessionId);
    if (!session) {
      resolve({ approved: false, reason: 'Session not found' });
      return;
    }
    session.pendingApprovals.set(nodeId, resolve);
    logger.info({ sessionId, nodeId }, 'Waiting for human approval');
  });
}

export function resolveApproval(
  sessionId: string,
  nodeId: string,
  result: { approved: boolean; reason?: string },
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const resolver = session.pendingApprovals.get(nodeId);
  if (!resolver) return false;
  resolver(result);
  session.pendingApprovals.delete(nodeId);
  logger.info({ sessionId, nodeId, approved: result.approved }, 'Approval resolved');
  return true;
}
