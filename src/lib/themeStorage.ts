/**
 * Validated access to the saved theme (#297). Only "light" or "dark" are accepted; anything
 * else (stale, manually edited, or unreadable storage) counts as "no saved theme", so callers
 * fall back to the system preference. Delegates to `@/lib/theme` (#296) so there is a single
 * implementation of the stored-theme rules.
 */
import { readSavedTheme, saveTheme, type ThemeMode } from "@/lib/theme";

export type { ThemeMode };

export function parseThemeValue(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" ? value : null;
}

export const readStoredTheme = readSavedTheme;
export const writeStoredTheme = saveTheme;
