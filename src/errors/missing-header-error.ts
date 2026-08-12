import { AgenticApiError } from './agentic-api-error';
import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Error thrown when a mandatory HTTP header is missing.
 */
export class MissingHeaderError extends AgenticApiError {
  readonly statusCode = HTTP_STATUS.BAD_REQUEST;
  readonly code = ERROR_CODES.MISSING_HEADER;

  constructor(headerName: string, details?: Record<string, unknown>) {
    super(`Required header '${headerName}' is missing`, { headerName, ...details });
  }
}
