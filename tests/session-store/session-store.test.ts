import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { InMemorySessionStore } from '../../src/ai/session-store';

describe('InMemorySessionStore Unit Tests', () => {
  let store: InMemorySessionStore<{ count: number; user: string }>;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it('should initialize empty and report false for non-existent session', async () => {
    assert.strictEqual(await store.has('user-1'), false);
    assert.strictEqual(await store.get('user-1'), undefined);
    assert.strictEqual(store.getSize(), 0);
  });

  it('should set and get session state correctly', async () => {
    const state = { count: 1, user: 'Alice' };
    await store.set('user-1', state);

    assert.strictEqual(await store.has('user-1'), true);
    const retrieved = await store.get('user-1');
    assert.deepStrictEqual(retrieved, state);
    assert.strictEqual(store.getSize(), 1);
  });

  it('should clear an individual session by id', async () => {
    await store.set('user-1', { count: 10, user: 'Bob' });
    assert.strictEqual(await store.has('user-1'), true);

    const cleared = await store.clear('user-1');
    assert.strictEqual(cleared, true);
    assert.strictEqual(await store.has('user-1'), false);
    assert.strictEqual(await store.get('user-1'), undefined);
  });

  it('should clearAll entries', async () => {
    await store.set('u1', { count: 1, user: 'A' });
    await store.set('u2', { count: 2, user: 'B' });
    assert.strictEqual(store.getSize(), 2);

    store.clearAll();
    assert.strictEqual(store.getSize(), 0);
    assert.strictEqual(await store.has('u1'), false);
    assert.strictEqual(await store.has('u2'), false);
  });

  it('should initialize with initial entries record', async () => {
    const seeded = new InMemorySessionStore({
      'user-init': { count: 42, user: 'Root' },
    });

    assert.strictEqual(await seeded.has('user-init'), true);
    assert.strictEqual(seeded.getSize(), 1);
    assert.deepStrictEqual(await seeded.get('user-init'), { count: 42, user: 'Root' });
  });
});
