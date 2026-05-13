import { z } from 'zod';

/**
 * Schema for an individual execution node.
 * Validates the node's identity, type, and lifecycle status.
 */
export const ExecutionNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['TASK', 'TOOL_CALL', 'APPROVAL']),
  status: z.enum(['PENDING', 'RUNNING', 'LOCKED', 'COMPLETED', 'FAILED']),
  name: z.string(),
  payload: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

/**
 * Schema for a directional edge between nodes.
 */
export const ExecutionEdgeSchema = z.object({
  id: z.string(),
  source: z.string().uuid(),
  target: z.string().uuid(),
});

/**
 * Schema for the entire graph state.
 */
export const ExecutionGraphStateSchema = z.object({
  nodes: z.record(z.string(), ExecutionNodeSchema),
  edges: z.record(z.string(), ExecutionEdgeSchema),
});

