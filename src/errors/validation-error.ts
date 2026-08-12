import { AgenticApiError } from './agentic-api-error';
import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Error thrown when request input payloads fail validation.
 */
export class ValidationError extends AgenticApiError {
  readonly httpStatus = HTTP_STATUS.UNPROCESSABLE_ENTITY;
  readonly errorCode = ERROR_CODES.VALIDATION_ERROR;

  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super(message, details);
  }
}
