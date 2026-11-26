# Saved Theme Validation (#297)

`localStorage["theme"]` is read only through `readStoredTheme()` (`src/lib/themeStorage.ts`), which accepts exactly `"light"` or `"dark"`. Any other value is treated as "no saved theme", including different casing, stale or edited strings, or storage that throws. `ThemeProvider` then falls back to the system `prefers-color-scheme`, so Redux state and the `<html>` `dark` class always agree. Writes go through `writeStoredTheme()`, which ignores storage errors.
