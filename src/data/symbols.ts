import type { Operation } from '../types';

export const EQUALS_MARK = {
  symbol: '=',
  meaning: 'means “is the same as” or “the answer is.” 3 + 2 = 5 says those two sides match.',
};

const SHARED = [
  EQUALS_MARK,
  {
    symbol: '?',
    meaning: 'a blank. Your job is to fill in the missing number.',
  },
];

export function arithmeticSymbols(op: Operation): {
  intro: string;
  items: { symbol: string; meaning: string }[];
} {
  const core: Record<Operation, { symbol: string; meaning: string }[]> = {
    addition: [
      {
        symbol: '+',
        meaning: 'plus. Put two amounts together. 3 + 2 means 3 and 2 more.',
      },
    ],
    subtraction: [
      {
        symbol: '−',
        meaning: 'minus. Take away, or find the gap. 7 − 2 means start at 7 and remove 2.',
      },
    ],
    multiplication: [
      {
        symbol: '×',
        meaning: 'times. Equal groups. 3 × 4 means 3 groups of 4 (or 4 + 4 + 4).',
      },
    ],
    division: [
      {
        symbol: '÷',
        meaning: 'divided by. Split into equal shares. 12 ÷ 3 means “12 split into 3 equal groups.”',
      },
    ],
  };

  return {
    intro:
      'You do not need to know these marks yet. Each one is just a short way to write an idea. Read the list, then we try a problem together.',
    items: [...core[op], ...SHARED],
  };
}
