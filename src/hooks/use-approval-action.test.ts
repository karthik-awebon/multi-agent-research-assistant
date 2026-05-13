import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApprovalAction } from './use-approval-action';
import { useExecutionStore } from '../store/execution-store';
import { MOCK_NODE_ID_3 } from '../__mocks__/data';

describe('useApprovalAction', () => {
  beforeEach(() => {
    useExecutionStore.getState().reset();
    // Pre-populate store with the node to be approved/rejected
    useExecutionStore.setState({
      nodes: {
        [MOCK_NODE_ID_3]: {
          id: MOCK_NODE_ID_3,
          type: 'APPROVAL',
          status: 'LOCKED',
          name: 'Human Approval',
        }
      }
    });
  });

  it('updates store with COMPLETED status on approve', () => {
    const { result } = renderHook(() => useApprovalAction(MOCK_NODE_ID_3));

    act(() => {
      result.current.approve();
    });

    const node = useExecutionStore.getState().nodes[MOCK_NODE_ID_3];
    expect(node.status).toBe('COMPLETED');
    expect(node.result).toEqual(expect.objectContaining({ approved: true }));
  });

  it('updates store with FAILED status on reject', () => {
    const { result } = renderHook(() => useApprovalAction(MOCK_NODE_ID_3));

    act(() => {
      result.current.reject('Denied by user');
    });

    const node = useExecutionStore.getState().nodes[MOCK_NODE_ID_3];
    expect(node.status).toBe('FAILED');
    expect(node.result).toEqual(expect.objectContaining({ approved: false, reason: 'Denied by user' }));
  });
});
