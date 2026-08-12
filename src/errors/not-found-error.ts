import { AgenticApiError } from './agentic-api-error';
import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Error thrown when a requested resource, flow, or entity is not found.
 */
export class NotFoundError extends AgenticApiError {
  readonly statusCode = HTTP_STATUS.NOT_FOUND;
  readonly code = ERROR_CODES.NOT_FOUND;

  constructor(message = 'Resource not found', details?: Record<string, unknown>) {
    super(message, details);
  }
}
