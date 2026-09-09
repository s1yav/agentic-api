import assert from 'node:assert';
import { describe, it } from 'node:test';
import { agent as technicalProductManagerAgent } from '../../../src/ai/agents/product-managers/technical-product-manager/agent';
import { agent as growthProductManagerAgent } from '../../../src/ai/agents/product-managers/growth-product-manager/agent';
import { agent as aiProductManagerAgent } from '../../../src/ai/agents/product-managers/ai-product-manager/agent';
import {
  TECHNICAL_PRODUCT_MANAGER_PORT,
  GROWTH_PRODUCT_MANAGER_PORT,
  AI_PRODUCT_MANAGER_PORT,
} from '../../../src/ai/agents/product-managers/ports';
import {
  generateTechnicalPrd,
  breakDownUserStory,
  assessTechnicalTradeoffs,
  summarizeProduct,
  gatherProductContext,
  explainProductFeature,
} from '../../../src/ai/agents/product-managers/flows';

describe('Specialized Product Managers Unit Tests', () => {
  describe('Technical Product Manager', () => {
    it('should export TechnicalProductManagerAgent and flows', () => {
      assert.ok(technicalProductManagerAgent);
      assert.strictEqual(typeof technicalProductManagerAgent, 'function');
      assert.strictEqual(typeof generateTechnicalPrd, 'function');
      assert.strictEqual(typeof breakDownUserStory, 'function');
      assert.strictEqual(typeof assessTechnicalTradeoffs, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(TECHNICAL_PRODUCT_MANAGER_PORT, 3003);
    });
  });

  describe('Growth Product Manager', () => {
    it('should export GrowthProductManagerAgent and flows', () => {
      assert.ok(growthProductManagerAgent);
      assert.strictEqual(typeof growthProductManagerAgent, 'function');
      assert.strictEqual(typeof summarizeProduct, 'function');
      assert.strictEqual(typeof gatherProductContext, 'function');
      assert.strictEqual(typeof explainProductFeature, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(GROWTH_PRODUCT_MANAGER_PORT, 3004);
    });
  });

  describe('AI Product Manager', () => {
    it('should export AIProductManagerAgent and flows', () => {
      assert.ok(aiProductManagerAgent);
      assert.strictEqual(typeof aiProductManagerAgent, 'function');
      assert.strictEqual(typeof generateTechnicalPrd, 'function');
      assert.strictEqual(typeof assessTechnicalTradeoffs, 'function');
      assert.strictEqual(typeof explainProductFeature, 'function');
    });

    it('should assign correct default port', () => {
      assert.strictEqual(AI_PRODUCT_MANAGER_PORT, 3005);
    });
  });
});

