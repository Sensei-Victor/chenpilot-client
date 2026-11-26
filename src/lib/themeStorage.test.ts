import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { parseThemeValue, readStoredTheme, writeStoredTheme } from './themeStorage';

describe('saved theme validation (#297)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('accepts only light or dark', () => {
    expect(parseThemeValue('light')).toBe('light');
    expect(parseThemeValue('dark')).toBe('dark');
    for (const bad of ['Dark', 'blue', '', ' light', 'null', null, undefined, 1]) {
      expect(parseThemeValue(bad)).toBeNull();
    }
  });

  it('treats invalid stored strings as no saved theme', () => {
    localStorage.setItem('theme', 'purple');
    expect(readStoredTheme()).toBeNull();
    localStorage.setItem('theme', 'dark');
    expect(readStoredTheme()).toBe('dark');
  });

  it('survives storage access errors', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readStoredTheme()).toBeNull();
    expect(() => writeStoredTheme('dark')).not.toThrow();
  });
});
