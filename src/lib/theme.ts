import type { ThemeId } from '../types';

export function applyTheme(themeId: ThemeId): void {
  document.documentElement.setAttribute('data-theme', themeId);
}
