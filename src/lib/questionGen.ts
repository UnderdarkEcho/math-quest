import { getDifficulty } from '../data/difficulty';
import type { Grade, Operation, Question } from '../types';
import { OP_SYMBOLS, QUIZ_LENGTH } from '../types';

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function maybeNegate(n: number, allow: boolean, rng: () => number): number {
  if (!allow || n === 0) return n;
  return rng() < 0.35 ? -n : n;
}

function expression(op: Operation, a: number, b: number): string {
  return `${a} ${OP_SYMBOLS[op]} ${b}`;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `q-${Date.now()}-${idCounter}`;
}

export function generateQuestion(
  op: Operation,
  grade: Grade,
  lessonIndex: number,
  rng: () => number = Math.random,
): Question {
  const d = getDifficulty(op, grade, lessonIndex);

  if (op === 'addition') {
    const a = maybeNegate(randInt(d.min, d.max, rng), d.allowNegatives, rng);
    const b = maybeNegate(randInt(d.min, d.max, rng), d.allowNegatives, rng);
    return {
      id: nextId(),
      op,
      a,
      b,
      answer: a + b,
      expression: expression(op, a, b),
    };
  }

  if (op === 'subtraction') {
    let a = randInt(d.min, d.max, rng);
    let b = randInt(d.min, d.max, rng);
    if (!d.allowNegatives && b > a) {
      [a, b] = [b, a];
    }
    a = maybeNegate(a, d.allowNegatives, rng);
    b = maybeNegate(b, d.allowNegatives, rng);
    if (!d.allowNegatives && a - b < 0) {
      // ensure non-negative result
      const hi = Math.max(Math.abs(a), Math.abs(b));
      const lo = Math.min(Math.abs(a), Math.abs(b));
      a = hi;
      b = lo;
    }
    return {
      id: nextId(),
      op,
      a,
      b,
      answer: a - b,
      expression: expression(op, a, b),
    };
  }

  if (op === 'multiplication') {
    const maxB = d.multMaxB ?? d.max;
    let a = randInt(d.min, d.max, rng);
    let b = randInt(d.min, Math.min(maxB, d.max), rng);
    // keep products reasonable for younger grades
    if (grade <= 3) {
      const cap = d.multMaxB ?? 5;
      a = randInt(d.min, Math.min(d.max, cap), rng);
      b = randInt(d.min, Math.min(maxB, cap), rng);
    } else if (grade <= 5 && a > 12 && b > 12) {
      b = randInt(2, 12, rng);
    }
    a = maybeNegate(a, d.allowNegatives, rng);
    b = maybeNegate(b, d.allowNegatives, rng);
    return {
      id: nextId(),
      op,
      a,
      b,
      answer: a * b,
      expression: expression(op, a, b),
    };
  }

  // division — exact integer quotients
  const maxB = d.divMaxB ?? 12;
  let b = randInt(Math.max(2, d.min), maxB, rng);
  let quotient = randInt(d.min, Math.max(d.min, Math.floor(d.max / b)), rng);
  if (quotient < 1) quotient = 1;
  let a = b * quotient;
  // occasionally apply negatives to both or neither for clean integer answers
  if (d.allowNegatives && rng() < 0.3) {
    if (rng() < 0.5) {
      a = -a;
      b = -b;
    } else {
      a = -a;
      quotient = -quotient;
    }
  }
  return {
    id: nextId(),
    op,
    a,
    b,
    // use integer quotient (a/b can lose precision on large ints)
    answer: quotient,
    expression: expression(op, a, b),
  };
}

export function generateQuiz(
  op: Operation,
  grade: Grade,
  lessonIndex: number,
  count: number = QUIZ_LENGTH,
  rng: () => number = Math.random,
): Question[] {
  return Array.from({ length: count }, () =>
    generateQuestion(op, grade, lessonIndex, rng),
  );
}
