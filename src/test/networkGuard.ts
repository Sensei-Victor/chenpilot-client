import { vi } from 'vitest';

/**
 * Make any real network call fail loudly (#290). Returns the spies so a test can also assert
 * that nothing tried to reach the network. Undo with `vi.restoreAllMocks()` / `vi.unstubAllGlobals()`.
 */
export function blockRealNetwork() {
  const fetchSpy = vi.fn(() => Promise.reject(new Error('Real network access is blocked in tests')));
  vi.stubGlobal('fetch', fetchSpy);
  const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(() => {
    throw new Error('Real network access is blocked in tests');
  });
  return { fetchSpy, xhrSpy };
}
