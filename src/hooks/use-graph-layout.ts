import { useMemo } from 'react';
import dagre from 'dagre';
import { ExecutionGraphState, LayoutNode, LayoutEdge, GraphLayout } from '../types';
import { GRAPH_CONFIG } from '../constants';
import { logger } from '../utils/logger';

export function useGraphLayout(state: ExecutionGraphState): GraphLayout {
  return useMemo(() => {
    const nodeCount = Object.keys(state.nodes).length;
    if (nodeCount === 0) return { nodes: [], edges: [], width: 0, height: 0 };

    logger.debug({ nodeCount, edgeCount: Object.keys(state.edges).length }, 'Computing graph layout');

    const g = new dagre.graphlib.Graph();
    g.setGraph(GRAPH_CONFIG.LAYOUT);
    g.setDefaultEdgeLabel(() => ({}));

    Object.values(state.nodes).forEach((node) => {
      g.setNode(node.id, { width: GRAPH_CONFIG.NODE_WIDTH, height: GRAPH_CONFIG.NODE_HEIGHT });
    });

    Object.values(state.edges).forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

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

    const layoutEdges: LayoutEdge[] = g.edges().map((e) => {
      const edge = g.edge(e);
      const edgeId = `${e.v}->${e.w}`;
      return {
        id: edgeId,
        source: e.v,
        target: e.w,
        points: edge.points,
      };
    });

    const graphLabel = g.graph();
    const width = graphLabel.width && graphLabel.width !== -Infinity ? graphLabel.width : 0;
    const height = graphLabel.height && graphLabel.height !== -Infinity ? graphLabel.height : 0;

    logger.debug({ width, height }, 'Layout computation complete');

    return { nodes: layoutNodes, edges: layoutEdges, width, height };
  }, [state.nodes, state.edges]);
}
