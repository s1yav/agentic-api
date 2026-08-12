export interface ClientErrorPayload {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Abstract Base Custom Error for agentic-api following the Open/Closed Principle (OCP).
 *
 * Closed for modification: Core error properties and serialization interface are fixed.
 * Open for extension: New domain errors extend this class and define `code`, `statusCode`, or custom details.
 */
export abstract class AgenticApiError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

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
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}
