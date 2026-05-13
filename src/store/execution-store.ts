import { create } from 'zustand';
import { ExecutionGraphState, ExecutionStore } from '../types';
import { logger } from '../utils/logger';

const initialState: ExecutionGraphState = {
  nodes: {},
  edges: {},
};

export const useExecutionStore = create<ExecutionStore>((set) => ({
  ...initialState,
  reset: () => {
    logger.debug('Resetting execution store to initial state');
    set(initialState);
  },
  dispatch: (event) => {
    logger.debug({ eventType: event.type }, `Dispatching event: ${event.type}`);
    
    set((state) => {
      const nextNodes = { ...state.nodes };
      const nextEdges = { ...state.edges };

      switch (event.type) {
        case 'TASK_SPAWNED':
        case 'TOOL_CALL_STARTED': {
          logger.debug({ nodeId: event.node.id, name: event.node.name }, `Spawning node: ${event.node.name}`);
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
            logger.debug({ nodeId: event.nodeId, status: event.status }, `Updating node status to: ${event.status}`);
            nextNodes[event.nodeId] = {
              ...nextNodes[event.nodeId],
              status: event.status,
              ...(event.result !== undefined && { result: event.result }),
              ...(event.error !== undefined && { error: event.error }),
            };
          } else {
            logger.warn({ nodeId: event.nodeId }, 'Attempted to update status of non-existent node');
          }
          break;
        }

        case 'APPROVAL_REQUESTED': {
          if (nextNodes[event.nodeId]) {
            logger.info({ nodeId: event.nodeId }, 'Human approval requested');
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
            logger.info({ nodeId: event.nodeId, status: event.status }, `Human approval resolved as: ${event.status}`);
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
    });
  },
}));

