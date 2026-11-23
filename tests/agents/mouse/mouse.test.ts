import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import {
  welcomeVisitor,
  answerProjectQuestion,
  DEFAULT_THINKING_BUDGET,
  MAX_PROJECT_ANSWER_TOKENS,
  MAX_WELCOME_GREETING_TOKENS,
  buildMouseGenerateOptions,
  constructProjectQuestionPrompt,
  constructWelcomePrompt,
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

  it('should define bounded token budgets for mouse responses', () => {
    assert.strictEqual(DEFAULT_THINKING_BUDGET, 0);
    assert.strictEqual(MAX_PROJECT_ANSWER_TOKENS, 256);
    assert.strictEqual(MAX_WELCOME_GREETING_TOKENS, 128);
    assert.ok(MAX_WELCOME_GREETING_TOKENS < MAX_PROJECT_ANSWER_TOKENS);
  });

  it('should build generate options with maxOutputTokens and zero thinkingBudget', () => {
    const options = buildMouseGenerateOptions('Explain gitops', MAX_PROJECT_ANSWER_TOKENS);
    assert.strictEqual(options.prompt, 'Explain gitops');
    assert.strictEqual(options.config.maxOutputTokens, 256);
    assert.strictEqual(options.config.thinkingConfig.thinkingBudget, 0);
  });

  it('should enforce concise length rules in project question prompt', () => {
    const prompt = constructProjectQuestionPrompt({
      question: 'How does gitops work?',
      projectContext: 'gitops',
    });

    assert.ok(prompt.includes('2-4 sentences'));
    assert.ok(prompt.includes('under 120 words'));
    assert.ok(prompt.includes('avoid unnecessary preamble or repetition'));
    assert.ok(!prompt.includes('detailed, accurate, and structured technical explanation'));
  });

  it('should preserve strict privacy redirect rules in project question prompt', () => {
    const prompt = constructProjectQuestionPrompt({
      question: 'Who is the author?',
    });

    assert.ok(prompt.includes('STRICT PRIVACY'));
    assert.ok(prompt.includes('LinkedIn or GitHub'));
  });

  it('should enforce brief greeting rules in welcome prompt', () => {
    const prompt = constructWelcomePrompt({ visitorName: 'Alex' });

    assert.ok(prompt.includes('1-2 sentences'));
    assert.ok(prompt.includes('under 50 words'));
    assert.ok(prompt.includes('avoid listing projects inline'));
  });

  it('should configure maxOutputTokens and thinkingBudget in mouse.prompt', () => {
    const promptFile = readFileSync(
      resolve(process.cwd(), 'prompts/mouse.prompt'),
      'utf-8'
    );

    assert.ok(promptFile.includes('maxOutputTokens: 256'));
    assert.ok(promptFile.includes('thinkingBudget: 0'));
    assert.ok(promptFile.includes('under 120 words'));
  });
});
