import { NextRequest } from 'next/server';
import { createSession } from '@/lib/session-store';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === 'string' ? body.query.trim() : '';

  if (!query) {
    return Response.json({ error: 'query is required' }, { status: 400 });
  }

  const sessionId = createSession(query);
  logger.info({ sessionId, query }, 'Research session created');

  return Response.json({ sessionId });
}
