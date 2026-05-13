import { ERROR_CODES } from '@/constants';

/**
 * Standardized application error class.
 */
export class AppError extends Error {
  public readonly code: keyof typeof ERROR_CODES;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: keyof typeof ERROR_CODES = 'INTERNAL_SERVER_ERROR',
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Standardized API error response format.
 */
export interface ApiResponseError {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export const formatErrorResponse = (error: unknown): ApiResponseError => {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  return {
    error: {
      message: 'An unexpected error occurred',
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    },
  };
};
