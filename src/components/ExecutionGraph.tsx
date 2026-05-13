'use client';

import { useExecutionStore } from '../store/execution-store';
import { useGraphLayout } from '../hooks/use-graph-layout';
import { useExecutionEvents } from '../hooks/use-execution-events';
import { computeTopologicalState } from '../utils/topological-sort';
import { ExecutionNodeCard } from './ExecutionNodeCard';
import { ExecutionEdges } from './ExecutionEdges';
import { APP_CONFIG } from '../constants';

/**
 * Main component for visualizing the agent execution graph.
 * Orchestrates layout, events, and rendering of nodes and edges.
 */
export function ExecutionGraph() {
  const storeState = useExecutionStore();
  const layout = useGraphLayout(storeState);
  const { blockedNodes } = computeTopologicalState(storeState);

  // Subscribe to real-time execution events
  useExecutionEvents(APP_CONFIG.ENDPOINTS.EVENTS);

  const isNodeBlocked = (nodeId: string) => {
    return blockedNodes.some((n) => n.id === nodeId);
  };

  return (
    <div className="relative w-full h-full min-h-[800px] bg-slate-950 overflow-auto border border-slate-800 rounded-xl">
      {/* SVG Layer for Connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: layout.width + 100, height: layout.height + 100 }}
      >
        <ExecutionEdges edges={layout.edges} />
      </svg>

      {/* HTML Layer for Node Cards */}
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
            />
          );
        })}
      </div>
    </div>
  );
}
