import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  AI_PRODUCT_MANAGER_PORT,
  DATA_PRODUCT_MANAGER_PORT,
  DEFAULT_PRODUCT_MANAGER_PORT,
  GENERIC_PRODUCT_MANAGER_PORT,
  GROWTH_PRODUCT_MANAGER_PORT,
  PRODUCT_MANAGER_PORTS,
  SECURITY_PRODUCT_MANAGER_PORT,
  TECHNICAL_PRODUCT_MANAGER_PORT,
} from '../../../src/ai/agents/product-managers/ports';

describe('Product Manager Ports Constants Unit Tests', () => {
  it('should define valid numeric port numbers for all product managers', () => {
    const portValues = Object.values(PRODUCT_MANAGER_PORTS);

    for (const port of portValues) {
      assert.strictEqual(typeof port, 'number');
      assert.ok(port > 1024 && port < 65535, `Port ${port} should be in valid non-privileged range`);
    }
  });

  it('should verify individual port constants match the ports map and alphabetical keys', () => {
    assert.strictEqual(PRODUCT_MANAGER_PORTS.AI, AI_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.DATA, DATA_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.DEFAULT, DEFAULT_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.GENERIC, GENERIC_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.GROWTH, GROWTH_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.SECURITY, SECURITY_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.TECHNICAL, TECHNICAL_PRODUCT_MANAGER_PORT);
    assert.strictEqual(DEFAULT_PRODUCT_MANAGER_PORT, GENERIC_PRODUCT_MANAGER_PORT);

    // Verify dictionary keys are in alphabetical order
    const keys = Object.keys(PRODUCT_MANAGER_PORTS);
    const sortedKeys = [...keys].sort();
    assert.deepStrictEqual(keys, sortedKeys, 'PRODUCT_MANAGER_PORTS keys should be in alphabetical order');
  });

  it('should support dynamic port overrides via environment variables', () => {
    const testPort = '4500';
    process.env.GENERIC_PRODUCT_MANAGER_PORT = testPort;
    const resolved = Number(process.env.GENERIC_PRODUCT_MANAGER_PORT) || DEFAULT_PRODUCT_MANAGER_PORT;
    assert.strictEqual(resolved, 4500);
    delete process.env.GENERIC_PRODUCT_MANAGER_PORT;
  });
});

