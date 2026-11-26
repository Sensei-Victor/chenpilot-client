import { useAppSelector } from '@/store';
import { t, translateValidation, type Language } from './i18n';

/**
 * Translator bound to the current UI language (#292). Reads the language defensively so
 * components still render (in English) where the store has no `ui` slice.
 */
export function useT() {
  const language = useAppSelector(
    (state: { ui?: { language?: Language } }) => state.ui?.language ?? 'en',
  ) as Language;
  return {
    language,
    t: (path: string) => t(language, path),
    tv: (message: string | undefined) => translateValidation(language, message),
  };
}
