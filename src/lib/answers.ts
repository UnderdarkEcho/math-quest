import type { Operation } from '../types';

/** True result for the displayed operands (source of truth for grading). */
export function computeAnswer(op: Operation, a: number, b: number): number {
  switch (op) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return b === 0 ? NaN : a / b;
  }
}

/**
 * Parse a learner's typed answer.
 * Accepts optional spaces, commas, unicode minus.
 */
export function parseUserAnswer(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;
  // normalize unicode minus / dashes to ASCII hyphen
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // strip grouping commas/spaces (1,023 or 1 023)
  s = s.replace(/[,\s]/g, '');
  // allow a single leading +
  if (s.startsWith('+')) s = s.slice(1);
  if (s === '' || s === '-' || s === '.') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Compare user value to expected (integer-safe + float tolerance for division). */
export function answersMatch(user: number, expected: number): boolean {
  if (!Number.isFinite(user) || !Number.isFinite(expected)) return false;
  // Prefer exact integer match when expected is (nearly) integer
  const expInt = Math.round(expected);
  if (Math.abs(expected - expInt) < 1e-9) {
    return Math.round(user) === expInt && Math.abs(user - expInt) < 1e-9;
  }
  return Math.abs(user - expected) < 1e-6;
}

export function checkAnswer(
  raw: string,
  op: Operation,
  a: number,
  b: number,
): { ok: boolean; expected: number; user: number | null } {
  const expected = computeAnswer(op, a, b);
  const user = parseUserAnswer(raw);
  if (user === null) {
    return { ok: false, expected, user: null };
  }
  return { ok: answersMatch(user, expected), expected, user };
}
