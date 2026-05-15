'use client';

import { useExecutionStore } from '../store/execution-store';
import { useGraphLayout } from '../hooks/use-graph-layout';
import { useExecutionEvents } from '../hooks/use-execution-events';
import { computeTopologicalState } from '../utils/topological-sort';
import { ExecutionNodeCard } from './ExecutionNodeCard';
import { ExecutionEdges } from './ExecutionEdges';

interface ExecutionGraphProps {
  sessionId: string;
}

export function ExecutionGraph({ sessionId }: ExecutionGraphProps) {
  const storeState = useExecutionStore();
  const layout = useGraphLayout(storeState);
  const { blockedNodes } = computeTopologicalState(storeState);

  useExecutionEvents(sessionId);

  const isNodeBlocked = (nodeId: string) => blockedNodes.some((n) => n.id === nodeId);

  return (
    <div className="relative w-full h-full min-h-[800px] bg-slate-950 overflow-auto border border-slate-800 rounded-xl">
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: layout.width + 100, height: layout.height + 100 }}
      >
        <ExecutionEdges edges={layout.edges} />
      </svg>

      <div
        className="absolute inset-0"
        style={{ width: layout.width + 100, height: layout.height + 100 }}
      >
        {layout.nodes.map((layoutNode) => {
          const stateNode = storeState.nodes[layoutNode.id];
          if (!stateNode) return null;

          return (
            <ExecutionNodeCard
              key={layoutNode.id}
              node={stateNode}
              layout={layoutNode}
              isBlocked={isNodeBlocked(stateNode.id)}
              sessionId={sessionId}
            />
          );
        })}
      </div>
    </div>
  );
}
