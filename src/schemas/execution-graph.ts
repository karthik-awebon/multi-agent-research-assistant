import { z } from 'zod';

export const ExecutionNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['TASK', 'TOOL_CALL', 'APPROVAL']),
  status: z.enum(['PENDING', 'RUNNING', 'LOCKED', 'COMPLETED', 'FAILED']),
  name: z.string(),
  payload: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

export type ExecutionNode = z.infer<typeof ExecutionNodeSchema>;

export const ExecutionEdgeSchema = z.object({
  id: z.string(),
  source: z.string().uuid(),
  target: z.string().uuid(),
});

export type ExecutionEdge = z.infer<typeof ExecutionEdgeSchema>;

export const ExecutionGraphStateSchema = z.object({
  nodes: z.record(z.string(), ExecutionNodeSchema),
  edges: z.record(z.string(), ExecutionEdgeSchema),
});

export type ExecutionGraphState = z.infer<typeof ExecutionGraphStateSchema>;
