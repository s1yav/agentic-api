import assert from 'node:assert';
import { describe, it } from 'node:test';
import { FlowServerComponent } from '../../src/reusable-components';
import { summarizeProduct } from '../../src/ai/agents/product-manager-agent/flows/summarize-product';

describe('Flow Server Component Unit Tests', () => {
  it('should create a flow server instance with flows as an object map', async () => {
    const component = new FlowServerComponent({
      agentName: 'Test Product Manager Agent',
      port: 3999,
      flows: { summarizeProduct },
    });

    const serverInstance = component.start();
    assert.ok(serverInstance);
    await component.stop();
  });

  it('should create a flow server instance with flows as an array', async () => {
    const component = new FlowServerComponent({
      agentName: 'Test Product Manager Agent Array',
      port: 3998,
      flows: [summarizeProduct as any],
    });

    const serverInstance = component.start();
    assert.ok(serverInstance);
    await component.stop();
  });
});
