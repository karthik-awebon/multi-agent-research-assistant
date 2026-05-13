import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNodeStatus } from './use-node-status';
import { MOCK_NODES, MOCK_NODE_ID_1, MOCK_NODE_ID_2, MOCK_NODE_ID_3 } from '../__mocks__/data';

describe('useNodeStatus', () => {
  it('returns correct config for RUNNING status', () => {
    const node = MOCK_NODES[MOCK_NODE_ID_2]; // RUNNING
    const { result } = renderHook(() => useNodeStatus(node, false));
    
    expect(result.current.borderColor).toBe('border-blue-500');
    expect(result.current.bgColor).toBe('bg-blue-500/10');
  });

  it('returns correct config for COMPLETED status', () => {
    const node = MOCK_NODES[MOCK_NODE_ID_1]; // COMPLETED
    const { result } = renderHook(() => useNodeStatus(node, false));
    
    expect(result.current.borderColor).toBe('border-emerald-500');
    expect(result.current.bgColor).toBe('bg-emerald-500/10');
  });

  it('returns correct config for LOCKED status', () => {
    const node = MOCK_NODES[MOCK_NODE_ID_3]; // LOCKED
    const { result } = renderHook(() => useNodeStatus(node, false));
    
    expect(result.current.borderColor).toBe('border-amber-500');
    expect(result.current.bgColor).toBe('bg-amber-500/10');
  });

  it('returns correct config for PENDING status (not blocked)', () => {
    const node = { ...MOCK_NODES[MOCK_NODE_ID_1], status: 'PENDING' as const };
    const { result } = renderHook(() => useNodeStatus(node, false));
    
    expect(result.current.borderColor).toBe('border-slate-500');
    expect(result.current.bgColor).toBe('bg-slate-800');
  });

  it('returns correct config for PENDING status (blocked)', () => {
    const node = { ...MOCK_NODES[MOCK_NODE_ID_1], status: 'PENDING' as const };
    const { result } = renderHook(() => useNodeStatus(node, true));
    
    expect(result.current.borderColor).toBe('border-slate-800');
    expect(result.current.bgColor).toBe('bg-slate-900/50');
  });

  it('returns correct config for FAILED status', () => {
    const node = { ...MOCK_NODES[MOCK_NODE_ID_1], status: 'FAILED' as const };
    const { result } = renderHook(() => useNodeStatus(node, false));
    
    expect(result.current.borderColor).toBe('border-rose-500');
    expect(result.current.bgColor).toBe('bg-rose-500/10');
  });
});
