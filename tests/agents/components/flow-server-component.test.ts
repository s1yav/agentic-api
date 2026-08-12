import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createFlowServer } from '../../../src/ai/agents/components/flow-server-component';
import { summarizeProduct } from '../../../src/ai/agents/product-manager-agent/flows/summarize-product';

describe('Flow Server Component Unit Tests', () => {
  it('should create a flow server instance with flows', async () => {
    const serverInstance = createFlowServer({
      agentName: 'Test Product Manager Agent',
      port: 3999,
      flows: { summarizeProduct },
      autoStartLog: false,
    });

    assert.ok(serverInstance);

    const inst = serverInstance as any;
    if (inst && typeof inst.stop === 'function') {
      await inst.stop();
    } else if (inst && typeof inst.close === 'function') {
      await new Promise<void>((res) => inst.close(() => res()));
    } else if (inst && inst.server && typeof inst.server.close === 'function') {
      await new Promise<void>((res) => inst.server.close(() => res()));
    }
  });
});
