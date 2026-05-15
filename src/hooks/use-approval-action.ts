'use client';

import { useExecutionStore } from '../store/execution-store';
import { APP_CONFIG } from '../constants';
import { logger } from '../utils/logger';

export function useApprovalAction(nodeId: string, sessionId: string) {
  const dispatch = useExecutionStore((state) => state.dispatch);

  const resolve = async (approved: boolean, reason?: string) => {
    logger.info({ nodeId, approved }, `User clicked ${approved ? 'APPROVE' : 'REJECT'}`);

    // Optimistic UI update so the graph reflects the decision immediately
    dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId,
      status: approved ? 'COMPLETED' : 'FAILED',
      result: { approved, reason: reason ?? null, timestamp: Date.now() },
    });

    // Signal the backend so the blocked orchestrator can resume
    try {
      await fetch(APP_CONFIG.ENDPOINTS.APPROVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, nodeId, approved, reason }),
      });
    } catch (err) {
      logger.error({ err, nodeId, sessionId }, 'Failed to POST approval to backend');
    }
  };

  return {
    approve: () => resolve(true),
    reject: (reason = 'Human intervention rejected.') => resolve(false, reason),
  };
}
