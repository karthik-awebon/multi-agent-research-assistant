'use client';

import { useEffect } from 'react';
import { AgentEvent } from '../types';
import { useExecutionStore } from '../store/execution-store';
import { APP_CONFIG } from '../constants';
import { logger } from '../utils/logger';

export function useExecutionEvents(sessionId: string | null) {
  const { dispatch } = useExecutionStore();

  useEffect(() => {
    if (!sessionId) return;

    const endpoint = `${APP_CONFIG.ENDPOINTS.EVENTS}?sessionId=${encodeURIComponent(sessionId)}`;
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
  }, [sessionId, dispatch]);
}
