import assert from 'node:assert';
import { describe, it } from 'node:test';
import { agent as technicalAgent, PORT as technicalPort } from '../../../src/ai/agents/product-managers/technical-product-manager/agent';
import { agent as growthAgent, PORT as growthPort } from '../../../src/ai/agents/product-managers/growth-product-manager/agent';
import { agent as aiAgent, PORT as aiPort } from '../../../src/ai/agents/product-managers/ai-product-manager/agent';
import {
  TECHNICAL_PRODUCT_MANAGER_PORT,
  GROWTH_PRODUCT_MANAGER_PORT,
  AI_PRODUCT_MANAGER_PORT,
} from '../../../src/ai/agents/product-managers/ports';

describe('Specialized Product Managers Unit Tests', () => {
  describe('Technical Product Manager', () => {
    it('should initialize technical agent prompt instance', () => {
      assert.ok(technicalAgent);
      assert.strictEqual(typeof technicalAgent, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(technicalPort, TECHNICAL_PRODUCT_MANAGER_PORT);
      assert.strictEqual(technicalPort, 3003);
    });
  });

  describe('Growth Product Manager', () => {
    it('should initialize growth agent prompt instance', () => {
      assert.ok(growthAgent);
      assert.strictEqual(typeof growthAgent, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(growthPort, GROWTH_PRODUCT_MANAGER_PORT);
      assert.strictEqual(growthPort, 3004);
    });
  });

  describe('AI Product Manager', () => {
    it('should initialize AI agent prompt instance', () => {
      assert.ok(aiAgent);
      assert.strictEqual(typeof aiAgent, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(aiPort, AI_PRODUCT_MANAGER_PORT);
      assert.strictEqual(aiPort, 3005);
    });
  });
});
