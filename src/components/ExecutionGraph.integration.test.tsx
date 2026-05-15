import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExecutionGraph } from './ExecutionGraph';
import { useExecutionStore } from '../store/execution-store';
import { MOCK_NODE_ID_1, MOCK_NODE_ID_2 } from '../__mocks__/data';

const MOCK_SESSION_ID = 'test-session-id';

describe('ExecutionGraph Integration', () => {
  interface MockEventSourceInstance {
    close: ReturnType<typeof vi.fn>;
    onmessage: ((event: { data: string }) => void) | null;
    onerror: ((event: Event) => void) | null;
  }

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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
  });

  it('coordinates full execution flow: spawning, status updates, and topological unblocking', async () => {
    render(<ExecutionGraph sessionId={MOCK_SESSION_ID} />);

    // 1. Spawn Node A (Root)
    const eventA = {
      type: 'TASK_SPAWNED',
      node: { id: MOCK_NODE_ID_1, type: 'TASK', status: 'PENDING', name: 'Task A' },
      dependencies: [],
    };

    await act(async () => {
      if (instances[0]?.onmessage) {
        instances[0].onmessage({ data: JSON.stringify(eventA) });
      }
    });

    expect(screen.getByText('Task A')).toBeInTheDocument();

    // 2. Spawn Node B (Dependent on A)
    const eventB = {
      type: 'TASK_SPAWNED',
      node: { id: MOCK_NODE_ID_2, type: 'TASK', status: 'PENDING', name: 'Task B' },
      dependencies: [MOCK_NODE_ID_1],
    };

    await act(async () => {
      if (instances[0]?.onmessage) {
        instances[0].onmessage({ data: JSON.stringify(eventB) });
      }
    });

    expect(screen.getByText('Task B')).toBeInTheDocument();

    // 3. Verify Task B is initially blocked (it should have lower opacity)
    const taskBCard = screen.getByText('Task B').closest('div[style*="opacity"]');
    expect(taskBCard).toHaveStyle('opacity: 0.6');

    // 4. Update Task A to COMPLETED
    const updateA = {
      type: 'NODE_STATUS_UPDATED',
      nodeId: MOCK_NODE_ID_1,
      status: 'COMPLETED',
    };

    await act(async () => {
      if (instances[0]?.onmessage) {
        instances[0].onmessage({ data: JSON.stringify(updateA) });
      }
    });

    // 5. Verify Task B is now unblocked (opacity 1)
    expect(taskBCard).toHaveStyle('opacity: 1');
  });

  it('handles Human-in-the-loop (HITL) approval integration', async () => {
    render(<ExecutionGraph sessionId={MOCK_SESSION_ID} />);

    const approvalNodeId = 'approval-123';
    const spawnApproval = {
      type: 'TASK_SPAWNED',
      node: { id: approvalNodeId, type: 'APPROVAL', status: 'PENDING', name: 'Wait for Approval' },
      dependencies: [],
    };

    await act(async () => {
      if (instances[0]?.onmessage) {
        instances[0].onmessage({ data: JSON.stringify(spawnApproval) });
      }
    });

    const requestApproval = {
      type: 'APPROVAL_REQUESTED',
      nodeId: approvalNodeId,
      payload: { diff: 'changes to review' },
    };

    await act(async () => {
      if (instances[0]?.onmessage) {
        instances[0].onmessage({ data: JSON.stringify(requestApproval) });
      }
    });

    expect(screen.getByText(/Human Approval Required/i)).toBeInTheDocument();

    const approveButton = screen.getByRole('button', { name: /Approve/i });
    await act(async () => {
      fireEvent.click(approveButton);
    });

    expect(screen.queryByText(/Human Approval Required/i)).not.toBeInTheDocument();

    const storeNode = useExecutionStore.getState().nodes[approvalNodeId];
    expect(storeNode.status).toBe('COMPLETED');
  });
});
