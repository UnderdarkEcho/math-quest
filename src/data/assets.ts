import type { AgeBand, ThemeId } from '../types';

export function themeImage(themeId: ThemeId, ageBand: AgeBand = 'upper'): string {
  const base = (import.meta.env && import.meta.env.BASE_URL) || '/';
  const band = ageBand || 'upper';
  const id = themeId || 'default';
  return `${base}themes/${band}/${id}.jpg?v=2`;
}

/** Upper-band images; prefer themeImage(id, ageBand) in UI. */
export const THEME_IMAGES: Record<ThemeId, string> = {
  default: themeImage('default', 'upper'),
  minecraft: themeImage('minecraft', 'upper'),
  dnd: themeImage('dnd', 'upper'),
  greek: themeImage('greek', 'upper'),
  'small-business': themeImage('small-business', 'upper'),
};

export const BADGE_IMAGE = `${(import.meta.env && import.meta.env.BASE_URL) || '/'}badges/medal.jpg`;
