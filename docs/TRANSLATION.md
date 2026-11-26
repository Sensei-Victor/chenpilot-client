# Workflow Translations (#292)

Login/register, send payment, contacts and validation messages are translated in all supported locales (en, ar, es, fr). The strings live in `src/lib/i18n/workflowTranslations.ts` (sections `auth`, `payment`, `contacts`, `validation`) and are merged into each locale in `translations.ts`.

- **Components:** use `useT()` (`src/lib/i18n/useT.ts`), which returns `t(key)` for the current UI language and `tv(message)` for validation errors.
- **Validation messages:** the zod schemas keep their English messages. `tv`/`translateValidation` maps a known English message to its `validation.*` key, and unknown messages are shown unchanged.
- **No untranslated keys:** a missing key falls back to English, then to a readable label built from the key name (`auth.forgotPassword` becomes "Forgot password"). The raw key path is never shown. Missing keys log a warning outside production.
- **Key parity:** `workflowTranslations.test.ts` fails if any locale has a different set of keys than English.

# Language Persistence (#291)

The language preference store is `src/lib/i18n/languagePreference.ts`. Both keys are listed in the storage inventory.

| Key | Used when | Contents |
| --- | --- | --- |
| `language` | Signed out | Device preference (`en` / `ar` / `es` / `fr`) |
| `language_by_user` | Signed in | `{ [userId]: language }` |

- **Which language shows:** the signed-in user's saved choice, else the device preference, else English. Only the four supported codes are accepted; invalid values, corrupt JSON or blocked storage fall back.
- **Saving:** `setLanguage` saves for the signed-in user, or as the device preference when signed out.
- **Before content renders:** `LANGUAGE_INIT_SCRIPT` is inlined in `<head>` (`src/app/layout.tsx`) and sets `<html lang>`, `dir` and the `rtl` class. The Redux initial state is read from the same store, so the first render already uses the right language.
- **No leaking between users:** when the signed-in user changes, `LanguageProvider` dispatches `applyLanguage(readLanguagePreference(userId))`. Signing in restores that user's choice, and signing out returns to the device preference.
