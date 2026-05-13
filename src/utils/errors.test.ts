import { describe, it, expect } from 'vitest';
import { AppError } from '@/utils/errors';

describe('AppError', () => {
  it('should create an error with correct properties', () => {
    const message = 'Test error message';
    const code = 'VALIDATION_ERROR';
    const statusCode = 400;
    const details = { field: 'email' };

    const error = new AppError(message, code, statusCode, details);

    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.statusCode).toBe(statusCode);
    expect(error.details).toEqual(details);
    expect(error.name).toBe('AppError');
  });

  it('should use default values', () => {
    const message = 'Default error';
    const error = new AppError(message);

    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.statusCode).toBe(500);
  });
});
