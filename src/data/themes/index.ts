import type { ThemeId, ThemePack } from '../../types';
import { defaultPack } from './packs/default';
import { minecraftPack } from './packs/minecraft';
import { dndPack } from './packs/dnd';
import { greekPack } from './packs/greek';
import { smallBusinessPack } from './packs/smallBusiness';

export const THEME_PACKS: ThemePack[] = [
  defaultPack,
  minecraftPack,
  dndPack,
  greekPack,
  smallBusinessPack,
];

export function getThemePack(id: ThemeId): ThemePack {
  return THEME_PACKS.find((t) => t.id === id) ?? defaultPack;
}
