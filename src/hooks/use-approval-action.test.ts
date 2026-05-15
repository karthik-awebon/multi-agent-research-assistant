import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApprovalAction } from './use-approval-action';
import { useExecutionStore } from '../store/execution-store';
import { MOCK_NODE_ID_3 } from '../__mocks__/data';

const MOCK_SESSION_ID = 'test-session-id';

describe('useApprovalAction', () => {
  beforeEach(() => {
    useExecutionStore.getState().reset();
    useExecutionStore.setState({
      nodes: {
        [MOCK_NODE_ID_3]: {
          id: MOCK_NODE_ID_3,
          type: 'APPROVAL',
          status: 'LOCKED',
          name: 'Human Approval',
        },
      },
    });
    // Mock fetch so the hook's backend POST doesn't fail in unit tests
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('updates store with COMPLETED status on approve', async () => {
    const { result } = renderHook(() => useApprovalAction(MOCK_NODE_ID_3, MOCK_SESSION_ID));

    await act(async () => {
      result.current.approve();
    });

    const node = useExecutionStore.getState().nodes[MOCK_NODE_ID_3];
    expect(node.status).toBe('COMPLETED');
    expect(node.result).toEqual(expect.objectContaining({ approved: true }));
  });

  it('updates store with FAILED status on reject', async () => {
    const { result } = renderHook(() => useApprovalAction(MOCK_NODE_ID_3, MOCK_SESSION_ID));

    await act(async () => {
      result.current.reject('Denied by user');
    });

    const node = useExecutionStore.getState().nodes[MOCK_NODE_ID_3];
    expect(node.status).toBe('FAILED');
    expect(node.result).toEqual(
      expect.objectContaining({ approved: false, reason: 'Denied by user' }),
    );
  });

  it('posts approval decision to backend', async () => {
    const { result } = renderHook(() => useApprovalAction(MOCK_NODE_ID_3, MOCK_SESSION_ID));

    await act(async () => {
      result.current.approve();
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/approve',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"approved":true'),
      }),
    );
  });
});
