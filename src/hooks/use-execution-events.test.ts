import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExecutionEvents } from './use-execution-events';
import { useExecutionStore } from '../store/execution-store';
import { MOCK_EVENTS } from '../__mocks__/data';

describe('useExecutionEvents', () => {
  let instances: any[] = [];

  beforeEach(() => {
    useExecutionStore.getState().reset();
    vi.clearAllMocks();
    instances = [];

    const MockEventSource = vi.fn().mockImplementation(function (this: any) {
      this.close = vi.fn();
      this.onmessage = null;
      this.onerror = null;
      instances.push(this);
    });

    vi.stubGlobal('EventSource', MockEventSource);
  });

  it('dispatches parsed event on message', () => {
    let lastEvent: any = null;
    const originalDispatch = useExecutionStore.getState().dispatch;
    useExecutionStore.setState({ 
      dispatch: (event) => {
        lastEvent = event;
        originalDispatch(event);
      }
    });

    renderHook(() => useExecutionEvents('/api/test'));

    const eventData = JSON.stringify(MOCK_EVENTS[0]);
    
    if (instances[0].onmessage) {
      instances[0].onmessage({ data: eventData });
    }

    expect(lastEvent).toEqual(MOCK_EVENTS[0]);
  });

  it('closes connection on [DONE] message', () => {
    renderHook(() => useExecutionEvents('/api/test'));

    if (instances[0].onmessage) {
      instances[0].onmessage({ data: '[DONE]' });
    }

    expect(instances[0].close).toHaveBeenCalled();
  });

  it('handles parse error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHook(() => useExecutionEvents('/api/test'));

    if (instances[0].onmessage) {
      instances[0].onmessage({ data: 'invalid-json' });
    }

    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse SSE event data', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
