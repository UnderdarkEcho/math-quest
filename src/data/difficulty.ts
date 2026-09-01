import type { Grade, Operation } from '../types';

export interface DifficultySpec {
  /** Inclusive min for positive magnitudes */
  min: number;
  /** Inclusive max for positive magnitudes */
  max: number;
  /** Multiplication: max for smaller factor when capped */
  multMaxB?: number;
  /** Division: max divisor */
  divMaxB?: number;
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** lessonIndex 0..7 scales within the grade band */
export function getDifficulty(
  op: Operation,
  grade: Grade,
  lessonIndex: number,
): DifficultySpec {
  const t = Math.min(1, Math.max(0, lessonIndex / 7));

  // —— Grades 1–3: early elementary ——
  if (grade <= 3) {
    if (op === 'addition' || op === 'subtraction') {
      if (grade === 1) {
        return { min: 1, max: lerp(10, 20, t) };
      }
      if (grade === 2) {
        return { min: 1, max: lerp(20, 100, t) };
      }
      return { min: 1, max: lerp(100, 1000, t) };
    }
    if (op === 'multiplication') {
      if (grade === 1) {
        return {
          min: 1,
          max: lerp(2, 5, t),
          multMaxB: lerp(2, 5, t),
        };
      }
      if (grade === 2) {
        return {
          min: 1,
          max: lerp(2, 10, t),
          multMaxB: lerp(2, 10, t),
        };
      }
      return {
        min: 1,
        max: lerp(5, 12, t),
        multMaxB: lerp(5, 12, t),
      };
    }
    // division
    if (grade === 1) {
      return {
        min: 1,
        max: lerp(10, 20, t),
        divMaxB: lerp(2, 5, t),
      };
    }
    if (grade === 2) {
      return {
        min: 1,
        max: lerp(20, 100, t),
        divMaxB: lerp(2, 10, t),
      };
    }
    return {
      min: 1,
      max: lerp(20, 144, t),
      divMaxB: lerp(2, 12, t),
    };
  }

  // —— Grades 4–5: upper elementary ——
  if (grade <= 5) {
    if (op === 'addition' || op === 'subtraction') {
      return {
        min: 1,
        max: lerp(20, grade === 4 ? 100 : 999, t),
      };
    }
    if (op === 'multiplication') {
      return {
        min: 1,
        max: lerp(5, grade === 4 ? 12 : 25, t),
        multMaxB: grade === 4 ? 12 : lessonIndex < 4 ? 12 : 99,
      };
    }
    return {
      min: 1,
      max: lerp(20, grade === 4 ? 100 : 500, t),
      divMaxB: lerp(5, 12, t),
    };
  }

  // —— Grades 6–8: middle ——
  if (grade <= 8) {
    if (op === 'addition' || op === 'subtraction') {
      return {
        min: 1,
        max: lerp(100, 9999, t),
      };
    }
    if (op === 'multiplication') {
      return {
        min: 2,
        max: lerp(12, 99, t),
        multMaxB: lerp(12, 99, t),
      };
    }
    return {
      min: 2,
      max: lerp(50, 2000, t),
      divMaxB: lerp(5, 25, t),
    };
  }

  // —— Grades 9–12: secondary ——
  if (op === 'addition' || op === 'subtraction') {
    return {
      min: 1,
      max: lerp(500, 99999, t),
    };
  }
  if (op === 'multiplication') {
    return {
      min: 2,
      max: lerp(20, 999, t),
      multMaxB: lerp(20, 99, t),
    };
  }
  return {
    min: 2,
    max: lerp(100, 9999, t),
    divMaxB: lerp(5, 50, t),
  };
}
