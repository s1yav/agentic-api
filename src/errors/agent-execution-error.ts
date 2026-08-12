import { AgenticApiError } from './agentic-api-error';
import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Error thrown when an agent execution flow encounters an unrecoverable failure.
 */
export class AgentExecutionError extends AgenticApiError {
  readonly statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  readonly code = ERROR_CODES.AGENT_EXECUTION_ERROR;

  constructor(message = 'Agent execution failed', details?: Record<string, unknown>) {
    super(message, details);
  }
}
