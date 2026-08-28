import { answersMatch, parseUserAnswer } from './answers';

export function normalizePromptAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/²/g, '^2')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
    .replace(/(^|[+-])1x\^/g, '$1x^')
    .replace(/(^|[+-])1x\b/g, '$1x');
}

export function checkPromptAnswer(raw: string, expected: string): boolean {
  const u = normalizePromptAnswer(raw);
  const e = normalizePromptAnswer(expected);
  if (!u) return false;
  if (u === e) return true;

  const us = parseUserAnswer(raw);
  const es = parseUserAnswer(expected);
  if (us !== null && es !== null && answersMatch(us, es)) return true;

  // (x+2)(x+3) same as (x+3)(x+2)
  const uf = factorPair(u);
  const ef = factorPair(e);
  if (uf && ef) {
    return (
      (uf[0] === ef[0] && uf[1] === ef[1]) || (uf[0] === ef[1] && uf[1] === ef[0])
    );
  }
  return false;
}

function factorPair(s: string): [string, string] | null {
  const m = s.match(/^\(([^)]+)\)\(([^)]+)\)$/);
  if (!m) return null;
  return [m[1], m[2]];
}
