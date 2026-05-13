import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGraphLayout } from './use-graph-layout';
import { MOCK_GRAPH_STATE } from '../__mocks__/data';

describe('useGraphLayout', () => {
  it('computes layout for nodes and edges', () => {
    const { result } = renderHook(() => useGraphLayout(MOCK_GRAPH_STATE));

    expect(result.current.nodes).toHaveLength(Object.keys(MOCK_GRAPH_STATE.nodes).length);
    expect(result.current.edges).toHaveLength(Object.keys(MOCK_GRAPH_STATE.edges).length);
    
    // Check if positions are defined
    result.current.nodes.forEach(node => {
      expect(node.x).toBeDefined();
      expect(node.y).toBeDefined();
    });

    expect(result.current.width).toBeGreaterThan(0);
    expect(result.current.height).toBeGreaterThan(0);
  });

  it('handles empty state gracefully', () => {
    const emptyState = { nodes: {}, edges: {} };
    const { result } = renderHook(() => useGraphLayout(emptyState));

    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.width).toBeGreaterThanOrEqual(0);
    expect(result.current.height).toBeGreaterThanOrEqual(0);
  });
});
