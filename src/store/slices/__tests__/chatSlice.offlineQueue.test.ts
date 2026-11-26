import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, {
  OFFLINE_QUEUE_TTL_MS,
  dequeueMessage,
  isQueuedMessageExpired,
  loadMessageQueue,
  queueMessage,
} from '../chatSlice';
import { blockRealNetwork } from '@/test/networkGuard';

vi.mock('@/services/api', () => ({ default: {} }));

const createStore = () =>
  configureStore({
    reducer: { chat: chatReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false, immutableCheck: false }),
  });

describe('offline queue across reload (#290)', () => {
  let net: ReturnType<typeof blockRealNetwork>;

  beforeEach(() => {
    localStorage.clear();
    net = blockRealNetwork();
  });

  afterEach(() => {
    expect(net.fetchSpy).not.toHaveBeenCalled();
    expect(net.xhrSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('restores queued messages in their original order after a reload', () => {
    const before = createStore();
    before.dispatch(queueMessage({ id: 'q1', query: 'first' }));
    before.dispatch(queueMessage({ id: 'q2', query: 'second' }));
    before.dispatch(queueMessage({ id: 'q3', query: 'third' }));

    // Simulate a reload: a fresh store restores from localStorage
    const after = createStore();
    after.dispatch(loadMessageQueue());

    expect(after.getState().chat.messageQueue.map((m) => m.id)).toEqual(['q1', 'q2', 'q3']);
  });

  it('keeps a duplicated queue event only once', () => {
    const store = createStore();
    store.dispatch(queueMessage({ id: 'q1', query: 'hello' }));
    store.dispatch(queueMessage({ id: 'q1', query: 'hello' }));
    expect(store.getState().chat.messageQueue).toHaveLength(1);
  });

  it('drops expired entries on reload and persists the cleanup', () => {
    const old = new Date(Date.now() - OFFLINE_QUEUE_TTL_MS - 60_000).toISOString();
    const fresh = new Date().toISOString();
    localStorage.setItem(
      'messageQueue',
      JSON.stringify([
        { id: 'stale', query: 'old', timestamp: old },
        { id: 'fresh', query: 'new', timestamp: fresh },
      ]),
    );

    const store = createStore();
    store.dispatch(loadMessageQueue());

    expect(store.getState().chat.messageQueue.map((m) => m.id)).toEqual(['fresh']);
    expect(JSON.parse(localStorage.getItem('messageQueue')!).map((m: { id: string }) => m.id)).toEqual(['fresh']);
  });

  it('treats a missing or invalid timestamp as expired', () => {
    expect(isQueuedMessageExpired({})).toBe(true);
    expect(isQueuedMessageExpired({ timestamp: 'nope' })).toBe(true);
    expect(isQueuedMessageExpired({ timestamp: new Date().toISOString() })).toBe(false);
  });

  it('removes a dequeued message from storage', () => {
    const store = createStore();
    store.dispatch(queueMessage({ id: 'q1', query: 'a' }));
    store.dispatch(dequeueMessage('q1'));
    expect(JSON.parse(localStorage.getItem('messageQueue') || '[]')).toEqual([]);
  });
});
