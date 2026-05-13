'use client';

import { useExecutionStore } from '../store/execution-store';
import { logger } from '../utils/logger';

/**
 * Hook to manage human-in-the-loop approval actions.
 */
export function useApprovalAction(nodeId: string) {
  const dispatch = useExecutionStore((state) => state.dispatch);

  const approve = () => {
    logger.info({ nodeId }, 'User clicked APPROVE');
    dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId,
      status: 'COMPLETED',
      result: { approved: true, timestamp: Date.now() },
    });
  };

  const reject = (reason: string = 'Human intervention rejected.') => {
    logger.info({ nodeId, reason }, 'User clicked REJECT');
    dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId,
      status: 'FAILED',
      result: { approved: false, reason },
    });
  };

  return { approve, reject };
}
