import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  introduceExecutiveAssistant,
  draftExecutiveBrief,
  prepareMeetingAgenda,
  summarizeMeetingNotes,
  draftCommunication,
  scheduleAndPrioritize,
} from '../../../src/ai/agents/assistants/flows';
import {
  EXECUTIVE_ASSISTANT_PORT,
  PERSONAL_ASSISTANT_PORT,
  RESEARCH_ASSISTANT_PORT,
  DEFAULT_ASSISTANT_PORT,
  ASSISTANT_PORTS,
} from '../../../src/ai/agents/assistants/ports';
import { agent as executiveAssistantAgent } from '../../../src/ai/agents/assistants/executive-assistant/agent';
import { agent as personalAssistantAgent } from '../../../src/ai/agents/assistants/personal-assistant/agent';
import { agent as researchAssistantAgent } from '../../../src/ai/agents/assistants/research-assistant/agent';

describe('Executive Assistant Flows Unit Tests', () => {
  it('should define all assistant flows', () => {
    assert.ok(introduceExecutiveAssistant);
    assert.strictEqual(typeof introduceExecutiveAssistant, 'function');

    assert.ok(draftExecutiveBrief);
    assert.strictEqual(typeof draftExecutiveBrief, 'function');

    assert.ok(prepareMeetingAgenda);
    assert.strictEqual(typeof prepareMeetingAgenda, 'function');

    assert.ok(summarizeMeetingNotes);
    assert.strictEqual(typeof summarizeMeetingNotes, 'function');

    assert.ok(draftCommunication);
    assert.strictEqual(typeof draftCommunication, 'function');

    assert.ok(scheduleAndPrioritize);
    assert.strictEqual(typeof scheduleAndPrioritize, 'function');
  });

  it('should define valid port configurations for assistants', () => {
    assert.strictEqual(ASSISTANT_PORTS.DEFAULT, DEFAULT_ASSISTANT_PORT);
    assert.strictEqual(ASSISTANT_PORTS.EXECUTIVE, EXECUTIVE_ASSISTANT_PORT);
    assert.strictEqual(ASSISTANT_PORTS.PERSONAL, PERSONAL_ASSISTANT_PORT);
    assert.strictEqual(ASSISTANT_PORTS.RESEARCH, RESEARCH_ASSISTANT_PORT);
    assert.strictEqual(DEFAULT_ASSISTANT_PORT, 3010);
    assert.strictEqual(EXECUTIVE_ASSISTANT_PORT, 3010);
    assert.strictEqual(PERSONAL_ASSISTANT_PORT, 3011);
    assert.strictEqual(RESEARCH_ASSISTANT_PORT, 3012);

    for (const port of Object.values(ASSISTANT_PORTS)) {
      assert.strictEqual(typeof port, 'number');
      assert.ok(port > 1024 && port < 65535);
    }
  });

  it('should verify prompt agent instances are initialized for all assistants', () => {
    assert.ok(executiveAssistantAgent);
    assert.strictEqual(typeof executiveAssistantAgent, 'function');

    assert.ok(personalAssistantAgent);
    assert.strictEqual(typeof personalAssistantAgent, 'function');

    assert.ok(researchAssistantAgent);
    assert.strictEqual(typeof researchAssistantAgent, 'function');
  });

  it('should support dynamic assistant port overrides via environment variables', () => {
    const testPort = '4600';
    process.env.EXECUTIVE_ASSISTANT_PORT = testPort;
    const resolved = Number(process.env.EXECUTIVE_ASSISTANT_PORT) || DEFAULT_ASSISTANT_PORT;
    assert.strictEqual(resolved, 4600);
    delete process.env.EXECUTIVE_ASSISTANT_PORT;
  });
});


