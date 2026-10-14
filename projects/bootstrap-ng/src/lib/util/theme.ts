/** Semantic theme colors available in Bootstrap 6 (`.theme-*` classes). */
export type BsTheme =
  'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'inverse' | 'secondary';

/** Returns the `.theme-*` class for a theme, or an empty string when none is set. */
export function themeClass(theme: BsTheme | null | undefined): string {
  return theme ? `theme-${theme}` : '';
}
