import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { blockRealNetwork } from '@/test/networkGuard';

const { state, dispatch, sendImpl } = vi.hoisted(() => ({
  state: { chat: { isOnline: false, messageQueue: [] as Array<{ id: string; query: string; timestamp: string }>, error: null } },
  dispatch: vi.fn(),
  sendImpl: vi.fn(),
}));

vi.mock('@/store', () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (select: (s: unknown) => unknown) => select(state),
}));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/store/slices/chatSlice', async () => {
  const actual = await vi.importActual<typeof import('@/store/slices/chatSlice')>('@/store/slices/chatSlice');
  return {
    ...actual,
    // A plain marker instead of the real thunk, so no request can be made (#290)
    sendMessage: (arg: { query: string; tempId: string }) => ({ type: 'test/send', arg }),
  };
});

import { useOfflineQueue } from './useOfflineQueue';

const queued = (id: string, ageMs = 0) => ({ id, query: `query ${id}`, timestamp: new Date(Date.now() - ageMs).toISOString() });

const sentIds = () => sendImpl.mock.calls.map(([arg]) => arg.tempId);
const dequeuedIds = () =>
  dispatch.mock.calls.map(([a]) => a).filter((a) => a?.type === 'chat/dequeueMessage').map((a) => a.payload);

describe('useOfflineQueue replay (#290)', () => {
  let net: ReturnType<typeof blockRealNetwork>;

  beforeEach(() => {
    net = blockRealNetwork();
    sendImpl.mockReset().mockResolvedValue({});
    dispatch.mockReset().mockImplementation((action: { type: string; arg?: unknown }) => {
      if (action?.type === 'test/send') return { unwrap: () => sendImpl(action.arg) };
      return action;
    });
    state.chat.isOnline = false;
    state.chat.messageQueue = [];
  });

  afterEach(() => {
    expect(net.fetchSpy).not.toHaveBeenCalled();
    expect(net.xhrSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('replays queued messages in order on reconnect and dequeues each', async () => {
    state.chat.messageQueue = [queued('a'), queued('b'), queued('c')];
    const { rerender } = renderHook(() => useOfflineQueue());
    expect(sendImpl).not.toHaveBeenCalled();

    state.chat.isOnline = true;
    rerender();

    await waitFor(() => expect(dequeuedIds()).toEqual(['a', 'b', 'c']));
    expect(sentIds()).toEqual(['a', 'b', 'c']);
  });

  it('does not replay twice when reconnect events repeat', async () => {
    state.chat.isOnline = true;
    state.chat.messageQueue = [queued('a')];
    let finish: () => void = () => {};
    sendImpl.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));

    const { result } = renderHook(() => useOfflineQueue());
    // A second trigger while the first replay is still running
    result.current.processQueue();
    result.current.processQueue();

    finish();
    await waitFor(() => expect(dequeuedIds()).toEqual(['a']));
    expect(sendImpl).toHaveBeenCalledTimes(1);
  });

  it('skips and removes expired entries instead of replaying them', async () => {
    state.chat.isOnline = true;
    state.chat.messageQueue = [queued('stale', 2 * 24 * 60 * 60 * 1000), queued('fresh')];

    renderHook(() => useOfflineQueue());

    await waitFor(() => expect(dequeuedIds()).toEqual(['stale', 'fresh']));
    expect(sentIds()).toEqual(['fresh']);
  });

  it('drops a permanently failed message from the queue and keeps replaying the rest', async () => {
    state.chat.isOnline = true;
    state.chat.messageQueue = [queued('a'), queued('b'), queued('c')];
    sendImpl.mockImplementation(({ tempId }: { tempId: string }) =>
      tempId === 'b' ? Promise.reject(new Error('invalid query')) : Promise.resolve({}),
    );

    renderHook(() => useOfflineQueue());

    await waitFor(() => expect(dequeuedIds()).toEqual(['a', 'b', 'c']));
    expect(sentIds()).toEqual(['a', 'b', 'c']);
  });
});
