'use client';

import { ExecutionNode } from '../schemas/execution-graph';
import { LayoutNode } from '../hooks/use-graph-layout';
import { Loader2, CheckCircle2, XCircle, Lock, Clock } from 'lucide-react';
import { ApprovalFence } from './ApprovalFence';

interface ExecutionNodeCardProps {
  node: ExecutionNode;
  layout: LayoutNode;
  isBlocked: boolean;
}

export function ExecutionNodeCard({ node, layout, isBlocked }: ExecutionNodeCardProps) {
  // Center Dagre coords (x,y is center, need to convert to top-left)
  const left = layout.x - layout.width / 2;
  const top = layout.y - layout.height / 2;

  const getStatusConfig = () => {
    switch (node.status) {
      case 'RUNNING':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-blue-500" />,
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-500/10',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          borderColor: 'border-emerald-500',
          bgColor: 'bg-emerald-500/10',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-500" />,
          borderColor: 'border-rose-500',
          bgColor: 'bg-rose-500/10',
        };
      case 'LOCKED':
        return {
          icon: <Lock className="w-5 h-5 text-amber-500" />,
          borderColor: 'border-amber-500',
          bgColor: 'bg-amber-500/10',
        };
      case 'PENDING':
      default:
        return {
          icon: <Clock className="w-5 h-5 text-slate-400" />,
          borderColor: isBlocked ? 'border-slate-800' : 'border-slate-500',
          bgColor: isBlocked ? 'bg-slate-900/50' : 'bg-slate-800',
        };
    }
  };

  const config = getStatusConfig();

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
      
      {node.status === 'LOCKED' && <ApprovalFence node={node} />}
    </div>
  );
}
