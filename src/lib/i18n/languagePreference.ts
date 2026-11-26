/**
 * Language preference store (#291).
 *
 * - `localStorage["language"]`: device preference, used while signed out.
 * - `localStorage["language_by_user"]`: `{ [userId]: language }`, written when a signed-in user
 *   picks a language. Signing in restores that user's choice; signing out returns to the device
 *   preference, so one user's choice never carries over to another user on the same device.
 * Only "en" | "ar" | "es" | "fr" are accepted; anything else (or unreadable storage) falls back.
 */
export type PreferredLanguage = "en" | "ar" | "es" | "fr";

export const SUPPORTED_LANGUAGES: readonly PreferredLanguage[] = ["en", "ar", "es", "fr"];
export const DEFAULT_LANGUAGE: PreferredLanguage = "en";

export function parseLanguage(value: unknown): PreferredLanguage | null {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
    ? (value as PreferredLanguage)
    : null;
}

function readUserMap(): Record<string, string> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem("language_by_user") || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Id of the signed-in user from the persisted profile, or null when signed out. */
export function readActiveUserId(): string | null {
  try {
    if (!window.localStorage.getItem("auth_token")) return null;
    const user = JSON.parse(window.localStorage.getItem("user_data") || "null");
    return typeof user?.id === "string" && user.id ? user.id : null;
  } catch {
    return null;
  }
}

/** The language to show: the user's saved choice, else the device preference, else English. */
export function readLanguagePreference(userId: string | null = null): PreferredLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const fromUser = userId ? parseLanguage(readUserMap()[userId]) : null;
  if (fromUser) return fromUser;
  try {
    return parseLanguage(window.localStorage.getItem("language")) ?? DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/** Save a choice for the signed-in user, or as the device preference when signed out. */
export function saveLanguagePreference(lang: PreferredLanguage, userId: string | null = null): void {
  try {
    if (userId) {
      const map = readUserMap();
      map[userId] = lang;
      window.localStorage.setItem("language_by_user", JSON.stringify(map));
    } else {
      window.localStorage.setItem("language", lang);
    }
  } catch {
    // Storage denied: keep the in-memory language only
  }
}

/**
 * Inline <head> script: sets <html lang/dir> from the stored preference before content renders.
 * Mirrors readLanguagePreference; must stay dependency-free.
 */
export const LANGUAGE_INIT_SCRIPT = `(function(){try{var ok={en:1,ar:1,es:1,fr:1},l=null,s=localStorage;try{if(s.getItem("auth_token")){var u=JSON.parse(s.getItem("user_data")||"null");var m=JSON.parse(s.getItem("language_by_user")||"{}");if(u&&u.id&&m&&ok[m[u.id]])l=m[u.id]}}catch(e){}if(!l){var d=s.getItem("language");if(ok[d])l=d}if(!l)l="en";var r=document.documentElement;r.lang=l;r.dir=l==="ar"?"rtl":"ltr";if(l==="ar")r.classList.add("rtl");else r.classList.remove("rtl")}catch(e){}})();`;
