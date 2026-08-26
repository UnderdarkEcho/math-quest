import type { Operation } from '../types';

export type HighlightRow = 'a' | 'b' | 'result' | 'carry';

export interface MiniMath {
  left: number[];
  op: '+' | '−' | '×';
  total: number;
  writeDigit: number;
  carryOut?: number;
  borrow?: boolean;
  note?: string;
}

export type SolveBeat =
  | {
      kind: 'setup';
      title: string;
      body: string;
      focus: 'all' | 'house';
      showPlaceHeaders?: boolean;
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      partialAnswer: string | null;
      carries: Record<number, number>;
      borrowPlaces: number[];
    }
  | {
      kind: 'place';
      place: number;
      placeLabel: string;
      mini: MiniMath;
      caption: string;
      partialAnswer: string;
      carries: Record<number, number>;
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      borrowPlaces: number[];
      popResultPlace: number;
    }
  | {
      kind: 'partial_product';
      index: number;
      factorDigit: number;
      product: number;
      shift: number;
      caption: string;
      partialRows: number[];
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      partialAnswer: string | null;
      carries: Record<number, number>;
      borrowPlaces: number[];
    }
  | {
      kind: 'combine';
      caption: string;
      title: string;
      partialAnswer: string;
      partialRows: number[];
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      carries: Record<number, number>;
      borrowPlaces: number[];
    }
  | {
      kind: 'division_beat';
      phase: 'setup' | 'ask' | 'multiply_check' | 'quotient';
      title: string;
      caption: string;
      mini?: MiniMath;
      partialAnswer: string | null;
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      carries: Record<number, number>;
      borrowPlaces: number[];
    }
  | {
      kind: 'finale';
      title: string;
      caption: string;
      answer: number;
      rule: string;
      partialAnswer: string;
      highlightPlaces: number[];
      highlightRows: HighlightRow[];
      carries: Record<number, number>;
      borrowPlaces: number[];
      partialRows?: number[];
    };

/** @deprecated Use SolveBeat — kept for type exports */
export type WalkStep = SolveBeat;

const PLACE_NAMES = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten-thousands', 'Hundred-thousands'];

function placeLabel(i: number): string {
  return PLACE_NAMES[i] ?? `Place ${i}`;
}

function digitAt(n: number, place: number): number {
  const s = String(Math.abs(n));
  const idx = s.length - 1 - place;
  if (idx < 0) return 0;
  return Number(s[idx]);
}

function digitCount(n: number): number {
  return String(Math.abs(n)).length;
}

function allPlaces(...nums: number[]): number[] {
  const w = Math.max(1, ...nums.map(digitCount));
  return Array.from({ length: w }, (_, i) => i);
}

function emptyDisplay() {
  return {
    partialAnswer: null as string | null,
    carries: {} as Record<number, number>,
    borrowPlaces: [] as number[],
    highlightPlaces: [] as number[],
    highlightRows: [] as HighlightRow[],
  };
}

function buildSignedShort(
  op: Operation,
  a: number,
  b: number,
  answer: number,
  rule: string,
): SolveBeat[] {
  const places = allPlaces(a, b, answer);
  const opWord =
    op === 'addition' ? 'Add' : op === 'subtraction' ? 'Subtract' : op === 'multiplication' ? 'Multiply' : 'Divide';
  return [
    {
      kind: 'setup',
      title: 'Watch the signs',
      body: `${opWord} carefully — signs matter for the final answer.`,
      focus: 'all',
      ...emptyDisplay(),
      highlightPlaces: places,
      highlightRows: ['a', 'b'],
    },
    {
      kind: 'finale',
      title: 'Answer',
      caption: `${a} ${op === 'addition' ? '+' : op === 'subtraction' ? '−' : op === 'multiplication' ? '×' : '÷'} ${b} = ${answer}.`,
      answer,
      rule,
      partialAnswer: String(Math.abs(answer)),
      highlightPlaces: places,
      highlightRows: ['a', 'b', 'result'],
      carries: {},
      borrowPlaces: [],
    },
  ];
}

function buildAdditionScript(a: number, b: number, answer: number, rule: string): SolveBeat[] {
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const beats: SolveBeat[] = [];

  beats.push({
    kind: 'setup',
    title: 'Line them up',
    body: 'Stack the numbers so ones sit under ones, tens under tens.',
    focus: 'all',
    showPlaceHeaders: true,
    highlightPlaces: allPlaces(absA, absB),
    highlightRows: ['a', 'b'],
    partialAnswer: null,
    carries: {},
    borrowPlaces: [],
  });

  let carry = 0;
  const resultDigits: number[] = [];
  const carriesShown: Record<number, number> = {};
  const width = Math.max(digitCount(absA), digitCount(absB), digitCount(answer)) + 1;

  for (let place = 0; place < width; place++) {
    const da = digitAt(absA, place);
    const db = digitAt(absB, place);
    if (
      place > 0 &&
      da === 0 &&
      db === 0 &&
      carry === 0 &&
      place >= Math.max(digitCount(absA), digitCount(absB))
    ) {
      break;
    }

    const left = carry > 0 ? [da, db, carry] : [da, db];
    const sum = da + db + carry;
    const write = sum % 10;
    const nextCarry = Math.floor(sum / 10);
    resultDigits.unshift(write);

    const carryIn = carry;
    carry = nextCarry;
    if (nextCarry > 0) carriesShown[place + 1] = nextCarry;

    beats.push({
      kind: 'place',
      place,
      placeLabel: placeLabel(place),
      mini: {
        left,
        op: '+',
        total: sum,
        writeDigit: write,
        carryOut: nextCarry > 0 ? nextCarry : undefined,
        note: carryIn > 0 ? `Including carry ${carryIn}` : undefined,
      },
      caption:
        nextCarry > 0
          ? `Write ${write} in the ${placeLabel(place).toLowerCase()}, carry ${nextCarry}.`
          : `Write ${write} in the ${placeLabel(place).toLowerCase()}.`,
      partialAnswer: resultDigits.join(''),
      carries: { ...carriesShown },
      highlightPlaces: [place],
      highlightRows: nextCarry > 0 ? ['a', 'b', 'result', 'carry'] : ['a', 'b', 'result'],
      borrowPlaces: [],
      popResultPlace: place,
    });
  }

  beats.push({
    kind: 'finale',
    title: 'We got it!',
    caption: `The total is ${answer}.`,
    answer,
    rule,
    partialAnswer: String(Math.abs(answer)),
    highlightPlaces: allPlaces(answer),
    highlightRows: ['result'],
    carries: { ...carriesShown },
    borrowPlaces: [],
  });

  return beats;
}

function buildSubtractionScript(a: number, b: number, answer: number, rule: string): SolveBeat[] {
  if (a < 0 || b < 0 || a < b) {
    return buildSignedShort('subtraction', a, b, answer, rule);
  }

  const width = Math.max(digitCount(a), digitCount(b));
  const beats: SolveBeat[] = [];

  beats.push({
    kind: 'setup',
    title: 'Line them up',
    body: 'Ones under ones. We’ll subtract each place from right to left.',
    focus: 'all',
    showPlaceHeaders: true,
    highlightPlaces: allPlaces(a, b),
    highlightRows: ['a', 'b'],
    partialAnswer: null,
    carries: {},
    borrowPlaces: [],
  });

  const working = Array.from({ length: width }, (_, i) => digitAt(a, i));
  const botR = Array.from({ length: width }, (_, i) => digitAt(b, i));
  const resultDigits: number[] = [];

  for (let place = 0; place < width; place++) {
    let da = working[place];
    const db = botR[place];
    let didBorrow = false;
    const original = digitAt(a, place);

    if (da < db) {
      let j = place + 1;
      while (j < width && working[j] === 0) j++;
      if (j < width) {
        working[j] -= 1;
        for (let k = j - 1; k > place; k--) working[k] += 9;
        working[place] += 10;
        da = working[place];
        didBorrow = true;
      }
    }

    const diff = da - db;
    resultDigits.unshift(diff);
    const partial = resultDigits.join('').replace(/^0+(?=\d)/, '') || String(diff);

    beats.push({
      kind: 'place',
      place,
      placeLabel: placeLabel(place),
      mini: {
        left: didBorrow ? [da, db] : [original, db],
        op: '−',
        total: diff,
        writeDigit: diff,
        borrow: didBorrow,
        note: didBorrow
          ? `Couldn’t take ${db} from ${original} — borrowed to make ${da}`
          : undefined,
      },
      caption: didBorrow
        ? `Borrow, then ${da} − ${db} = ${diff}. Write ${diff}.`
        : `${da} − ${db} = ${diff}. Write ${diff}.`,
      partialAnswer: partial,
      carries: {},
      highlightPlaces: [place],
      highlightRows: ['a', 'b', 'result'],
      borrowPlaces: didBorrow ? [place + 1] : [],
      popResultPlace: place,
    });
  }

  beats.push({
    kind: 'finale',
    title: 'We got it!',
    caption: `The difference is ${answer}.`,
    answer,
    rule,
    partialAnswer: String(answer),
    highlightPlaces: allPlaces(answer),
    highlightRows: ['result'],
    carries: {},
    borrowPlaces: [],
  });

  return beats;
}

function buildMultOneDigit(top: number, bot: number, answer: number, rule: string): SolveBeat[] {
  const beats: SolveBeat[] = [];
  beats.push({
    kind: 'setup',
    title: 'Line them up',
    body: `We’ll multiply each digit of ${top} by ${bot}, right to left.`,
    focus: 'all',
    showPlaceHeaders: true,
    highlightPlaces: allPlaces(top, bot),
    highlightRows: ['a', 'b'],
    partialAnswer: null,
    carries: {},
    borrowPlaces: [],
  });

  let carry = 0;
  const resultDigits: number[] = [];
  const carriesShown: Record<number, number> = {};
  const topWidth = digitCount(top);

  for (let place = 0; place < topWidth || carry > 0; place++) {
    if (place >= topWidth && carry === 0) break;
    const d = digitAt(top, place);
    const prod = d * bot + carry;
    const write = prod % 10;
    const nextCarry = Math.floor(prod / 10);
    const carryIn = carry;
    resultDigits.unshift(write);
    if (nextCarry > 0) carriesShown[place + 1] = nextCarry;

    beats.push({
      kind: 'place',
      place,
      placeLabel: placeLabel(place),
      mini: {
        left: carryIn > 0 ? [d, bot, carryIn] : [d, bot],
        op: '×',
        total: prod,
        writeDigit: write,
        carryOut: nextCarry > 0 ? nextCarry : undefined,
        note:
          carryIn > 0
            ? `${d} × ${bot} = ${d * bot}, plus carry ${carryIn}`
            : `${d} × ${bot}`,
      },
      caption:
        nextCarry > 0
          ? `Write ${write}, carry ${nextCarry}.`
          : `Write ${write} in the ${placeLabel(place).toLowerCase()}.`,
      partialAnswer: resultDigits.join(''),
      carries: { ...carriesShown },
      highlightPlaces: [place],
      highlightRows: nextCarry > 0 ? ['a', 'b', 'result', 'carry'] : ['a', 'b', 'result'],
      borrowPlaces: [],
      popResultPlace: place,
    });

    carry = nextCarry;
  }

  beats.push({
    kind: 'finale',
    title: 'We got it!',
    caption: `The product is ${answer}.`,
    answer,
    rule,
    partialAnswer: String(Math.abs(answer)),
    highlightPlaces: allPlaces(answer),
    highlightRows: ['result'],
    carries: { ...carriesShown },
    borrowPlaces: [],
  });

  return beats;
}

function buildMultMultiDigit(a: number, b: number, answer: number, rule: string): SolveBeat[] {
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const beats: SolveBeat[] = [];
  const partialRows: number[] = [];

  beats.push({
    kind: 'setup',
    title: 'Multi-digit multiply',
    body: `Multiply ${absA} by each digit of ${absB}, then add the partial products.`,
    focus: 'all',
    showPlaceHeaders: true,
    highlightPlaces: allPlaces(absA, absB),
    highlightRows: ['a', 'b'],
    partialAnswer: null,
    carries: {},
    borrowPlaces: [],
  });

  const bWidth = digitCount(absB);
  for (let i = 0; i < bWidth; i++) {
    const factorDigit = digitAt(absB, i);
    const product = absA * factorDigit * Math.pow(10, i);
    partialRows.push(product);

    beats.push({
      kind: 'partial_product',
      index: i,
      factorDigit,
      product,
      shift: i,
      caption:
        i === 0
          ? `${absA} × ${factorDigit} = ${absA * factorDigit}`
          : `${absA} × ${factorDigit} = ${absA * factorDigit}, shift ${i} place${i > 1 ? 's' : ''} → ${product}`,
      partialRows: [...partialRows],
      highlightPlaces: [i],
      highlightRows: ['b', 'result'],
      partialAnswer: String(product),
      carries: {},
      borrowPlaces: [],
    });
  }

  beats.push({
    kind: 'combine',
    title: 'Add the partial products',
    caption: partialRows.map(String).join(' + ') + ` = ${answer}`,
    partialAnswer: String(Math.abs(answer)),
    partialRows: [...partialRows],
    highlightPlaces: allPlaces(answer),
    highlightRows: ['result'],
    carries: {},
    borrowPlaces: [],
  });

  beats.push({
    kind: 'finale',
    title: 'We got it!',
    caption: `The product is ${answer}.`,
    answer,
    rule,
    partialAnswer: String(Math.abs(answer)),
    highlightPlaces: allPlaces(answer),
    highlightRows: ['result'],
    carries: {},
    borrowPlaces: [],
    partialRows: [...partialRows],
  });

  return beats;
}

function buildMultiplicationScript(a: number, b: number, answer: number, rule: string): SolveBeat[] {
  if (a < 0 || b < 0) {
    return buildSignedShort('multiplication', a, b, answer, rule);
  }
  if (digitCount(a) > 4 || digitCount(b) > 4) {
    return buildSignedShort('multiplication', a, b, answer, rule);
  }
  if (digitCount(b) === 1) {
    return buildMultOneDigit(a, b, answer, rule);
  }
  if (digitCount(a) === 1) {
    // swap visual: still show a on top — use simple multi with a as single
    return buildMultOneDigit(b, a, answer, rule);
  }
  return buildMultMultiDigit(a, b, answer, rule);
}

function buildDivisionScript(a: number, b: number, answer: number, rule: string): SolveBeat[] {
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const absQ = Math.abs(answer);
  const places = allPlaces(absA, absB, absQ);

  return [
    {
      kind: 'division_beat',
      phase: 'setup',
      title: 'Set up the house',
      caption: `We’re dividing ${a} by ${b}.`,
      partialAnswer: null,
      highlightPlaces: places,
      highlightRows: ['a', 'b'],
      carries: {},
      borrowPlaces: [],
    },
    {
      kind: 'division_beat',
      phase: 'ask',
      title: 'How many fit?',
      caption: `How many times does ${b} go into ${a} evenly?`,
      partialAnswer: null,
      highlightPlaces: places,
      highlightRows: ['a', 'b'],
      carries: {},
      borrowPlaces: [],
    },
    {
      kind: 'division_beat',
      phase: 'multiply_check',
      title: 'Check with multiply',
      caption: `Because ${b} × ${answer} = ${a}.`,
      mini: {
        left: [absB, absQ],
        op: '×',
        total: absA,
        writeDigit: absQ % 10,
        note: 'Multiplication undoes division',
      },
      partialAnswer: null,
      highlightPlaces: places,
      highlightRows: ['a', 'b'],
      carries: {},
      borrowPlaces: [],
    },
    {
      kind: 'division_beat',
      phase: 'quotient',
      title: 'Write the quotient',
      caption: `The quotient is ${answer}.`,
      partialAnswer: String(absQ),
      highlightPlaces: allPlaces(absQ),
      highlightRows: ['result', 'a', 'b'],
      carries: {},
      borrowPlaces: [],
    },
    {
      kind: 'finale',
      title: 'We got it!',
      caption: `${a} ÷ ${b} = ${answer}.`,
      answer,
      rule,
      partialAnswer: String(absQ),
      highlightPlaces: allPlaces(absQ),
      highlightRows: ['result'],
      carries: {},
      borrowPlaces: [],
    },
  ];
}

const DEFAULT_RULES: Record<Operation, string> = {
  addition: 'Add place by place from right to left. Carry when a place is 10 or more.',
  subtraction: 'Subtract place by place from right to left. Borrow when you need to.',
  multiplication: 'Multiply carefully, keep place values, and add partial products if needed.',
  division: 'Division undoes multiplication — check by multiplying quotient × divisor.',
};

export function buildSolveScript(
  op: Operation,
  a: number,
  b: number,
  answer: number,
  rule?: string,
): SolveBeat[] {
  const r = rule ?? DEFAULT_RULES[op];
  switch (op) {
    case 'addition':
      if (a < 0 || b < 0 || digitCount(a) > 6 || digitCount(b) > 6) {
        return buildSignedShort(op, a, b, answer, r);
      }
      return buildAdditionScript(a, b, answer, r);
    case 'subtraction':
      return buildSubtractionScript(a, b, answer, r);
    case 'multiplication':
      return buildMultiplicationScript(a, b, answer, r);
    case 'division':
      return buildDivisionScript(a, b, answer, r);
  }
}

/** Back-compat alias */
export function buildWalkthrough(
  op: Operation,
  a: number,
  b: number,
  answer: number,
): SolveBeat[] {
  return buildSolveScript(op, a, b, answer);
}
