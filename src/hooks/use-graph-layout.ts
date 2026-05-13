import { useMemo } from 'react';
import dagre from 'dagre';
import { ExecutionGraphState } from '../schemas/execution-graph';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  points: { x: number; y: number }[];
}

export interface GraphLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;

export function useGraphLayout(state: ExecutionGraphState): GraphLayout {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', marginx: 40, marginy: 40, nodesep: 60, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to layout engine
    Object.values(state.nodes).forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Add edges to layout engine
    Object.values(state.edges).forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Compute layout
    dagre.layout(g);

    // Extract positioned nodes
    const layoutNodes: LayoutNode[] = g.nodes().map((v) => {
      const node = g.node(v);
      return {
        id: v,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      };
    });

    // Extract positioned edges
    const layoutEdges: LayoutEdge[] = g.edges().map((e) => {
      const edge = g.edge(e);
      // Construct a unique edge ID matching our schema
      const edgeId = `${e.v}->${e.w}`;
      return {
        id: edgeId,
        source: e.v,
        target: e.w,
        points: edge.points,
      };
    });

    const graphLabel = g.graph();

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      width: graphLabel.width || 0,
      height: graphLabel.height || 0,
    };
  }, [state.nodes, state.edges]);
}
