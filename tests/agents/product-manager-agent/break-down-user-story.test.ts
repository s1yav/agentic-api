import assert from 'node:assert';
import { describe, it } from 'node:test';
import { breakDownUserStory } from '../../../src/ai/agents/product-manager-agent/flows/break-down-user-story';

describe('Break Down User Story Flow Unit Tests', () => {
  it('should define the breakDownUserStory flow', () => {
    assert.ok(breakDownUserStory);
    assert.strictEqual(typeof breakDownUserStory, 'function');
  });
});
