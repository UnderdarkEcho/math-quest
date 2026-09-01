import type { ThemeId } from '../types';

const base = import.meta.env.BASE_URL;

export const THEME_IMAGES: Record<ThemeId, string> = {
  default: `${base}themes/default.jpg`,
  minecraft: `${base}themes/minecraft.jpg`,
  dnd: `${base}themes/dnd.jpg`,
  greek: `${base}themes/greek.jpg`,
  'small-business': `${base}themes/small-business.jpg`,
};

export const BADGE_IMAGE = `${base}badges/medal.jpg`;
