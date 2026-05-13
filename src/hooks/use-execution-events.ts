'use client';

import { useEffect } from 'react';
import { AgentEvent } from '../types';
import { useExecutionStore } from '../store/execution-store';
import { APP_CONFIG } from '../constants';
import { logger } from '../utils/logger';

/**
 * Hook to manage real-time execution events via SSE.
 */
export function useExecutionEvents(endpoint: string = APP_CONFIG.ENDPOINTS.EVENTS) {
  const { dispatch } = useExecutionStore();

  useEffect(() => {
    logger.info({ endpoint }, 'Initializing SSE connection');
    let active = true;
    const eventSource = new EventSource(endpoint);

    eventSource.onopen = () => {
      logger.info({ endpoint }, 'SSE connection established');
    };

    eventSource.onmessage = (event) => {
      if (!active) return;
      
      try {
        if (event.data === '[DONE]') {
          logger.info('SSE stream completed via [DONE] signal');
          eventSource.close();
          return;
        }

        const parsedEvent: AgentEvent = JSON.parse(event.data);
        logger.debug({ eventType: parsedEvent.type }, 'Received SSE event');
        dispatch(parsedEvent);
      } catch (err) {
        logger.error({ err, data: event.data }, 'Failed to parse SSE event data');
      }
    };

    eventSource.onerror = (error) => {
      logger.error({ error, endpoint }, 'SSE connection error');
      eventSource.close();
    };

    return () => {
      logger.info('Cleaning up SSE connection');
      active = false;
      eventSource.close();
    };
  }, [endpoint, dispatch]);
}
