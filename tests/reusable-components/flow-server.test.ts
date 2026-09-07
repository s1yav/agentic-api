import assert from 'node:assert';
import { describe, it } from 'node:test';
import { FlowServer } from '../../src/reusable-components';
import { summarizeProduct } from '../../src/ai/agents/product-managers/flows/summarize-product';

describe('Flow Server Unit Tests', () => {
  it('should create a flow server instance with flows as an object map', async () => {
    const server = new FlowServer({
      agentName: 'Test Product Manager Agent',
      port: 3999,
      flows: { summarizeProduct },
    });

    const serverInstance = server.start();
    assert.ok(serverInstance);
    await server.stop();
  });

  it('should create a flow server instance with flows as an array', async () => {
    const server = new FlowServer({
      agentName: 'Test Product Manager Agent Array',
      port: 3998,
      flows: [summarizeProduct as any],
    });

    const serverInstance = server.start();
    assert.ok(serverInstance);
    await server.stop();
  });
});
