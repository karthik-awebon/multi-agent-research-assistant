'use client';

import { ExecutionNode } from '../types';
import { useApprovalAction } from '../hooks/use-approval-action';

interface ApprovalFenceProps {
  node: ExecutionNode;
}

/**
 * Component to provide a Human-in-the-loop (HITL) approval interface.
 * Prevents further execution until an explicit action is taken.
 */
export function ApprovalFence({ node }: ApprovalFenceProps) {
  const { approve, reject } = useApprovalAction(node.id);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 rounded-xl backdrop-blur-sm p-4">
      <p className="text-xs text-amber-400 font-medium mb-3 text-center">
        Human Approval Required
      </p>
      <div className="flex gap-2 w-full">
        <button
          onClick={approve}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-2 rounded transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => reject()}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 px-2 rounded transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
