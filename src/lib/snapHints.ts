import type { SnapFact } from './snapFacts';

export interface SnapHelp {
  title: string;
  body: string;
  revealAnswer: boolean;
  scaffold?: string;
  showBond?: { filled: number; ghost: number };
  showMake10?: { leftover: number };
}

interface Strat {
  mild: string;
  full: string;
  scaffold?: string;
  showBond?: { filled: number; ghost: number };
  showMake10?: { leftover: number };
}

function additionStrategy(a: number, b: number, answer: number): Strat {
  if (answer === 10 || a === 10 || b === 10) {
    const filled = Math.min(a, 10);
    return {
      mild: 'Do these two fill a ten?',
      full: `${a} and ${b} are partners of 10.`,
      scaffold: `${a} + ${b} = 10`,
      showBond: { filled, ghost: Math.max(0, 10 - filled) },
    };
  }
  if (a === b) {
    return {
      mild: 'Two of the same number — a double.',
      full: `Double ${a}.`,
      scaffold: `${a} + ${a}`,
    };
  }
  if (Math.abs(a - b) === 1) {
    const lo = Math.min(a, b);
    return {
      mild: 'Near double: double the smaller, then plus 1.',
      full: `Double ${lo}, then plus 1.`,
      scaffold: `${lo} + ${lo}, then + 1`,
    };
  }
  if (answer > 10) {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    const need = 10 - hi;
    const leftover = lo - need;
    return {
      mild: 'Fill a ten first, then add what’s left.',
      full: `${hi} needs ${need} to make 10. Split ${lo} into ${need} + ${leftover}.`,
      scaffold: `${hi} + ${need} = 10, then 10 + ${leftover}`,
      showMake10: { leftover },
    };
  }
  return {
    mild: 'See the two amounts together — no counting one by one.',
    full: `How many is ${a} and ${b} together?`,
    scaffold: `${a} + ${b}`,
  };
}

function subtractionStrategy(minuend: number, sub: number, answer: number): Strat {
  if (minuend === 10) {
    return {
      mild: `What goes with ${sub} to make 10?`,
      full: `${sub} and its partner fill a ten, so 10 − ${sub} is that partner.`,
      scaffold: `${sub} + ? = 10`,
      showBond: { filled: sub, ghost: Math.max(0, 10 - sub) },
    };
  }
  if (sub === answer && minuend === sub * 2) {
    return {
      mild: 'This take-away splits a double in half.',
      full: `${sub} + ${sub} = ${minuend}, so ${minuend} − ${sub} is the other ${sub}.`,
      scaffold: `${sub} + ${sub} = ${minuend}`,
    };
  }
  if (minuend > 10) {
    const leftover = minuend - 10;
    return {
      mild: `Think: ${sub} + ? = ${minuend}. Fill a ten, then add what’s left.`,
      full: `${sub} + ? = ${minuend}. A ten and ${leftover} more.`,
      scaffold: `${sub} + ? = ${minuend}`,
      showMake10: { leftover },
    };
  }
  return {
    mild: `Think of the related add: ${sub} + ? = ${minuend}.`,
    full: `${sub} + ? = ${minuend}.`,
    scaffold: `${sub} + ? = ${minuend}`,
  };
}

function strategyFor(fact: SnapFact): Strat {
  if (fact.op === 'add') return additionStrategy(fact.a, fact.b, fact.answer);
  return subtractionStrategy(fact.a, fact.b, fact.answer);
}

/** attempt is 1-based. */
export function buildSnapHelp(fact: SnapFact, attempt: number, userAnswer: number): SnapHelp {
  const strat = strategyFor(fact);
  const hasVisual = Boolean(strat.showBond || strat.showMake10);

  if (attempt === 1) {
    return {
      title: 'Not quite',
      body: strat.mild,
      scaffold: strat.scaffold,
      revealAnswer: false,
      showBond: hasVisual ? strat.showBond : undefined,
      showMake10: hasVisual ? strat.showMake10 : undefined,
    };
  }

  if (attempt === 2) {
    return {
      title: "Here's a boost",
      body: strat.full,
      scaffold: strat.scaffold,
      revealAnswer: false,
      showBond: strat.showBond,
      showMake10: strat.showMake10,
    };
  }

  return {
    title: "Let's lock it in",
    body: `You entered ${userAnswer}. ${fact.op === 'add' ? `${fact.a} + ${fact.b}` : `${fact.a} − ${fact.b}`} = ${fact.answer}.`,
    scaffold: strat.scaffold,
    revealAnswer: true,
    showBond: strat.showBond,
    showMake10: strat.showMake10,
  };
}
