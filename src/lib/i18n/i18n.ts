import {
  translations,
  Language,
  LANGUAGES,
  LANGUAGE_TO_LOCALE,
  getLocaleForLanguage,
} from './translations';

import {
  readActiveUserId,
  readLanguagePreference,
  saveLanguagePreference,
  type PreferredLanguage,
} from './languagePreference';

export { Language, LANGUAGES, LANGUAGE_TO_LOCALE, getLocaleForLanguage };

export function getLanguageDirection(lang: Language): 'ltr' | 'rtl' {
  const langData = LANGUAGES.find(l => l.code === lang);
  return langData?.dir || 'ltr';
}

export function t(lang: Language, path: string): string {
  const keys = path.split('.');
  let value: unknown = translations[lang];

  for (const key of keys) {
    value = (value as Record<string, unknown> | undefined)?.[key];
  }

  // Fallback to English if translation missing
  if (!value) {
    value = translations.en;
    for (const key of keys) {
      value = (value as Record<string, unknown> | undefined)?.[key];
    }
  }

  if (typeof value === 'string' && value) return value;

  // Never render a raw key path (#292): fall back to a readable label from the last segment
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[i18n] Missing translation for "${path}"`);
  }
  return humanizeKey(path);
}

/** "auth.forgotPassword" → "Forgot password" */
export function humanizeKey(path: string): string {
  const last = path.split('.').pop() ?? path;
  const words = last.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Translate a validation message produced by the zod schemas (#292). Schemas keep their
 * English messages; this maps a known English message to the `validation` key in `lang`.
 * Unknown messages are returned unchanged.
 */
export function translateValidation(lang: Language, message: string | undefined): string {
  if (!message) return '';
  const english = translations.en.validation as Record<string, string>;
  const key = Object.keys(english).find((k) => english[k] === message);
  return key ? t(lang, `validation.${key}`) : message;
}

/** Stored language for the current user / device (#291). */
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return readLanguagePreference(readActiveUserId()) as Language;
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window !== 'undefined') saveLanguagePreference(lang as PreferredLanguage, readActiveUserId());
}
