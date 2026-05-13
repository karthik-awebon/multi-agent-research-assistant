'use client';

import { LayoutEdge } from '../types';
import { GRAPH_CONFIG } from '../constants';

interface ExecutionEdgesProps {
  edges: LayoutEdge[];
}

/**
 * Component to render SVG paths representing edges between execution nodes.
 */
export function ExecutionEdges({ edges }: ExecutionEdgesProps) {
  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={GRAPH_CONFIG.THEME.EDGE_COLOR} />
        </marker>
      </defs>
      {edges.map((edge) => {
        if (!edge.points || edge.points.length === 0) return null;

        const d = edge.points
          .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
          .join(' ');

        return (
          <path
            key={edge.id}
            d={d}
            fill="none"
            stroke={GRAPH_CONFIG.THEME.EDGE_COLOR}
            strokeWidth={GRAPH_CONFIG.THEME.EDGE_WIDTH}
            className="transition-all"
            style={{ transitionDuration: `${GRAPH_CONFIG.THEME.TRANSITION_DURATION}ms` }}
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </>
  );
}
