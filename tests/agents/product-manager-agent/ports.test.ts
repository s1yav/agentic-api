import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  GENERIC_PRODUCT_MANAGER_PORT,
  TECHNICAL_PRODUCT_MANAGER_PORT,
  GROWTH_PRODUCT_MANAGER_PORT,
  AI_PRODUCT_MANAGER_PORT,
  SECURITY_PRODUCT_MANAGER_PORT,
  DATA_PRODUCT_MANAGER_PORT,
  DEFAULT_PRODUCT_MANAGER_PORT,
  PRODUCT_MANAGER_PORTS,
} from '../../../src/ai/agents/product-managers/ports';

describe('Product Manager Ports Constants Unit Tests', () => {
  it('should define distinct numeric port numbers for all product managers', () => {
    const portValues = Object.values(PRODUCT_MANAGER_PORTS);
    const uniquePorts = new Set(portValues);

    assert.strictEqual(uniquePorts.size, portValues.length, 'All PM port numbers should be unique');
    for (const port of portValues) {
      assert.strictEqual(typeof port, 'number');
      assert.ok(port > 1024 && port < 65535, `Port ${port} should be in valid non-privileged range`);
    }
  });

  it('should verify individual port constants match the ports map', () => {
    assert.strictEqual(PRODUCT_MANAGER_PORTS.GENERIC, GENERIC_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.TECHNICAL, TECHNICAL_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.GROWTH, GROWTH_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.AI, AI_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.SECURITY, SECURITY_PRODUCT_MANAGER_PORT);
    assert.strictEqual(PRODUCT_MANAGER_PORTS.DATA, DATA_PRODUCT_MANAGER_PORT);
    assert.strictEqual(DEFAULT_PRODUCT_MANAGER_PORT, GENERIC_PRODUCT_MANAGER_PORT);
  });
});
