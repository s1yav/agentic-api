import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  AgentExecutionError,
  AgenticApiError,
  ERROR_CODES,
  HTTP_STATUS,
  MissingHeaderError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../src/errors';

describe('Errors Module Unit Tests', () => {
  describe('AgenticApiError (Base Class)', () => {
    class ConcreteTestError extends AgenticApiError {
      readonly statusCode = HTTP_STATUS.BAD_REQUEST;
      readonly code = 'TEST_ERROR';
    }

    it('should set error name and maintain prototype chain', () => {
      const err = new ConcreteTestError('Test message');
      assert.strictEqual(err.name, 'ConcreteTestError');
      assert.strictEqual(err.message, 'Test message');
      assert.ok(err instanceof Error);
      assert.ok(err instanceof AgenticApiError);
      assert.ok(err instanceof ConcreteTestError);
    });

    it('should serialize client response correctly without details', () => {
      const err = new ConcreteTestError('Base error occurred');
      const response = err.toClientResponse();
      assert.deepStrictEqual(response, {
        error: {
          message: 'Base error occurred',
          code: 'TEST_ERROR',
          statusCode: 400,
        },
      });
    });

    it('should serialize client response correctly with details', () => {
      const details = { field: 'username', issue: 'invalid' };
      const err = new ConcreteTestError('Base error with details', details);
      const response = err.toClientResponse();
      assert.deepStrictEqual(response, {
        error: {
          message: 'Base error with details',
          code: 'TEST_ERROR',
          statusCode: 400,
          details: { field: 'username', issue: 'invalid' },
        },
      });
    });
  });

  describe('UnauthorizedError', () => {
    it('should have default message and correct properties', () => {
      const err = new UnauthorizedError();
      assert.strictEqual(err.statusCode, HTTP_STATUS.UNAUTHORIZED);
      assert.strictEqual(err.code, ERROR_CODES.UNAUTHORIZED);
      assert.strictEqual(err.message, 'Unauthorized access');
      assert.strictEqual(err.details, undefined);
    });

    it('should support custom message and details', () => {
      const details = { reason: 'Token expired' };
      const err = new UnauthorizedError('Custom unauthorized message', details);
      assert.strictEqual(err.message, 'Custom unauthorized message');
      assert.deepStrictEqual(err.details, details);
    });
  });

  describe('MissingHeaderError', () => {
    it('should construct message with headerName and include headerName in details', () => {
      const err = new MissingHeaderError('X-Firebase-AppCheck');
      assert.strictEqual(err.statusCode, HTTP_STATUS.BAD_REQUEST);
      assert.strictEqual(err.code, ERROR_CODES.MISSING_HEADER);
      assert.strictEqual(err.message, "Required header 'X-Firebase-AppCheck' is missing");
      assert.deepStrictEqual(err.details, { headerName: 'X-Firebase-AppCheck' });
    });

    it('should merge additional details with headerName', () => {
      const err = new MissingHeaderError('Authorization', { attempt: 1 });
      assert.deepStrictEqual(err.details, {
        headerName: 'Authorization',
        attempt: 1,
      });
    });
  });

  describe('ValidationError', () => {
    it('should have default message and correct properties', () => {
      const err = new ValidationError();
      assert.strictEqual(err.statusCode, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      assert.strictEqual(err.code, ERROR_CODES.VALIDATION_ERROR);
      assert.strictEqual(err.message, 'Validation failed');
    });

    it('should support custom message and details', () => {
      const details = { input: 'payload' };
      const err = new ValidationError('Invalid request body', details);
      assert.strictEqual(err.message, 'Invalid request body');
      assert.deepStrictEqual(err.details, details);
    });
  });

  describe('NotFoundError', () => {
    it('should have default message and correct properties', () => {
      const err = new NotFoundError();
      assert.strictEqual(err.statusCode, HTTP_STATUS.NOT_FOUND);
      assert.strictEqual(err.code, ERROR_CODES.NOT_FOUND);
      assert.strictEqual(err.message, 'Resource not found');
    });

    it('should support custom message and details', () => {
      const err = new NotFoundError('Agent not found', { id: '123' });
      assert.strictEqual(err.message, 'Agent not found');
      assert.deepStrictEqual(err.details, { id: '123' });
    });
  });

  describe('AgentExecutionError', () => {
    it('should have default message and correct properties', () => {
      const err = new AgentExecutionError();
      assert.strictEqual(err.statusCode, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      assert.strictEqual(err.code, ERROR_CODES.AGENT_EXECUTION_ERROR);
      assert.strictEqual(err.message, 'Agent execution failed');
    });

    it('should support custom message and details', () => {
      const err = new AgentExecutionError('Flow failed', { step: 'validation' });
      assert.strictEqual(err.message, 'Flow failed');
      assert.deepStrictEqual(err.details, { step: 'validation' });
    });
  });
});
