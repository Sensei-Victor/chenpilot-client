import { describe, it, expect, vi } from 'vitest';
import { translations } from './translations';
import { t, translateValidation, humanizeKey } from './i18n';

const flatten = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe('workflow translations (#292)', () => {
  const english = flatten(translations.en as unknown as Record<string, unknown>).sort();

  it.each(['ar', 'es', 'fr'] as const)('%s has every key that English has, and no extras', (lang) => {
    const keys = flatten(translations[lang] as unknown as Record<string, unknown>).sort();
    expect(keys).toEqual(english);
  });

  it('covers login/register, send, contacts and validation', () => {
    for (const section of ['auth', 'payment', 'contacts', 'validation']) {
      expect(english.some((k) => k.startsWith(`${section}.`))).toBe(true);
    }
  });

  it.each(['en', 'ar', 'es', 'fr'] as const)('renders no empty or raw-key value in %s', (lang) => {
    for (const key of english) {
      const value = t(lang, key);
      expect(value).not.toBe('');
      expect(value).not.toBe(key);
    }
  });

  it('never renders a raw key path for a missing key', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(t('es', 'auth.doesNotExist')).toBe('Does not exist');
    expect(humanizeKey('payment.sendPayment')).toBe('Send payment');
  });

  it('translates schema validation messages and leaves unknown ones unchanged', () => {
    expect(translateValidation('es', 'Email is required')).toBe('El correo electrónico es obligatorio');
    expect(translateValidation('fr', 'Password must be at least 8 characters')).toBe(
      'Le mot de passe doit contenir au moins 8 caractères',
    );
    expect(translateValidation('ar', 'Something custom')).toBe('Something custom');
    expect(translateValidation('en', undefined)).toBe('');
  });
});
