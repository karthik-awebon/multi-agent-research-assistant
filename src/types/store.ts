import { ExecutionGraphState } from './execution';
import { AgentEvent } from './events';

/**
 * Interface for the global execution store managed by Zustand.
 */
export interface ExecutionStore extends ExecutionGraphState {
  /** Dispatches an agent event to update the graph state */
  dispatch: (event: AgentEvent) => void;
  /** Resets the graph to its initial empty state */
  reset: () => void;
}
