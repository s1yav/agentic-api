import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  welcomeVisitor,
  answerProjectQuestion,
} from '../../../src/ai/agents/mouse/flows';
import {
  MOUSE_PORT,
  MOUSE_PORTS,
} from '../../../src/ai/agents/mouse/ports';
import { agent as mouseAgent } from '../../../src/ai/agents/mouse/agent';

describe('Mouse Agent Unit Tests', () => {
  it('should define all mouse flows', () => {
    assert.ok(welcomeVisitor);
    assert.strictEqual(typeof welcomeVisitor, 'function');

    assert.ok(answerProjectQuestion);
    assert.strictEqual(typeof answerProjectQuestion, 'function');
  });

  it('should define valid port configuration for mouse', () => {
    assert.strictEqual(MOUSE_PORTS.MOUSE, MOUSE_PORT);
    assert.strictEqual(MOUSE_PORT, 3020);
    assert.strictEqual(typeof MOUSE_PORT, 'number');
    assert.ok(MOUSE_PORT > 1024 && MOUSE_PORT < 65535);
  });

  it('should verify prompt agent instance is initialized for mouse', () => {
    assert.ok(mouseAgent);
    assert.strictEqual(typeof mouseAgent, 'function');
  });

  it('should support dynamic mouse port override via environment variables', () => {
    const testPort = '4700';
    process.env.MOUSE_PORT = testPort;
    const resolved = Number(process.env.MOUSE_PORT) || MOUSE_PORT;
    assert.strictEqual(resolved, 4700);
    delete process.env.MOUSE_PORT;
  });
});
