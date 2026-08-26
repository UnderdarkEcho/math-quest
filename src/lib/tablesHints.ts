export interface WrongHelp {
  /** Short headline for the feedback card */
  title: string;
  /** Main teaching line */
  body: string;
  /** Optional related fact the student can use */
  relatedFact?: string;
  /** Repeated-addition scaffold e.g. "7+7+7+7" */
  repeatedAdd?: string;
  /** Whether to reveal the correct product */
  revealAnswer: boolean;
}

/** Build progressive help after a wrong answer. attempt is 1-based. */
export function buildWrongHelp(
  a: number,
  b: number,
  userAnswer: number,
  attempt: number,
): WrongHelp {
  const correct = a * b;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);

  // Near-miss: off by one factor
  const nearMiss =
    userAnswer === a * (b - 1) ||
    userAnswer === a * (b + 1) ||
    userAnswer === (a - 1) * b ||
    userAnswer === (a + 1) * b ||
    userAnswer === (a - 1) * (b - 1) ||
    userAnswer === a + b; // added instead of multiplied

  const repeatedAdd =
    lo <= 12
      ? Array.from({ length: lo }, () => String(hi)).join(' + ')
      : undefined;

  // Common mix-ups
  let mixup = '';
  if (userAnswer === a + b) {
    mixup = `You added (${a} + ${b} = ${a + b}). Multiplication is equal groups — ${a} groups of ${b}.`;
  } else if (userAnswer === a * (b - 1) && b > 1) {
    mixup = `That's ${a} × ${b - 1}. One more group of ${a} gets you there: ${userAnswer} + ${a} = ${correct}.`;
  } else if (userAnswer === a * (b + 1)) {
    mixup = `That's ${a} × ${b + 1} — one group too many. Take away one group of ${a}: ${userAnswer} − ${a} = ${correct}.`;
  } else if (userAnswer === (a - 1) * b && a > 1) {
    mixup = `That's ${a - 1} × ${b}. Add one more group of ${b}: ${userAnswer} + ${b} = ${correct}.`;
  } else if (userAnswer === (a + 1) * b) {
    mixup = `That's ${a + 1} × ${b}. Remove one group of ${b}: ${userAnswer} − ${b} = ${correct}.`;
  }

  // Related easier facts
  let relatedFact: string | undefined;
  if (b % 2 === 0 && b >= 4) {
    const half = b / 2;
    relatedFact = `Double ${a} × ${half}: ${a} × ${half} = ${a * half}, so ${a} × ${b} = ${a * half} × 2 = ${correct}.`;
  } else if (a % 2 === 0 && a >= 4) {
    const half = a / 2;
    relatedFact = `Double ${half} × ${b}: ${half} × ${b} = ${half * b}, so ${a} × ${b} = ${half * b} × 2 = ${correct}.`;
  } else if (b > 5) {
    relatedFact = `Use ${a} × 5 = ${a * 5}, then add ${a} × ${b - 5} = ${a * (b - 5)} → ${a * 5} + ${a * (b - 5)} = ${correct}.`;
  } else if (a > 1) {
    relatedFact = `${a} × ${b - 1} = ${a * (b - 1)} (if you know it), then add ${a}: ${a * (b - 1)} + ${a} = ${correct}.`;
  }

  // Attempt 1: gentle, no full reveal
  if (attempt === 1) {
    return {
      title: nearMiss || mixup ? 'So close!' : 'Not quite',
      body:
        mixup ||
        `Think: ${a} equal groups of ${b} (or ${b} groups of ${a}). What total do you get?`,
      relatedFact: attempt === 1 ? undefined : relatedFact,
      revealAnswer: false,
    };
  }

  // Attempt 2: scaffold without spoiling product in the main line
  if (attempt === 2) {
    return {
      title: 'Here\'s a boost',
      body:
        mixup ||
        `Skip-count by ${hi}: ${Array.from({ length: Math.min(lo, 6) }, (_, i) => hi * (i + 1)).join(', ')}${lo > 6 ? '…' : ''}.`,
      relatedFact,
      repeatedAdd: lo <= 8 ? repeatedAdd : undefined,
      revealAnswer: false,
    };
  }

  // Attempt 3+: reveal with full explanation
  return {
    title: 'Let\'s lock it in',
    body: `${a} × ${b} = ${correct}. ${mixup || `${a} groups of ${b} make ${correct}.`}`,
    relatedFact,
    repeatedAdd: lo <= 10 ? repeatedAdd : undefined,
    revealAnswer: true,
  };
}
