export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  MISSING_HEADER: 'MISSING_HEADER',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  AGENT_EXECUTION_ERROR: 'AGENT_EXECUTION_ERROR',
} as const;

export interface ClientErrorPayload {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Abstract Base Custom Error following the Open/Closed Principle (OCP).
 *
 * Closed for modification: Core error properties and serialization interface are fixed.
 * Open for extension: New domain errors extend this class and define `code`, `statusCode`, or custom details.
 */
export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Polymorphic method to serialize error payloads for client responses.
   * Handlers call this method polymorphically without needing conditional checks or type switches.
   */
  toClientResponse(): ClientErrorPayload {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Error thrown when authentication or security tokens (e.g., App Check, Auth tokens) fail or are missing.
 */
export class UnauthorizedError extends BaseError {
  readonly statusCode = HTTP_STATUS.UNAUTHORIZED;
  readonly code = ERROR_CODES.UNAUTHORIZED;

  constructor(message = 'Unauthorized access', details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Error thrown when a mandatory HTTP header is missing.
 */
export class MissingHeaderError extends BaseError {
  readonly statusCode = HTTP_STATUS.BAD_REQUEST;
  readonly code = ERROR_CODES.MISSING_HEADER;

  constructor(headerName: string, details?: Record<string, unknown>) {
    super(`Required header '${headerName}' is missing`, { headerName, ...details });
  }
}

/**
 * Error thrown when request input payloads fail validation.
 */
export class ValidationError extends BaseError {
  readonly statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
  readonly code = ERROR_CODES.VALIDATION_ERROR;

  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Error thrown when a requested resource, flow, or entity is not found.
 */
export class NotFoundError extends BaseError {
  readonly statusCode = HTTP_STATUS.NOT_FOUND;
  readonly code = ERROR_CODES.NOT_FOUND;

  constructor(message = 'Resource not found', details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Error thrown when an agent execution flow encounters an unrecoverable failure.
 */
export class AgentExecutionError extends BaseError {
  readonly statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  readonly code = ERROR_CODES.AGENT_EXECUTION_ERROR;

  constructor(message = 'Agent execution failed', details?: Record<string, unknown>) {
    super(message, details);
  }
}
