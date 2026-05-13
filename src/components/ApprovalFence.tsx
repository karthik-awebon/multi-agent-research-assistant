'use client';

import { ExecutionNode } from '../schemas/execution-graph';
import { useExecutionStore } from '../store/execution-store';

interface ApprovalFenceProps {
  node: ExecutionNode;
}

export function ApprovalFence({ node }: ApprovalFenceProps) {
  const dispatch = useExecutionStore((state) => state.dispatch);

  const handleApprove = () => {
    dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId: node.id,
      status: 'COMPLETED',
      result: { approved: true, timestamp: Date.now() },
    });
  };

  const handleReject = () => {
    dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId: node.id,
      status: 'FAILED',
      result: { approved: false, reason: 'Human intervention rejected.' },
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 rounded-xl backdrop-blur-sm p-4">
      <p className="text-xs text-amber-400 font-medium mb-3 text-center">
        Human Approval Required
      </p>
      <div className="flex gap-2 w-full">
        <button
          onClick={handleApprove}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-2 rounded transition-colors"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 px-2 rounded transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
