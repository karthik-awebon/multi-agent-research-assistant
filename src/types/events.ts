import { z } from 'zod';
import type { AgentEventSchema } from '../schemas/agent-events';

/**
 * Discriminated union of all possible events emitted by the agent system.
 * Used to update the execution graph state in real-time.
 */
export type AgentEvent = z.infer<typeof AgentEventSchema>;
