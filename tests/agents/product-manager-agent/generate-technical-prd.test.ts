import assert from 'node:assert';
import { describe, it } from 'node:test';
import { generateTechnicalPrd } from '../../../src/ai/agents/product-manager-agent/flows/generate-technical-prd';

describe('Generate Technical PRD Flow Unit Tests', () => {
  it('should define the generateTechnicalPrd flow', () => {
    assert.ok(generateTechnicalPrd);
    assert.strictEqual(typeof generateTechnicalPrd, 'function');
  });
});
