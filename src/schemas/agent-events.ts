import { z } from 'zod';
import { ExecutionNodeSchema } from './execution-graph';

/**
 * Event emitted when a new task is created and added to the graph.
 */
export const TaskSpawnedEventSchema = z.object({
  type: z.literal('TASK_SPAWNED'),
  node: ExecutionNodeSchema,
  dependencies: z.array(z.string().uuid()),
});

/**
 * Event emitted when an external tool execution starts.
 */
export const ToolCallStartedEventSchema = z.object({
  type: z.literal('TOOL_CALL_STARTED'),
  node: ExecutionNodeSchema,
  dependencies: z.array(z.string().uuid()),
});

/**
 * Event emitted when a node's status changes (e.g., from RUNNING to COMPLETED).
 */
export const NodeStatusUpdatedEventSchema = z.object({
  type: z.literal('NODE_STATUS_UPDATED'),
  nodeId: z.string().uuid(),
  status: ExecutionNodeSchema.shape.status,
  result: z.unknown().optional(),
  error: z.string().optional(),
});

/**
 * Event emitted when a task requires manual human intervention.
 */
export const ApprovalRequestedEventSchema = z.object({
  type: z.literal('APPROVAL_REQUESTED'),
  nodeId: z.string().uuid(),
  payload: z.unknown(),
});

/**
 * Event emitted when a human interaction is completed.
 */
export const ApprovalResolvedEventSchema = z.object({
  type: z.literal('APPROVAL_RESOLVED'),
  nodeId: z.string().uuid(),
  status: z.enum(['COMPLETED', 'FAILED']),
  result: z.unknown(),
});

/**
 * Discriminated union of all supported agent events.
 */
export const AgentEventSchema = z.discriminatedUnion('type', [
  TaskSpawnedEventSchema,
  ToolCallStartedEventSchema,
  NodeStatusUpdatedEventSchema,
  ApprovalRequestedEventSchema,
  ApprovalResolvedEventSchema,
]);

