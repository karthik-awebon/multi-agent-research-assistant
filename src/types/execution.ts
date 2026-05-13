import { z } from 'zod';
import type { 
  ExecutionNodeSchema, 
  ExecutionEdgeSchema, 
  ExecutionGraphStateSchema 
} from '../schemas/execution-graph';

/**
 * Represents an individual unit of work in the execution graph.
 */
export type ExecutionNode = z.infer<typeof ExecutionNodeSchema>;

/**
 * Represents a dependency connection between two execution nodes.
 */
export type ExecutionEdge = z.infer<typeof ExecutionEdgeSchema>;

/**
 * The full state of the execution graph, including all nodes and edges.
 */
export type ExecutionGraphState = z.infer<typeof ExecutionGraphStateSchema>;
