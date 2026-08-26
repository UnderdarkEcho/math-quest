import type { FactStats, TableProgress, UserProfile } from '../types';

export const TABLE_MAX = 12;
export const TABLE_FACTORS = Array.from({ length: TABLE_MAX }, (_, i) => i + 1);
export const TOTAL_FACTS = TABLE_MAX * TABLE_MAX; // 144 ordered pairs 1..12 × 1..12

/** Canonical key for a×b (order preserved for grid cells; strength shared both ways). */
export function factKey(a: number, b: number): string {
  return `${a}x${b}`;
}

/** Shared strength key so 6×7 and 7×6 reinforce each other. */
export function strengthKey(a: number, b: number): string {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `${lo}x${hi}`;
}

export function emptyTableProgress(): TableProgress {
  return { facts: {}, masteredTables: [] };
}

export function ensureTableProgress(profile: UserProfile): TableProgress {
  if (profile.tableProgress?.facts) {
    return {
      facts: profile.tableProgress.facts,
      masteredTables: profile.tableProgress.masteredTables ?? [],
    };
  }
  return emptyTableProgress();
}

export function getFactStats(tp: TableProgress, a: number, b: number): FactStats | null {
  return tp.facts[strengthKey(a, b)] ?? null;
}

export type FactStrength = 'new' | 'learning' | 'solid' | 'weak';

export function factStrength(stats: FactStats | null): FactStrength {
  if (!stats || (stats.correct === 0 && stats.wrong === 0)) return 'new';
  if (stats.correct >= 3 && stats.wrong <= stats.correct / 2) return 'solid';
  if (stats.wrong > stats.correct) return 'weak';
  return 'learning';
}

export function isFactSolid(tp: TableProgress, a: number, b: number): boolean {
  return factStrength(getFactStats(tp, a, b)) === 'solid';
}

/** Classic “n times table”: n × 1 .. n × 12 */
export function isTableMastered(tp: TableProgress, n: number): boolean {
  for (let b = 1; b <= TABLE_MAX; b++) {
    if (!isFactSolid(tp, n, b)) return false;
  }
  return true;
}

export function countSolidFacts(tp: TableProgress): number {
  let n = 0;
  for (let a = 1; a <= TABLE_MAX; a++) {
    for (let b = 1; b <= TABLE_MAX; b++) {
      // count ordered pairs for grid fill; solid if strength key is solid
      if (isFactSolid(tp, a, b)) n++;
    }
  }
  return n;
}

export function countMasteredTables(tp: TableProgress): number {
  return TABLE_FACTORS.filter((n) => isTableMastered(tp, n)).length;
}

const XP_CORRECT = 5;
const XP_ROUND = 25;
const XP_TABLE = 50;

export function recordFactResult(
  profile: UserProfile,
  a: number,
  b: number,
  correct: boolean,
): UserProfile {
  const tp = ensureTableProgress(profile);
  const key = strengthKey(a, b);
  const prev = tp.facts[key] ?? { correct: 0, wrong: 0, lastAt: '' };
  const next: FactStats = {
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastAt: new Date().toISOString(),
  };
  const facts = { ...tp.facts, [key]: next };

  const masteredTables = [...tp.masteredTables];
  const badges = [...profile.badges];
  let totalXp = profile.totalXp + (correct ? XP_CORRECT : 0);

  // Check mastery for tables of a and b
  const trialProgress: TableProgress = { facts, masteredTables };
  for (const n of [a, b]) {
    if (n >= 1 && n <= TABLE_MAX && isTableMastered(trialProgress, n)) {
      if (!masteredTables.includes(n)) {
        masteredTables.push(n);
        masteredTables.sort((x, y) => x - y);
        totalXp += XP_TABLE;
        if (!badges.includes('times-table-starter')) {
          badges.push('times-table-starter');
        }
        if (masteredTables.length >= 12 && !badges.includes('times-table-champ')) {
          badges.push('times-table-champ');
        }
      }
    }
  }

  return {
    ...profile,
    totalXp,
    badges,
    tableProgress: { facts, masteredTables },
  };
}

export function awardRoundBonus(profile: UserProfile): UserProfile {
  return { ...profile, totalXp: profile.totalXp + XP_ROUND };
}

export interface DrillFact {
  a: number;
  b: number;
}

/** Weighted pick: prefer weak/new facts within focus. focus null = mixed 1-12 */
export function pickDrillFacts(
  tp: TableProgress,
  focus: number | null,
  count: number,
  rng: () => number = Math.random,
): DrillFact[] {
  const pool: { a: number; b: number; weight: number }[] = [];

  if (focus !== null) {
    for (let b = 1; b <= TABLE_MAX; b++) {
      const s = factStrength(getFactStats(tp, focus, b));
      const weight = s === 'weak' ? 8 : s === 'new' ? 5 : s === 'learning' ? 3 : 1;
      pool.push({ a: focus, b, weight });
    }
  } else {
    for (let a = 1; a <= TABLE_MAX; a++) {
      for (let b = 1; b <= TABLE_MAX; b++) {
        const s = factStrength(getFactStats(tp, a, b));
        const weight = s === 'weak' ? 8 : s === 'new' ? 5 : s === 'learning' ? 3 : 1;
        pool.push({ a, b, weight });
      }
    }
  }

  const result: DrillFact[] = [];
  const working = [...pool];
  for (let i = 0; i < count && working.length > 0; i++) {
    const totalW = working.reduce((s, x) => s + x.weight, 0);
    let r = rng() * totalW;
    let idx = 0;
    for (let j = 0; j < working.length; j++) {
      r -= working[j].weight;
      if (r <= 0) {
        idx = j;
        break;
      }
    }
    const chosen = working[idx];
    result.push({ a: chosen.a, b: chosen.b });
    // reduce weight so less likely immediate repeat, but allow repeats in small pools
    working[idx] = { ...working[idx], weight: Math.max(1, working[idx].weight - 2) };
  }
  return result;
}
