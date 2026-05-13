import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { APP_CONFIG } from '@/constants';

describe('GET /api/events', () => {
  it('returns a Response with correct SSE headers', async () => {
    const response = await GET();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
  });

  it('streams events in the correct format', async () => {
    // Reduce delay for faster tests
    vi.stubGlobal('setTimeout', (cb: any) => cb());
    
    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    let result = '';
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      result += decoder.decode(value);
    }
    
    expect(result).toContain('data: {"type":"TASK_SPAWNED"');
    expect(result).toContain('data: [DONE]');
  });
});
