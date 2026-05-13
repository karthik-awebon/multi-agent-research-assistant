/**
 * Centralized constants and environment variable configurations.
 */

export const APP_CONFIG = {
  NAME: 'Multi-Agent Research Assistant',
  VERSION: '0.1.0',
  API_TIMEOUT: 30000,
  ENDPOINTS: {
    EVENTS: '/api/events',
  },
  MOCK_DELAY: 1500,
} as const;

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export const GRAPH_CONFIG = {
  NODE_WIDTH: 250,
  NODE_HEIGHT: 100,
  LAYOUT: {
    rankdir: 'TB',
    marginx: 40,
    marginy: 40,
    nodesep: 60,
    ranksep: 100,
  },
  THEME: {
    EDGE_COLOR: '#334155',
    EDGE_WIDTH: 2,
    TRANSITION_DURATION: 300,
  },
} as const;
