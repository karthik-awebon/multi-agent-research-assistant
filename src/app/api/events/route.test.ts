import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/events', () => {
  it('returns 400 when sessionId is missing', async () => {
    const request = new NextRequest('http://localhost/api/events');
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown sessionId', async () => {
    const request = new NextRequest('http://localhost/api/events?sessionId=unknown-session-id');
    const response = await GET(request);
    expect(response.status).toBe(404);
  });
});
