import { AgenticApiError } from './agentic-api-error';
import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Error thrown when authentication or security tokens (e.g., App Check, Auth tokens) fail or are missing.
 */
export class UnauthorizedError extends AgenticApiError {
  readonly httpStatus = HTTP_STATUS.UNAUTHORIZED;
  readonly errorCode = ERROR_CODES.UNAUTHORIZED;

  constructor(message = 'Unauthorized access', details?: Record<string, unknown>) {
    super(message, details);
  }
}
