import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  LANGUAGE_INIT_SCRIPT,
  readLanguagePreference,
  saveLanguagePreference,
  parseLanguage,
} from './languagePreference';

const signIn = (id: string) => {
  localStorage.setItem('auth_token', 'jwt');
  localStorage.setItem('user_data', JSON.stringify({ id }));
};

// Runs the inline <head> script as the browser does before content renders
const runInitScript = () => new Function(LANGUAGE_INIT_SCRIPT)();

describe('language preference (#291)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });
  afterEach(() => vi.restoreAllMocks());

  it('defaults to English with nothing stored', () => {
    expect(readLanguagePreference()).toBe('en');
    runInitScript();
    expect(document.documentElement.lang).toBe('en');
  });

  it('ignores invalid stored values', () => {
    for (const bad of ['de', 'EN', '', 'null', '{}']) {
      localStorage.setItem('language', bad);
      expect(readLanguagePreference()).toBe('en');
    }
    expect(parseLanguage('fr')).toBe('fr');
    expect(parseLanguage(42)).toBeNull();

    localStorage.setItem('language_by_user', 'not json');
    expect(readLanguagePreference('u1')).toBe('en');
  });

  it('persists the device preference across reloads while signed out', () => {
    saveLanguagePreference('es');
    expect(localStorage.getItem('language')).toBe('es');
    expect(readLanguagePreference()).toBe('es');
  });

  it("keeps each signed-in user's choice without leaking it to another user", () => {
    saveLanguagePreference('fr'); // device preference
    saveLanguagePreference('ar', 'alice');

    expect(readLanguagePreference('alice')).toBe('ar');
    expect(readLanguagePreference('bob')).toBe('fr'); // falls back to device, not Alice's choice
    expect(readLanguagePreference(null)).toBe('fr');
  });

  it("applies the signed-in user's language and direction before render", () => {
    saveLanguagePreference('ar', 'alice');
    signIn('alice');
    runInitScript();
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('falls back to defaults when storage is denied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readLanguagePreference('alice')).toBe('en');
    expect(() => runInitScript()).not.toThrow();
  });
});
