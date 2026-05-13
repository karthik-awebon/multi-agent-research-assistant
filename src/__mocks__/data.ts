import { ExecutionNode, ExecutionEdge, AgentEvent } from '../types';

export const MOCK_NODE_ID_1 = '550e8400-e29b-41d4-a716-446655440001';
export const MOCK_NODE_ID_2 = '550e8400-e29b-41d4-a716-446655440002';
export const MOCK_NODE_ID_3 = '550e8400-e29b-41d4-a716-446655440003';

export const MOCK_NODES: Record<string, ExecutionNode> = {
  [MOCK_NODE_ID_1]: {
    id: MOCK_NODE_ID_1,
    type: 'TASK',
    status: 'COMPLETED',
    name: 'Initial Task',
  },
  [MOCK_NODE_ID_2]: {
    id: MOCK_NODE_ID_2,
    type: 'TOOL_CALL',
    status: 'RUNNING',
    name: 'Tool Execution',
  },
  [MOCK_NODE_ID_3]: {
    id: MOCK_NODE_ID_3,
    type: 'APPROVAL',
    status: 'LOCKED',
    name: 'Human Approval',
    payload: { details: 'test' },
  },
};

export const MOCK_EDGES: Record<string, ExecutionEdge> = {
  [`${MOCK_NODE_ID_1}->${MOCK_NODE_ID_2}`]: {
    id: `${MOCK_NODE_ID_1}->${MOCK_NODE_ID_2}`,
    source: MOCK_NODE_ID_1,
    target: MOCK_NODE_ID_2,
  },
};

export const MOCK_GRAPH_STATE = {
  nodes: MOCK_NODES,
  edges: MOCK_EDGES,
};

export const MOCK_EVENTS: AgentEvent[] = [
  {
    type: 'TASK_SPAWNED',
    node: MOCK_NODES[MOCK_NODE_ID_1],
    dependencies: [],
  },
  {
    type: 'NODE_STATUS_UPDATED',
    nodeId: MOCK_NODE_ID_1,
    status: 'RUNNING',
  },
];
