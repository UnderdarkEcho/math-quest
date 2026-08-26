import type { SnapFactStats, SnapLaneId, SnapProgress, UserProfile } from '../types';
import { SNAP_LANE_IDS, lanePool, snapKey, TOTAL_SNAP_FACTS, type SnapFact } from './snapFacts';
import { factStrength } from './tablesProgress';

const XP_CORRECT = 5;
const XP_ROUND = 25;
const XP_LANE = 50;

export function emptySnapProgress(): SnapProgress {
  return { facts: {}, masteredLanes: [], bestRoundMs: {} };
}

export function ensureSnapProgress(profile: UserProfile): SnapProgress {
  if (profile.snapProgress?.facts) {
    return {
      facts: profile.snapProgress.facts,
      masteredLanes: profile.snapProgress.masteredLanes ?? [],
      bestRoundMs: profile.snapProgress.bestRoundMs ?? {},
    };
  }
  return emptySnapProgress();
}

export function isFactSolid(sp: SnapProgress, fact: SnapFact): boolean {
  return factStrength(sp.facts[snapKey(fact)] ?? null) === 'solid';
}

export function isLaneMastered(sp: SnapProgress, lane: SnapLaneId): boolean {
  return lanePool(lane).every((f) => isFactSolid(sp, f));
}

export function countSolidSnapFacts(sp: SnapProgress): number {
  return lanePool('mixed').filter((f) => isFactSolid(sp, f)).length;
}

export function countMasteredLanes(sp: SnapProgress): number {
  return SNAP_LANE_IDS.filter((id) => isLaneMastered(sp, id)).length;
}

export { TOTAL_SNAP_FACTS };

const RECOMMEND_ORDER: SnapLaneId[] = ['bonds10', 'doubles', 'make10', 'mixed'];

export function recommendedLane(sp: SnapProgress): SnapLaneId {
  for (const id of RECOMMEND_ORDER) {
    if (!isLaneMastered(sp, id)) return id;
  }
  return 'mixed';
}

export function recordSnapResult(
  profile: UserProfile,
  fact: SnapFact,
  correct: boolean,
  opts: { firstTry?: boolean; ms?: number } = {},
): UserProfile {
  const sp = ensureSnapProgress(profile);
  const key = snapKey(fact);
  const prev = sp.facts[key] ?? { correct: 0, wrong: 0, lastAt: '' };
  const next: SnapFactStats = {
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastAt: new Date().toISOString(),
    bestMs: prev.bestMs,
  };
  if (correct && opts.ms != null && opts.ms >= 0) {
    next.bestMs = prev.bestMs == null ? opts.ms : Math.min(prev.bestMs, opts.ms);
  }

  const facts = { ...sp.facts, [key]: next };
  const trial: SnapProgress = { facts, masteredLanes: sp.masteredLanes, bestRoundMs: sp.bestRoundMs };

  const masteredLanes = [...sp.masteredLanes];
  const badges = [...profile.badges];
  let totalXp = profile.totalXp;
  if (correct && opts.firstTry) totalXp += XP_CORRECT;

  for (const lane of SNAP_LANE_IDS) {
    if (isLaneMastered(trial, lane) && !masteredLanes.includes(lane)) {
      masteredLanes.push(lane);
      totalXp += XP_LANE;
      if (!badges.includes('snap-starter')) badges.push('snap-starter');
      if (masteredLanes.length >= SNAP_LANE_IDS.length && !badges.includes('snap-champ')) {
        badges.push('snap-champ');
      }
    }
  }

  return {
    ...profile,
    totalXp,
    badges,
    snapProgress: { facts, masteredLanes, bestRoundMs: sp.bestRoundMs },
  };
}

export function finishSnapRound(
  profile: UserProfile,
  lane: SnapLaneId,
  roundMs: number,
): { profile: UserProfile; newBest: boolean } {
  const sp = ensureSnapProgress(profile);
  const prev = sp.bestRoundMs[lane];
  const newBest = prev == null || roundMs < prev;
  const bestRoundMs = newBest ? { ...sp.bestRoundMs, [lane]: roundMs } : sp.bestRoundMs;
  return {
    profile: {
      ...profile,
      totalXp: profile.totalXp + XP_ROUND,
      snapProgress: { ...sp, bestRoundMs },
    },
    newBest,
  };
}

export function formatRoundMs(ms: number): string {
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function starsForSolve(ms: number, firstTry: boolean): 1 | 2 | 3 {
  if (!firstTry) return 1;
  if (ms < 6000) return 3;
  if (ms < 12000) return 2;
  return 1;
}
