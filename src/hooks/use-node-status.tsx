'use client';

import { JSX } from 'react';
import { Loader2, CheckCircle2, XCircle, Lock, Clock } from 'lucide-react';
import { ExecutionNode } from '../types';

interface StatusConfig {
  icon: JSX.Element;
  borderColor: string;
  bgColor: string;
}

/**
 * Hook to determine the visual configuration of an execution node based on its status.
 */
export function useNodeStatus(node: ExecutionNode, isBlocked: boolean): StatusConfig {
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
}
