import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExecutionEvents } from './use-execution-events';
import { useExecutionStore } from '../store/execution-store';
import { AgentEvent } from '../types';
import { MOCK_EVENTS } from '../__mocks__/data';

interface MockEventSourceInstance {
  close: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((event: Event) => void) | null;
}

describe('useExecutionEvents', () => {
  let instances: MockEventSourceInstance[] = [];

  beforeEach(() => {
    useExecutionStore.getState().reset();
    vi.clearAllMocks();
    instances = [];

    const MockEventSource = vi.fn().mockImplementation(function (this: MockEventSourceInstance) {
      this.close = vi.fn();
      this.onmessage = null;
      this.onerror = null;
      instances.push(this);
    });

    vi.stubGlobal('EventSource', MockEventSource);
  });

  it('dispatches parsed event on message', () => {
    let lastEvent: AgentEvent | null = null;
    const originalDispatch = useExecutionStore.getState().dispatch;
    useExecutionStore.setState({
      dispatch: (event) => {
        lastEvent = event;
        originalDispatch(event);
      },
    });

    renderHook(() => useExecutionEvents('test-session-id'));

    const eventData = JSON.stringify(MOCK_EVENTS[0]);

    if (instances[0].onmessage) {
      instances[0].onmessage({ data: eventData });
    }

    expect(lastEvent).toEqual(MOCK_EVENTS[0]);
  });

  it('closes connection on [DONE] message', () => {
    renderHook(() => useExecutionEvents('test-session-id'));

    if (instances[0].onmessage) {
      instances[0].onmessage({ data: '[DONE]' });
    }

    expect(instances[0].close).toHaveBeenCalled();
  });

  it('handles parse error gracefully without crashing', () => {
    renderHook(() => useExecutionEvents('test-session-id'));

    expect(() => {
      if (instances[0].onmessage) {
        instances[0].onmessage({ data: 'invalid-json' });
      }
    }).not.toThrow();

    expect(Object.keys(useExecutionStore.getState().nodes)).toHaveLength(0);
  });

  it('does not open EventSource when sessionId is null', () => {
    renderHook(() => useExecutionEvents(null));
    expect(instances).toHaveLength(0);
  });
});
