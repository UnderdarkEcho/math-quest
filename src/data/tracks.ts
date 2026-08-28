import type { LessonTeach, PromptQuestion, TeachStep } from '../types';
import { QUIZ_LENGTH } from '../types';

function ri(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `p-${Date.now()}-${idCounter}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export interface TrackLesson {
  title: string;
  rule: string;
  hook: string;
  hint: string;
  examplePrompt: string;
  exampleExpected: string;
  gen: (rng: () => number) => { prompt: string; expected: string };
}

function q(prompt: string, expected: string): PromptQuestion {
  return { id: nextId(), kind: 'prompt', prompt, expected };
}

const PREALGEBRA: TrackLesson[] = [
  {
    title: 'Integers',
    rule: 'Negative numbers sit left of zero. Absolute value |n| is the distance from zero.',
    hook: 'Integers include positives, negatives, and zero. You can add, subtract, and take absolute value.',
    hint: 'A minus in front flips the sign. |−7| is 7.',
    examplePrompt: '|−7| =',
    exampleExpected: '7',
    gen(rng) {
      const n = ri(2, 12, rng);
      const k = rng() < 0.5 ? 0 : 1;
      if (k === 0) return { prompt: `|−${n}| =`, expected: String(n) };
      const a = -ri(1, 9, rng);
      const b = ri(1, 9, rng);
      return { prompt: `${a} + ${b} =`, expected: String(a + b) };
    },
  },
  {
    title: 'Order of operations',
    rule: 'Parentheses, then multiply/divide left to right, then add/subtract left to right.',
    hook: '3 + 4 × 2 is 11, not 14 — multiply before you add unless parentheses say otherwise.',
    hint: 'Do × and ÷ before + and −, unless ( ) change the order.',
    examplePrompt: '3 + 4 × 2 =',
    exampleExpected: '11',
    gen(rng) {
      const a = ri(2, 8, rng);
      const b = ri(2, 6, rng);
      const c = ri(2, 6, rng);
      if (rng() < 0.5) return { prompt: `${a} + ${b} × ${c} =`, expected: String(a + b * c) };
      return { prompt: `(${a} + ${b}) × ${c} =`, expected: String((a + b) * c) };
    },
  },
  {
    title: 'Factors and primes',
    rule: 'A prime has exactly two factors: 1 and itself. GCF is the greatest shared factor. LCM is the least shared multiple.',
    hook: 'Factors split a number into whole-number pieces. Primes are the building blocks.',
    hint: 'List factor pairs, or use primes. LCM(4,6) = 12.',
    examplePrompt: 'GCF of 12 and 18 =',
    exampleExpected: '6',
    gen(rng) {
      const pick = ri(0, 2, rng);
      if (pick === 0) {
        const n = [11, 13, 17, 19, 23][ri(0, 4, rng)];
        return { prompt: `Is ${n} prime? (yes or no)`, expected: isPrime(n) ? 'yes' : 'no' };
      }
      if (pick === 1) {
        const a = ri(4, 18, rng);
        const b = ri(4, 18, rng);
        return { prompt: `GCF of ${a} and ${b} =`, expected: String(gcd(a, b)) };
      }
      const a = ri(2, 8, rng);
      const b = ri(2, 8, rng);
      return { prompt: `LCM of ${a} and ${b} =`, expected: String(lcm(a, b)) };
    },
  },
  {
    title: 'Fractions',
    rule: 'Simplify by dividing top and bottom by the GCF. Add only with a common denominator.',
    hook: 'A fraction is a number. Equivalent fractions name the same amount.',
    hint: '6/8 ÷ 2/2 = 3/4. 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
    examplePrompt: 'Simplify 6/8',
    exampleExpected: '3/4',
    gen(rng) {
      if (rng() < 0.5) {
        const g = ri(2, 5, rng);
        const n = ri(1, 6, rng);
        const d = n + ri(1, 6, rng);
        return { prompt: `Simplify ${n * g}/${d * g}`, expected: `${n / gcd(n, d)}/${d / gcd(n, d)}` };
      }
      return { prompt: '1/2 + 1/4 =', expected: '3/4' };
    },
  },
  {
    title: 'Ratios',
    rule: 'A ratio compares two amounts. A unit rate is “how many per 1.”',
    hook: '6:3 is the same as 2:1. 10 miles in 2 hours is 5 miles per hour.',
    hint: 'Divide both parts by the GCF, or divide to get per 1.',
    examplePrompt: 'Simplify 6:3',
    exampleExpected: '2:1',
    gen(rng) {
      if (rng() < 0.5) {
        const g = ri(2, 5, rng);
        const a = ri(1, 6, rng);
        const b = ri(1, 6, rng);
        const gg = gcd(a, b);
        return { prompt: `Simplify ${a * g}:${b * g}`, expected: `${a / gg}:${b / gg}` };
      }
      const rate = ri(2, 9, rng);
      const hours = ri(2, 5, rng);
      return { prompt: `${rate * hours} in ${hours} hours. Per hour?`, expected: String(rate) };
    },
  },
  {
    title: 'Expressions',
    rule: 'Like terms have the same variable part. Combine their coefficients.',
    hook: '3x + 2x is 5x. 2(x + 3) expands to 2x + 6.',
    hint: 'Add the numbers in front of x. Distribute a(b+c) = ab+ac.',
    examplePrompt: 'Simplify 3x + 2x',
    exampleExpected: '5x',
    gen(rng) {
      const a = ri(2, 8, rng);
      const b = ri(1, 8, rng);
      if (rng() < 0.5) return { prompt: `Simplify ${a}x + ${b}x`, expected: `${a + b}x` };
      const k = ri(2, 6, rng);
      const n = ri(1, 6, rng);
      return { prompt: `Expand ${k}(x + ${n})`, expected: `${k}x+${k * n}` };
    },
  },
  {
    title: 'One-step equations',
    rule: 'Do the inverse operation on both sides. + undoes −. × undoes ÷.',
    hook: 'If x + 7 = 12, subtract 7 from both sides: x = 5.',
    hint: 'Undo whatever is happening to x.',
    examplePrompt: 'If x + 7 = 12, what is x?',
    exampleExpected: '5',
    gen(rng) {
      const x = ri(2, 12, rng);
      if (rng() < 0.5) {
        const n = ri(2, 15, rng);
        return { prompt: `If x + ${n} = ${x + n}, what is x?`, expected: String(x) };
      }
      const n = ri(2, 8, rng);
      return { prompt: `If ${n}x = ${n * x}, what is x?`, expected: String(x) };
    },
  },
  {
    title: 'Two-step equations',
    rule: 'Undo add/subtract first, then undo multiply/divide.',
    hook: '2x + 3 = 11 → subtract 3 → 2x = 8 → divide by 2 → x = 4.',
    hint: 'Peel the outside first (the + or −), then the coefficient.',
    examplePrompt: 'If 2x + 3 = 11, what is x?',
    exampleExpected: '4',
    gen(rng) {
      const x = ri(2, 9, rng);
      const c = ri(2, 6, rng);
      const n = ri(1, 9, rng);
      if (rng() < 0.5) return { prompt: `If ${c}x + ${n} = ${c * x + n}, what is x?`, expected: String(x) };
      return { prompt: `If ${c}x − ${n} = ${c * x - n}, what is x?`, expected: String(x) };
    },
  },
  {
    title: 'Inequalities',
    rule: 'Solve like an equation. Flip the inequality only if you multiply or divide by a negative.',
    hook: 'x + 3 > 7 → x > 4. The arrow still points the same way if you only add or subtract.',
    hint: 'Undo the number next to x. Keep the sign unless you scale by a negative.',
    examplePrompt: 'If x + 3 > 7, write the solution (example: x>4)',
    exampleExpected: 'x>4',
    gen(rng) {
      const n = ri(2, 9, rng);
      const x = ri(3, 12, rng);
      const signs = ['>', '<'] as const;
      const s = signs[ri(0, 1, rng)];
      return { prompt: `If x + ${n} ${s} ${x + n}, write the solution (example: x>4)`, expected: `x${s}${x}` };
    },
  },
  {
    title: 'Coordinate plane',
    rule: 'Right is +x, up is +y. Quadrant I is (+,+), II (−,+), III (−,−), IV (+,−).',
    hook: 'A point is an ordered pair (x, y). You can also plug x into y = mx + b.',
    hint: 'First number is x (left/right). Second is y (up/down).',
    examplePrompt: 'Point (3, −2) is in quadrant',
    exampleExpected: 'IV',
    gen(rng) {
      if (rng() < 0.5) {
        const x = ri(1, 6, rng) * (rng() < 0.5 ? 1 : -1);
        const y = ri(1, 6, rng) * (rng() < 0.5 ? 1 : -1);
        const q = x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : 'IV';
        return { prompt: `Point (${x}, ${y}) is in quadrant`, expected: q };
      }
      const m = ri(1, 4, rng);
      const b = ri(0, 6, rng);
      const x = ri(1, 5, rng);
      return { prompt: `y = ${m}x + ${b}. If x = ${x}, y =`, expected: String(m * x + b) };
    },
  },
];

const ALGEBRA1: TrackLesson[] = [
  {
    title: 'Linear equations',
    rule: 'Collect x terms on one side, constants on the other, then divide.',
    hook: '4x − 8 = 12 → 4x = 20 → x = 5.',
    hint: 'Add/subtract to isolate the x term, then divide.',
    examplePrompt: 'If 4x − 8 = 12, what is x?',
    exampleExpected: '5',
    gen(rng) {
      const x = ri(2, 10, rng);
      const a = ri(2, 6, rng);
      const b = ri(2, 12, rng);
      return { prompt: `If ${a}x − ${b} = ${a * x - b}, what is x?`, expected: String(x) };
    },
  },
  {
    title: 'Systems',
    rule: 'Add or subtract the two equations to cancel a variable, then back-solve.',
    hook: 'x + y = 10 and x − y = 2 add to 2x = 12, so x = 6 and y = 4.',
    hint: 'Line the variables up. Add to cancel y if the signs differ.',
    examplePrompt: 'If x + y = 10 and x − y = 2, what is x?',
    exampleExpected: '6',
    gen(rng) {
      const x = ri(3, 10, rng);
      const y = ri(2, 8, rng);
      return {
        prompt: `If x + y = ${x + y} and x − y = ${x - y}, what is x?`,
        expected: String(x),
      };
    },
  },
  {
    title: 'Slope',
    rule: 'Slope m = (y₂ − y₁) / (x₂ − x₁). Rise over run.',
    hook: 'From (1, 2) to (3, 6) the slope is (6−2)/(3−1) = 2.',
    hint: 'Subtract y’s on top, x’s on the bottom. Same order both times.',
    examplePrompt: 'Slope from (1, 2) to (3, 6) =',
    exampleExpected: '2',
    gen(rng) {
      const x1 = ri(0, 4, rng);
      const y1 = ri(0, 6, rng);
      const m = ri(1, 5, rng) * (rng() < 0.3 ? -1 : 1);
      const dx = ri(1, 4, rng);
      const x2 = x1 + dx;
      const y2 = y1 + m * dx;
      return { prompt: `Slope from (${x1}, ${y1}) to (${x2}, ${y2}) =`, expected: String(m) };
    },
  },
  {
    title: 'Exponents',
    rule: 'When multiplying the same base, add the exponents: a^m · a^n = a^(m+n).',
    hook: '2³ · 2² = 2⁵ = 32.',
    hint: 'Same base? Add the powers. Then evaluate if asked.',
    examplePrompt: '2^3 × 2^2 =',
    exampleExpected: '32',
    gen(rng) {
      const a = 2;
      const m = ri(1, 4, rng);
      const n = ri(1, 3, rng);
      if (rng() < 0.5) return { prompt: `${a}^${m} × ${a}^${n} =`, expected: String(a ** (m + n)) };
      return { prompt: `${a}^${m} × ${a}^${n} as a power of ${a}:`, expected: `${a}^${m + n}` };
    },
  },
  {
    title: 'Polynomials',
    rule: 'Add like terms: x² with x², x with x, constants with constants.',
    hook: '(x² + 3x) + (2x² − x) = 3x² + 2x.',
    hint: 'Line up like terms, then add the coefficients.',
    examplePrompt: '(x^2 + 3x) + (2x^2 − x) =',
    exampleExpected: '3x^2+2x',
    gen(rng) {
      const a = ri(1, 4, rng);
      const b = ri(1, 5, rng);
      const c = ri(1, 4, rng);
      const d = ri(1, 5, rng);
      const x2 = a + c;
      const x1 = b - d;
      let expected = `${x2}x^2`;
      if (x1 === 1) expected += '+x';
      else if (x1 === -1) expected += '-x';
      else if (x1 > 0) expected += `+${x1}x`;
      else if (x1 < 0) expected += `${x1}x`;
      return {
        prompt: `(${a}x^2 + ${b}x) + (${c}x^2 − ${d}x) =`,
        expected,
      };
    },
  },
  {
    title: 'Multiply binomials',
    rule: 'FOIL: First, Outer, Inner, Last. (x+a)(x+b) = x² + (a+b)x + ab.',
    hook: '(x + 2)(x + 3) = x² + 5x + 6.',
    hint: 'x·x, then the two middle terms, then the constants.',
    examplePrompt: '(x + 2)(x + 3) =',
    exampleExpected: 'x^2+5x+6',
    gen(rng) {
      const a = ri(1, 6, rng);
      const b = ri(1, 6, rng);
      return {
        prompt: `(x + ${a})(x + ${b}) =`,
        expected: `x^2+${a + b}x+${a * b}`,
      };
    },
  },
  {
    title: 'Factoring',
    rule: 'Find two numbers that multiply to the constant and add to the middle coefficient.',
    hook: 'x² + 5x + 6 = (x + 2)(x + 3).',
    hint: 'What two numbers multiply to 6 and add to 5? 2 and 3.',
    examplePrompt: 'Factor x^2 + 5x + 6',
    exampleExpected: '(x+2)(x+3)',
    gen(rng) {
      const a = ri(1, 6, rng);
      const b = ri(1, 6, rng);
      return {
        prompt: `Factor x^2 + ${a + b}x + ${a * b}`,
        expected: `(x+${a})(x+${b})`,
      };
    },
  },
  {
    title: 'Quadratics',
    rule: 'If x² = n, x = √n or x = −√n. Or factor and set each piece to 0.',
    hook: 'x² − 5x + 6 = 0 factors to (x−2)(x−3)=0, so x = 2 or x = 3.',
    hint: 'For x² = 9 the positive root is 3. For a factored equation, each factor can be 0.',
    examplePrompt: 'If x^2 = 9, what is the positive value of x?',
    exampleExpected: '3',
    gen(rng) {
      if (rng() < 0.5) {
        const n = [4, 9, 16, 25, 36][ri(0, 4, rng)];
        return { prompt: `If x^2 = ${n}, what is the positive value of x?`, expected: String(Math.sqrt(n)) };
      }
      const a = ri(1, 5, rng);
      const b = a + ri(1, 4, rng);
      return {
        prompt: `If x^2 − ${a + b}x + ${a * b} = 0, what is the smaller value of x?`,
        expected: String(Math.min(a, b)),
      };
    },
  },
];

type TutorHelp = {
  intro: string;
  items: { symbol: string; meaning: string }[];
  typeHint: string;
};

const TUTOR_HELP: Record<string, TutorHelp> = {
  Integers: {
    intro: 'These marks are new for some people. We will name every one before you solve anything.',
    items: [
      { symbol: '−', meaning: 'A minus in front of a number means below zero (a negative). −3 is three less than zero.' },
      { symbol: '| |', meaning: 'Bars around a number mean “how far from zero.” |−7| is 7, because −7 is 7 steps from 0.' },
      { symbol: '+', meaning: 'Plus. Put two amounts together, even if one is negative.' },
      { symbol: '=', meaning: 'Means “is the same as.” The number you type goes on the right.' },
    ],
    typeHint: 'Type a number. For negatives type a minus then the digits, like -4.',
  },
  'Order of operations': {
    intro: 'When several marks sit in one line, we need a fixed order so everyone gets the same answer.',
    items: [
      { symbol: '( )', meaning: 'Parentheses. Do whatever is inside these first.' },
      { symbol: '×', meaning: 'Times. Multiply. Do this before + or − unless parentheses say otherwise.' },
      { symbol: '÷', meaning: 'Divided by. Also before + or −.' },
      { symbol: '+  −', meaning: 'Plus and minus. Do these last, left to right.' },
      { symbol: '=', meaning: 'The answer after you follow that order.' },
    ],
    typeHint: 'Type only the final number. Example: 3 + 4 × 2 is 11, not 14.',
  },
  'Factors and primes': {
    intro: 'This lesson uses a few short names. They are just labels for simple ideas.',
    items: [
      { symbol: 'factor', meaning: 'A whole number that divides another evenly. 3 is a factor of 12 because 12 ÷ 3 = 4.' },
      { symbol: 'prime', meaning: 'A number with only two factors: 1 and itself. 7 is prime. 9 is not (3 × 3).' },
      { symbol: 'GCF', meaning: 'Greatest common factor — the biggest number that divides both numbers.' },
      { symbol: 'LCM', meaning: 'Least common multiple — the smallest number both numbers fit into.' },
    ],
    typeHint: 'For “is it prime?” type yes or no. For GCF/LCM type a number.',
  },
  Fractions: {
    intro: 'A fraction is one number written with a bar, not two separate numbers.',
    items: [
      { symbol: 'a/b', meaning: 'The top (a) is how many pieces you have. The bottom (b) is how many pieces make a whole.' },
      { symbol: '=', meaning: 'Equivalent fractions name the same amount. 2/4 = 1/2.' },
      { symbol: '+', meaning: 'To add fractions, the bottoms must match. 1/2 + 1/4 = 2/4 + 1/4 = 3/4.' },
    ],
    typeHint: 'Type fractions with a slash, like 3/4. No spaces needed.',
  },
  Ratios: {
    intro: 'A ratio compares two counts. A rate is a ratio with a unit, like per hour.',
    items: [
      { symbol: 'a:b', meaning: 'Read “a to b.” 6:3 means 6 of the first for every 3 of the second.' },
      { symbol: '=', meaning: 'You can simplify a ratio like a fraction. 6:3 = 2:1.' },
    ],
    typeHint: 'For simplify problems type two numbers with a colon, like 2:1. For “per hour” type one number.',
  },
  Expressions: {
    intro: 'x is not a times sign. Here it is a letter standing for an unknown number.',
    items: [
      { symbol: 'x', meaning: 'A placeholder for a number we do not know yet (or that can change).' },
      { symbol: '3x', meaning: 'Means 3 times x. The number in front is the coefficient.' },
      { symbol: '( )', meaning: '2(x + 3) means 2 times the whole (x + 3), which is 2x + 6.' },
    ],
    typeHint: 'Type answers like 5x or 2x+6 with no spaces. Use x, not ×.',
  },
  'One-step equations': {
    intro: 'An equation is a balanced scale. Whatever you do to one side, do to the other.',
    items: [
      { symbol: 'x', meaning: 'The unknown. Your job is to find the number that makes the two sides match.' },
      { symbol: '=', meaning: 'Both sides are worth the same. We keep that true while we undo operations.' },
      { symbol: '+ − × ÷', meaning: 'Undo + with −, undo × with ÷, and the other way around.' },
    ],
    typeHint: 'Type the number for x only, like 5.',
  },
  'Two-step equations': {
    intro: 'Two things are happening to x. Peel them off in reverse order, like taking off a coat then a sweater.',
    items: [
      { symbol: '2x + 3', meaning: 'x is multiplied by 2, then 3 is added. Undo the +3 first, then divide by 2.' },
      { symbol: '=', meaning: 'Keep both sides equal after each undo.' },
    ],
    typeHint: 'Type the number for x only.',
  },
  Inequalities: {
    intro: 'These marks compare two amounts instead of saying they are equal.',
    items: [
      { symbol: '>', meaning: 'Greater than. 5 > 3 means 5 is bigger.' },
      { symbol: '<', meaning: 'Less than. 2 < 9 means 2 is smaller.' },
      { symbol: 'x > 4', meaning: 'x can be any number bigger than 4. Type it as x>4.' },
    ],
    typeHint: 'Type x>4 or x<7 with no spaces. Use the regular < and > keys.',
  },
  'Coordinate plane': {
    intro: 'A grid for locating points. You have used maps — this is the same idea with numbers.',
    items: [
      { symbol: '(x, y)', meaning: 'An ordered pair. First number is left/right (x). Second is up/down (y).' },
      { symbol: 'I II III IV', meaning: 'The four quadrants. I is right-and-up (+,+). II left-and-up. III left-and-down. IV right-and-down.' },
      { symbol: 'y = mx + b', meaning: 'A line rule. Plug in x, then compute y.' },
    ],
    typeHint: 'For quadrants type I, II, III, or IV. For y, type a number.',
  },
  'Linear equations': {
    intro: 'Same idea as one-step equations, with more terms to collect.',
    items: [
      { symbol: 'x', meaning: 'The unknown number we want.' },
      { symbol: '4x', meaning: '4 times x.' },
      { symbol: '=', meaning: 'Both sides match. Move numbers, then divide.' },
    ],
    typeHint: 'Type the number for x only.',
  },
  Systems: {
    intro: 'Two equations, two unknowns (x and y). We find the pair that works in both.',
    items: [
      { symbol: 'x, y', meaning: 'Two different unknowns. We need both, but this quiz asks for x first.' },
      { symbol: 'x + y', meaning: 'Add the two unknowns. x − y subtracts them.' },
    ],
    typeHint: 'Type the number for x only.',
  },
  Slope: {
    intro: 'Slope is steepness: how much y changes when x goes up by 1.',
    items: [
      { symbol: 'm', meaning: 'The usual letter for slope.' },
      { symbol: '(x, y)', meaning: 'A point on the line.' },
      { symbol: '(y₂ − y₁)/(x₂ − x₁)', meaning: 'Rise over run. Subtract the y’s, subtract the x’s, divide. Same order both times.' },
    ],
    typeHint: 'Type the slope as a number. Negatives use a minus, like -2.',
  },
  Exponents: {
    intro: 'An exponent is a small count of how many times to multiply a number by itself.',
    items: [
      { symbol: '^', meaning: 'The keyboard way to write a power. 2^3 means 2 × 2 × 2 = 8.' },
      { symbol: '2^3 × 2^2', meaning: 'Same base: add the exponents. 2^3 × 2^2 = 2^5 = 32.' },
    ],
    typeHint: 'If it asks for a number, type 32. If it asks for a power, type 2^5.',
  },
  Polynomials: {
    intro: 'A polynomial is a sum of terms like 3x^2, 2x, and 5. We only add matching kinds.',
    items: [
      { symbol: 'x^2', meaning: 'x times x. Also written x². Different from x.' },
      { symbol: '3x^2 + 2x', meaning: 'Two unlike terms. You can add 3x^2 to another x^2 term, and 2x to another x term.' },
    ],
    typeHint: 'Type like 3x^2+2x with no spaces. Use ^ for the little 2.',
  },
  'Multiply binomials': {
    intro: 'A binomial is two terms in parentheses, like (x + 2). We multiply them with FOIL.',
    items: [
      { symbol: '(x + a)', meaning: 'x plus some number, grouped together.' },
      { symbol: 'FOIL', meaning: 'First, Outer, Inner, Last: multiply those four pairs, then add.' },
    ],
    typeHint: 'Type x^2+5x+6 with no spaces.',
  },
  Factoring: {
    intro: 'Factoring undoes FOIL. We split a trinomial back into two parentheses.',
    items: [
      { symbol: '(x+2)(x+3)', meaning: 'Two groups multiplied. This is the factored form of x^2+5x+6.' },
      { symbol: 'x^2 + 5x + 6', meaning: 'Find two numbers that multiply to 6 and add to 5: 2 and 3.', },
    ],
    typeHint: 'Type (x+2)(x+3). Either order of the two groups is fine.',
  },
  Quadratics: {
    intro: 'A quadratic has x^2 in it. Solving means finding x that makes the equation true.',
    items: [
      { symbol: 'x^2', meaning: 'x times x. If x^2 = 9, then x is 3 or −3, because 3×3 and (−3)×(−3) are both 9.' },
      { symbol: '= 0', meaning: 'Set the expression equal to zero, then factor or take a square root.' },
    ],
    typeHint: 'Type one number (the one the question asks for: positive root, or the smaller solution).',
  },
};

const BY_ID: Record<string, TrackLesson[]> = {
  prealgebra: PREALGEBRA,
  algebra1: ALGEBRA1,
};

export function getTrackLessons(courseId: string): TrackLesson[] | undefined {
  return BY_ID[courseId];
}

export function generateTrackQuiz(
  courseId: string,
  lessonIndex: number,
  count: number = QUIZ_LENGTH,
  rng: () => number = Math.random,
): PromptQuestion[] {
  const lessons = BY_ID[courseId];
  const lesson = lessons?.[lessonIndex];
  if (!lesson) return [];
  return Array.from({ length: count }, () => {
    const g = lesson.gen(rng);
    return q(g.prompt, g.expected);
  });
}

export function buildTrackTeach(courseId: string, lessonIndex: number): LessonTeach | null {
  const lesson = BY_ID[courseId]?.[lessonIndex];
  if (!lesson) return null;
  const help = TUTOR_HELP[lesson.title];
  const g1 = lesson.gen(Math.random);
  const g2 = lesson.gen(Math.random);
  const steps: TeachStep[] = [];
  if (help) {
    steps.push({
      kind: 'symbols',
      title: 'What the marks mean',
      intro: help.intro,
      items: help.items,
      typeHint: help.typeHint,
    });
  }
  steps.push(
    {
      kind: 'hook',
      title: lesson.title,
      body: `${lesson.hook}\n\n${lesson.rule}\n\nWorked example:\n${lesson.examplePrompt} ${lesson.exampleExpected}`,
    },
    {
      kind: 'prompt_guided',
      prompt: g1.prompt,
      expected: g1.expected,
      hint: `${lesson.hint}${help ? ` ${help.typeHint}` : ''}`,
    },
    {
      kind: 'prompt_guided',
      prompt: g2.prompt,
      expected: g2.expected,
      hint: `${lesson.hint}${help ? ` ${help.typeHint}` : ''}`,
    },
    {
      kind: 'bridge',
      message:
        'Next you’ll solve 10 problems. Use the same marks we just named. Misses are retried — finish all 10 to master the lesson.',
    },
  );
  return { lessonIndex, steps };
}
