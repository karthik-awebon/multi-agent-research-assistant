'use client';

import { useEffect } from 'react';
import { useExecutionStore } from '../store/execution-store';
import { useGraphLayout } from '../hooks/use-graph-layout';
import { computeTopologicalState } from '../utils/topological-sort';
import { ExecutionNodeCard } from './ExecutionNodeCard';
import { AgentEvent } from '../schemas/agent-events';

export function ExecutionGraph() {
  const storeState = useExecutionStore();
  const layout = useGraphLayout(storeState);
  const { blockedNodes } = computeTopologicalState(storeState);

  // Set up a mock stream for demonstration purposes
  useEffect(() => {
    let active = true;

    const mockEvents: AgentEvent[] = [
      {
        type: 'TASK_SPAWNED',
        node: { id: '1', type: 'TASK', status: 'COMPLETED', name: 'Initialize Research' },
        dependencies: [],
      },
      {
        type: 'TASK_SPAWNED',
        node: { id: '2', type: 'TASK', status: 'RUNNING', name: 'Gather Data Sources' },
        dependencies: ['1'],
      },
      {
        type: 'TASK_SPAWNED',
        node: { id: '3', type: 'TOOL_CALL', status: 'PENDING', name: 'Search Web API' },
        dependencies: ['2'],
      },
      {
        type: 'TASK_SPAWNED',
        node: { id: '4', type: 'APPROVAL', status: 'LOCKED', name: 'Review Search Query', payload: { query: 'NextJS Architecture' } },
        dependencies: ['2'],
      },
      {
        type: 'TASK_SPAWNED',
        node: { id: '5', type: 'TASK', status: 'PENDING', name: 'Summarize Results' },
        dependencies: ['3', '4'],
      }
    ];

    const dispatchMockEvents = async () => {
      for (let i = 0; i < mockEvents.length; i++) {
        if (!active) break;
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 1500));
        if (!active) break;
        storeState.dispatch(mockEvents[i]);
      }
    };

    dispatchMockEvents();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Render edge paths safely
  const renderEdges = () => {
    return layout.edges.map((edge) => {
      if (!edge.points || edge.points.length === 0) return null;
      
      const d = edge.points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');

      return (
        <path
          key={edge.id}
          d={d}
          fill="none"
          stroke="#334155"
          strokeWidth="2"
          className="transition-all duration-300"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  const isNodeBlocked = (nodeId: string) => {
    return blockedNodes.some(n => n.id === nodeId);
  };

  return (
    <div className="relative w-full h-full min-h-[800px] bg-slate-950 overflow-auto border border-slate-800 rounded-xl">
      {/* SVG Layer for Connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: layout.width + 100, height: layout.height + 100 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#334155" />
          </marker>
        </defs>
        {renderEdges()}
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
