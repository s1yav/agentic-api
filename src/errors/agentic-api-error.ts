import { ErrorCode, HttpStatusCode } from './constants';

export interface ClientErrorPayload {
  error: {
    message: string;
    errorCode: string;
    httpStatus: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Abstract Base Custom Error for agentic-api following the Open/Closed Principle (OCP).
 *
 * Closed for modification: Core error properties and serialization interface are fixed.
 * Open for extension: New domain errors extend this class and define `errorCode`, `httpStatus`, or custom details.
 */
export abstract class AgenticApiError extends Error {
  abstract readonly httpStatus: HttpStatusCode;
  abstract readonly errorCode: ErrorCode;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Polymorphic method to serialize error payloads for client responses.
   */
  toClientResponse(): ClientErrorPayload {
    return {
      error: {
        message: this.message,
        errorCode: this.errorCode,
        httpStatus: this.httpStatus,
        ...(this.details && { details: this.details }),
      },
    };
  }
}
