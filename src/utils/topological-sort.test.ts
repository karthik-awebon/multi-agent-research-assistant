import { describe, it, expect } from 'vitest';
import { computeTopologicalState } from './topological-sort';
import { ExecutionGraphState } from '../types';
import { MOCK_NODE_ID_1, MOCK_NODE_ID_2 } from '../__mocks__/data';

describe('computeTopologicalState', () => {
  it('identifies unblocked nodes with no dependencies', () => {
    const state: ExecutionGraphState = {
      nodes: {
        [MOCK_NODE_ID_1]: { id: MOCK_NODE_ID_1, type: 'TASK', status: 'PENDING', name: 'Task 1' },
      },
      edges: {},
    };

    const { unblockedNodes, blockedNodes } = computeTopologicalState(state);
    expect(unblockedNodes).toHaveLength(1);
    expect(unblockedNodes[0].id).toBe(MOCK_NODE_ID_1);
    expect(blockedNodes).toHaveLength(0);
  });

  it('blocks nodes whose dependencies are not completed', () => {
    const state: ExecutionGraphState = {
      nodes: {
        [MOCK_NODE_ID_1]: { id: MOCK_NODE_ID_1, type: 'TASK', status: 'RUNNING', name: 'Task 1' },
        [MOCK_NODE_ID_2]: { id: MOCK_NODE_ID_2, type: 'TASK', status: 'PENDING', name: 'Task 2' },
      },
      edges: {
        [`${MOCK_NODE_ID_1}->${MOCK_NODE_ID_2}`]: { id: 'e1', source: MOCK_NODE_ID_1, target: MOCK_NODE_ID_2 },
      },
    };

    const { unblockedNodes, blockedNodes } = computeTopologicalState(state);
    expect(unblockedNodes.map(n => n.id)).toContain(MOCK_NODE_ID_1);
    expect(blockedNodes.map(n => n.id)).toContain(MOCK_NODE_ID_2);
  });

  it('unblocks nodes when all dependencies are completed', () => {
    const state: ExecutionGraphState = {
      nodes: {
        [MOCK_NODE_ID_1]: { id: MOCK_NODE_ID_1, type: 'TASK', status: 'COMPLETED', name: 'Task 1' },
        [MOCK_NODE_ID_2]: { id: MOCK_NODE_ID_2, type: 'TASK', status: 'PENDING', name: 'Task 2' },
        },
        edges: {
        [`${MOCK_NODE_ID_1}->${MOCK_NODE_ID_2}`]: { id: 'e1', source: MOCK_NODE_ID_1, target: MOCK_NODE_ID_2 },
        },
        };


    const { unblockedNodes, blockedNodes } = computeTopologicalState(state);
    expect(unblockedNodes.map(n => n.id)).toContain(MOCK_NODE_ID_1);
    expect(unblockedNodes.map(n => n.id)).toContain(MOCK_NODE_ID_2);
    expect(blockedNodes).toHaveLength(0);
  });

  it('handles complex branching dependencies', () => {
    const state: ExecutionGraphState = {
      nodes: {
        '1': { id: '1', type: 'TASK', status: 'COMPLETED', name: 'T1' },
        '2': { id: '2', type: 'TASK', status: 'COMPLETED', name: 'T2' },
        '3': { id: '3', type: 'TASK', status: 'PENDING', name: 'T3' }, // blocked by 1, 2
        '4': { id: '4', type: 'TASK', status: 'PENDING', name: 'T4' }, // blocked by 3
      },
      edges: {
        '1->3': { id: '1->3', source: '1', target: '3' },
        '2->3': { id: '2->3', source: '2', target: '3' },
        '3->4': { id: '3->4', source: '3', target: '4' },
      },
    };

    const result1 = computeTopologicalState(state);
    expect(result1.unblockedNodes.map(n => n.id)).toContain('3');
    expect(result1.blockedNodes.map(n => n.id)).toContain('4');

    // After 3 completes
    const updatedState = {
      ...state,
      nodes: {
        ...state.nodes,
        '3': { ...state.nodes['3'], status: 'COMPLETED' as const }
      }
    };
    const result2 = computeTopologicalState(updatedState);
    expect(result2.unblockedNodes.map(n => n.id)).toContain('4');
    expect(result2.blockedNodes).toHaveLength(0);
  });
});
