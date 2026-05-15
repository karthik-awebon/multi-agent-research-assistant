'use client';

import { ExecutionNode, LayoutNode } from '../types';
import { ApprovalFence } from './ApprovalFence';
import { useNodeStatus } from '../hooks/use-node-status';

interface ExecutionNodeCardProps {
  node: ExecutionNode;
  layout: LayoutNode;
  isBlocked: boolean;
  sessionId: string;
}

export function ExecutionNodeCard({ node, layout, isBlocked, sessionId }: ExecutionNodeCardProps) {
  const config = useNodeStatus(node, isBlocked);

  const left = layout.x - layout.width / 2;
  const top = layout.y - layout.height / 2;

  return (
    <div
      className={`absolute flex flex-col rounded-xl border-2 p-4 shadow-lg transition-all duration-300 backdrop-blur-md ${config.borderColor} ${config.bgColor}`}
      style={{
        left,
        top,
        width: layout.width,
        height: layout.height,
        opacity: isBlocked ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
          {node.type}
        </span>
        {config.icon}
      </div>

      <h3 className="font-semibold text-slate-100 truncate" title={node.name}>
        {node.name}
      </h3>

      {node.status === 'LOCKED' && <ApprovalFence node={node} sessionId={sessionId} />}
    </div>
  );
}
