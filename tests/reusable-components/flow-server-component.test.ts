import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createAndStartFlowServer } from '../../src/reusable-components';
import { summarizeProduct } from '../../src/ai/agents/product-manager-agent/flows/summarize-product';

describe('Flow Server Component Unit Tests', () => {
  it('should create a flow server instance with flows as an object map', async () => {
    const serverInstance = createAndStartFlowServer({
      agentName: 'Test Product Manager Agent',
      port: 3999,
      flows: { summarizeProduct },
    });

    assert.ok(serverInstance);
    await closeServer(serverInstance);
  });

  it('should create a flow server instance with flows as an array', async () => {
    const serverInstance = createAndStartFlowServer({
      agentName: 'Test Product Manager Agent Array',
      port: 3998,
      flows: [summarizeProduct as any],
    });

    assert.ok(serverInstance);
    await closeServer(serverInstance);
  });
});

async function closeServer(serverInstance: unknown): Promise<void> {
  const inst = serverInstance as any;
  if (inst && typeof inst.stop === 'function') {
    await inst.stop();
  } else if (inst && typeof inst.close === 'function') {
    await new Promise<void>((res) => inst.close(() => res()));
  } else if (inst && inst.server && typeof inst.server.close === 'function') {
    await new Promise<void>((res) => inst.server.close(() => res()));
  }
}
