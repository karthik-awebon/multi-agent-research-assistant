import { ExecutionGraphState, ExecutionNode } from '../schemas/execution-graph';

export interface TopologicalInfo {
  unblockedNodes: ExecutionNode[];
  blockedNodes: ExecutionNode[];
}

export function computeTopologicalState(state: ExecutionGraphState): TopologicalInfo {
  const { nodes, edges } = state;
  const unblockedNodes: ExecutionNode[] = [];
  const blockedNodes: ExecutionNode[] = [];

  // Map of targetId -> list of source node IDs
  const incomingEdges: Record<string, string[]> = {};
  Object.values(edges).forEach((edge) => {
    if (!incomingEdges[edge.target]) {
      incomingEdges[edge.target] = [];
    }
    incomingEdges[edge.target].push(edge.source);
  });

  Object.values(nodes).forEach((node) => {
    const dependencies = incomingEdges[node.id] || [];
    
    // Node is unblocked if it has no dependencies, or all dependencies are COMPLETED
    const isUnblocked = dependencies.every((depId) => {
      const depNode = nodes[depId];
      return depNode && depNode.status === 'COMPLETED';
    });

    if (isUnblocked) {
      unblockedNodes.push(node);
    } else {
      blockedNodes.push(node);
    }
  });

  return { unblockedNodes, blockedNodes };
}
