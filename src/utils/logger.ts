import pino from 'pino';
import { ENV } from '@/constants';

/**
 * Standardized application logger using Pino.
 */
export const logger = pino({
  level: ENV.IS_PRODUCTION ? 'info' : 'debug',
  transport: !ENV.IS_PRODUCTION
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
