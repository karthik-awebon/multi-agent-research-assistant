import { NextRequest } from 'next/server';
import { resolveApproval } from '@/lib/session-store';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { sessionId, nodeId, approved, reason } = body ?? {};

  if (typeof sessionId !== 'string' || typeof nodeId !== 'string' || typeof approved !== 'boolean') {
    return Response.json({ error: 'sessionId, nodeId, and approved are required' }, { status: 400 });
  }

  const resolved = resolveApproval(sessionId, nodeId, { approved, reason });

  if (!resolved) {
    logger.warn({ sessionId, nodeId }, 'Approval not found — may have already been resolved');
    return Response.json({ error: 'Approval not found' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
