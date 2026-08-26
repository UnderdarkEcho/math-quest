import type { SnapLaneId } from '../types';
import { factStrength } from './tablesProgress';
import type { SnapProgress } from '../types';

export type SnapOp = 'add' | 'sub';

export interface SnapFact {
  op: SnapOp;
  a: number;
  b: number;
  answer: number;
}

export const SNAP_ROUND = 12;
export const SNAP_LANE_IDS: SnapLaneId[] = [
  'bonds10',
  'doubles',
  'make10',
  'add',
  'sub',
  'mixed',
];

export const SNAP_LANES: { id: SnapLaneId; label: string }[] = [
  { id: 'bonds10', label: 'Bonds to 10' },
  { id: 'doubles', label: 'Doubles' },
  { id: 'make10', label: 'Make 10' },
  { id: 'add', label: 'Mixed +' },
  { id: 'sub', label: 'Mixed −' },
  { id: 'mixed', label: 'Mixed +/−' },
];

export function snapKey(fact: SnapFact): string {
  return fact.op === 'add' ? `${fact.a}+${fact.b}` : `${fact.a}-${fact.b}`;
}

export function snapExpression(fact: SnapFact): string {
  return fact.op === 'add' ? `${fact.a} + ${fact.b}` : `${fact.a} − ${fact.b}`;
}

export function parseLane(raw: string | null): SnapLaneId {
  if (raw && (SNAP_LANE_IDS as string[]).includes(raw)) return raw as SnapLaneId;
  return 'bonds10';
}

export function laneLabel(id: SnapLaneId): string {
  return SNAP_LANES.find((l) => l.id === id)?.label ?? id;
}

function addFact(map: Map<string, SnapFact>, fact: SnapFact): void {
  map.set(snapKey(fact), fact);
}

function addAdd(map: Map<string, SnapFact>, a: number, b: number): void {
  addFact(map, { op: 'add', a, b, answer: a + b });
}

function addSub(map: Map<string, SnapFact>, minuend: number, subtrahend: number): void {
  addFact(map, { op: 'sub', a: minuend, b: subtrahend, answer: minuend - subtrahend });
}

function buildLane(lane: SnapLaneId): SnapFact[] {
  const map = new Map<string, SnapFact>();

  if (lane === 'bonds10') {
    for (let n = 0; n <= 10; n++) {
      addAdd(map, n, 10 - n);
      addSub(map, 10, n);
    }
  } else if (lane === 'doubles') {
    for (let n = 0; n <= 9; n++) {
      addAdd(map, n, n);
      addSub(map, n + n, n);
    }
  } else if (lane === 'make10') {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (a + b > 10) {
          addAdd(map, a, b);
          addSub(map, a + b, a);
          addSub(map, a + b, b);
        }
      }
    }
  } else if (lane === 'add') {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        addAdd(map, a, b);
      }
    }
  } else if (lane === 'sub') {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        addSub(map, a + b, b);
      }
    }
  } else {
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        addAdd(map, a, b);
        addSub(map, a + b, b);
      }
    }
  }

  return [...map.values()];
}

const POOLS: Record<SnapLaneId, SnapFact[]> = {
  bonds10: buildLane('bonds10'),
  doubles: buildLane('doubles'),
  make10: buildLane('make10'),
  add: buildLane('add'),
  sub: buildLane('sub'),
  mixed: buildLane('mixed'),
};

export function lanePool(lane: SnapLaneId): SnapFact[] {
  return POOLS[lane];
}

export const TOTAL_SNAP_FACTS = POOLS.mixed.length;

export function pickSnapFacts(
  sp: SnapProgress,
  lane: SnapLaneId,
  count: number,
  rng: () => number = Math.random,
): SnapFact[] {
  const pool = lanePool(lane);
  const working = pool.map((fact) => {
    const stats = sp.facts[snapKey(fact)] ?? null;
    const s = factStrength(stats);
    const weight = s === 'weak' ? 8 : s === 'new' ? 5 : s === 'learning' ? 3 : 1;
    return { fact, weight };
  });

  const result: SnapFact[] = [];
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
    result.push(working[idx].fact);
    working[idx] = { ...working[idx], weight: Math.max(1, working[idx].weight - 2) };
  }
  return result;
}
