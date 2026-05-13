import { create } from 'zustand';
import { ExecutionGraphState } from '../schemas/execution-graph';
import { AgentEvent } from '../schemas/agent-events';

interface ExecutionStore extends ExecutionGraphState {
  dispatch: (event: AgentEvent) => void;
  reset: () => void;
}

const initialState: ExecutionGraphState = {
  nodes: {},
  edges: {},
};

export const useExecutionStore = create<ExecutionStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  dispatch: (event) =>
    set((state) => {
      const nextNodes = { ...state.nodes };
      const nextEdges = { ...state.edges };

      switch (event.type) {
        case 'TASK_SPAWNED':
        case 'TOOL_CALL_STARTED': {
          nextNodes[event.node.id] = event.node;
          event.dependencies.forEach((depId) => {
            const edgeId = `${depId}->${event.node.id}`;
            nextEdges[edgeId] = {
              id: edgeId,
              source: depId,
              target: event.node.id,
            };
          });
          break;
        }

        case 'NODE_STATUS_UPDATED': {
          if (nextNodes[event.nodeId]) {
            nextNodes[event.nodeId] = {
              ...nextNodes[event.nodeId],
              status: event.status,
              ...(event.result !== undefined && { result: event.result }),
              ...(event.error !== undefined && { error: event.error }),
            };
          }
          break;
        }

        case 'APPROVAL_REQUESTED': {
          if (nextNodes[event.nodeId]) {
            nextNodes[event.nodeId] = {
              ...nextNodes[event.nodeId],
              status: 'LOCKED',
              payload: event.payload,
            };
          }
          break;
        }

        case 'APPROVAL_RESOLVED': {
          if (nextNodes[event.nodeId]) {
            nextNodes[event.nodeId] = {
              ...nextNodes[event.nodeId],
              status: event.status,
              result: event.result,
            };
          }
          break;
        }

        default:
          break;
      }

      return { nodes: nextNodes, edges: nextEdges };
    }),
}));
