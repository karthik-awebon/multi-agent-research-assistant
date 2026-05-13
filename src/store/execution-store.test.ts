import { describe, it, expect, beforeEach } from 'vitest';
import { useExecutionStore } from './execution-store';

describe('executionStore', () => {
  beforeEach(() => {
    useExecutionStore.getState().reset();
  });

  it('adds a node and edges on TASK_SPAWNED', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000';
    const depId = '550e8400-e29b-41d4-a716-446655440001';
    
    useExecutionStore.getState().dispatch({
      type: 'TASK_SPAWNED',
      node: { id: nodeId, type: 'TASK', status: 'PENDING', name: 'Test Task' },
      dependencies: [depId],
    });

    const state = useExecutionStore.getState();
    expect(state.nodes[nodeId]).toBeDefined();
    expect(state.nodes[nodeId].name).toBe('Test Task');
    expect(state.edges[`${depId}->${nodeId}`]).toBeDefined();
  });

  it('updates node status on NODE_STATUS_UPDATED', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000';
    
    // First spawn
    useExecutionStore.getState().dispatch({
      type: 'TASK_SPAWNED',
      node: { id: nodeId, type: 'TASK', status: 'PENDING', name: 'Test Task' },
      dependencies: [],
    });

    // Then update
    useExecutionStore.getState().dispatch({
      type: 'NODE_STATUS_UPDATED',
      nodeId,
      status: 'COMPLETED',
      result: { success: true },
    });

    const state = useExecutionStore.getState();
    expect(state.nodes[nodeId].status).toBe('COMPLETED');
    expect(state.nodes[nodeId].result).toEqual({ success: true });
  });

  it('locks a node on APPROVAL_REQUESTED', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000';
    
    useExecutionStore.getState().dispatch({
      type: 'TASK_SPAWNED',
      node: { id: nodeId, type: 'APPROVAL', status: 'PENDING', name: 'Approve Me' },
      dependencies: [],
    });

    useExecutionStore.getState().dispatch({
      type: 'APPROVAL_REQUESTED',
      nodeId,
      payload: { diff: 'abc' },
    });

    const state = useExecutionStore.getState();
    expect(state.nodes[nodeId].status).toBe('LOCKED');
    expect(state.nodes[nodeId].payload).toEqual({ diff: 'abc' });
  });

  it('resolves approval on APPROVAL_RESOLVED', () => {
    const nodeId = '550e8400-e29b-41d4-a716-446655440000';
    
    useExecutionStore.getState().dispatch({
      type: 'TASK_SPAWNED',
      node: { id: nodeId, type: 'APPROVAL', status: 'LOCKED', name: 'Approve Me' },
      dependencies: [],
    });

    useExecutionStore.getState().dispatch({
      type: 'APPROVAL_RESOLVED',
      nodeId,
      status: 'COMPLETED',
      result: { approved: true },
    });

    const state = useExecutionStore.getState();
    expect(state.nodes[nodeId].status).toBe('COMPLETED');
    expect(state.nodes[nodeId].result).toEqual({ approved: true });
  });
});
