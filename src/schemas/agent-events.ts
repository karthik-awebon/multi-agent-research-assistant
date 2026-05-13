import { z } from 'zod';
import { ExecutionNodeSchema } from './execution-graph';

export const TaskSpawnedEventSchema = z.object({
  type: z.literal('TASK_SPAWNED'),
  node: ExecutionNodeSchema,
  dependencies: z.array(z.string().uuid()),
});

export const ToolCallStartedEventSchema = z.object({
  type: z.literal('TOOL_CALL_STARTED'),
  node: ExecutionNodeSchema,
  dependencies: z.array(z.string().uuid()),
});

export const NodeStatusUpdatedEventSchema = z.object({
  type: z.literal('NODE_STATUS_UPDATED'),
  nodeId: z.string().uuid(),
  status: ExecutionNodeSchema.shape.status,
  result: z.unknown().optional(),
  error: z.string().optional(),
});

export const ApprovalRequestedEventSchema = z.object({
  type: z.literal('APPROVAL_REQUESTED'),
  nodeId: z.string().uuid(),
  payload: z.unknown(),
});

export const ApprovalResolvedEventSchema = z.object({
  type: z.literal('APPROVAL_RESOLVED'),
  nodeId: z.string().uuid(),
  status: z.enum(['COMPLETED', 'FAILED']),
  result: z.unknown(),
});

export const AgentEventSchema = z.discriminatedUnion('type', [
  TaskSpawnedEventSchema,
  ToolCallStartedEventSchema,
  NodeStatusUpdatedEventSchema,
  ApprovalRequestedEventSchema,
  ApprovalResolvedEventSchema,
]);

export type AgentEvent = z.infer<typeof AgentEventSchema>;
