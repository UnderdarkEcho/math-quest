import type { Operation } from '../types';

export interface SkillBand {
  /** lesson indices 0-7 covered loosely */
  title: string;
  rule: string;
  steps: string[];
  hint: string;
}

/** Neutral pedagogy tips by operation; lesson index picks a band */
const ADDITION: SkillBand[] = [
  {
    title: 'Putting amounts together',
    rule: 'Addition combines two amounts into one total.',
    steps: ['Line up the numbers', 'Add ones (or smaller parts) first', 'Write the total'],
    hint: 'Count both groups as one bigger group.',
  },
  {
    title: 'Carrying to the next place',
    rule: 'When a place adds to 10 or more, write the ones and carry the tens.',
    steps: ['Add the ones column', 'If ≥ 10, carry 1 to the tens', 'Add the tens (plus carry)'],
    hint: '10 ones make 1 ten — carry it over.',
  },
  {
    title: 'Bigger numbers',
    rule: 'Add place by place from right to left.',
    steps: ['Start at the rightmost digit', 'Add each column', 'Carry when needed'],
    hint: 'Right to left keeps place values correct.',
  },
  {
    title: 'Negatives and signed sums',
    rule: 'Same signs add magnitudes; different signs subtract and keep the larger sign.',
    steps: ['Check the signs', 'Combine magnitudes correctly', 'Apply the final sign'],
    hint: 'Think of a number line when signs differ.',
  },
];

const SUBTRACTION: SkillBand[] = [
  {
    title: 'Taking away',
    rule: 'Subtraction finds how much is left after removing some.',
    steps: ['Start with the whole', 'Remove the part', 'What remains is the answer'],
    hint: 'The answer is smaller when you subtract a positive amount from a larger one.',
  },
  {
    title: 'Borrowing',
    rule: 'If a digit is too small, borrow 1 from the next place value.',
    steps: ['Look at the ones', 'If you cannot subtract, borrow', 'Then subtract each place'],
    hint: 'Borrowing turns 1 ten into 10 ones.',
  },
  {
    title: 'Multi-digit differences',
    rule: 'Subtract place by place from right to left.',
    steps: ['Align place values', 'Subtract each column', 'Borrow when needed'],
    hint: 'Keep digits lined up by place.',
  },
  {
    title: 'Signed differences',
    rule: 'a − b is the same as a + (−b).',
    steps: ['Rewrite if helpful', 'Combine carefully', 'Check the sign of the result'],
    hint: 'Subtracting a negative is like adding.',
  },
];

const MULTIPLICATION: SkillBand[] = [
  {
    title: 'Equal groups',
    rule: 'Multiplication is repeated addition of equal groups.',
    steps: ['See how many groups', 'See how many in each group', 'Multiply for the total'],
    hint: '3 × 4 means three groups of four.',
  },
  {
    title: 'Times tables fluency',
    rule: 'Known facts make bigger products faster.',
    steps: ['Recall the fact', 'Write the product', 'Check with a related fact if unsure'],
    hint: 'If 6 × 7 is hard, try 6 × 5 + 6 × 2.',
  },
  {
    title: 'Multi-digit products',
    rule: 'Multiply by each digit, then add partial products.',
    steps: ['Multiply by the ones', 'Multiply by the tens (shift place)', 'Add partial products'],
    hint: 'Place value tells you where each partial product starts.',
  },
  {
    title: 'Signed products',
    rule: 'Same signs → positive product; different signs → negative product.',
    steps: ['Multiply the magnitudes', 'Apply the sign rule', 'Write the product'],
    hint: 'Negative times negative is positive.',
  },
];

const DIVISION: SkillBand[] = [
  {
    title: 'Sharing equally',
    rule: 'Division splits a total into equal groups.',
    steps: ['Identify the total', 'Identify group size or number of groups', 'Find how many fit evenly'],
    hint: 'Division undoes multiplication.',
  },
  {
    title: 'Exact quotients',
    rule: 'If a = b × q, then a ÷ b = q.',
    steps: ['Think of the matching multiply fact', 'Write the quotient', 'Check: quotient × divisor = dividend'],
    hint: 'Check by multiplying back.',
  },
  {
    title: 'Larger dividends',
    rule: 'Divide place by place or use friendly factors.',
    steps: ['Estimate the quotient', 'Multiply to check', 'Adjust if needed'],
    hint: 'Estimation keeps you close to the right quotient.',
  },
  {
    title: 'Signed quotients',
    rule: 'Same signs → positive quotient; different signs → negative quotient.',
    steps: ['Divide magnitudes', 'Apply the sign rule', 'Verify with multiplication'],
    hint: 'Sign rules match multiplication.',
  },
];

const BY_OP: Record<Operation, SkillBand[]> = {
  addition: ADDITION,
  subtraction: SUBTRACTION,
  multiplication: MULTIPLICATION,
  division: DIVISION,
};

export function getSkillBand(op: Operation, lessonIndex: number): SkillBand {
  const bands = BY_OP[op];
  const idx = Math.min(bands.length - 1, Math.floor(lessonIndex / 2));
  return bands[idx];
}
