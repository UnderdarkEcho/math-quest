import type { ThemePack } from '../../../types';

export const greekPack: ThemePack = {
  id: 'greek',
  label: 'Greek Myth',
  tagline: 'Gods, heroes, and legendary totals',
  hooks: {
    addition: [
      'Heroes gather offerings — addition keeps Olympus’s count true.',
      'When ships bring more tribute, add to the temple stores.',
    ],
    subtraction: [
      'Gifts leave the treasury — subtraction shows what remains for the gods.',
      'After a feast for heroes, subtract what was used.',
    ],
    multiplication: [
      'Equal crews on each ship? Multiply to ready the fleet.',
      'If each altar holds the same offerings, multiply for the grand total.',
    ],
    division: [
      'Share laurels and gifts equally among champions with division.',
      'Divide the harvest of olives into equal baskets for each city.',
    ],
  },
  exampleStories: {
    addition: [
      'Athena collects {a} olive branches; devotees bring {b} more.',
      'A hero gathers {a} laurels and wins {b} more in a contest.',
    ],
    subtraction: [
      'The temple holds {a} amphorae; {b} are used for a festival.',
      'Zeus counts {a} thunderbolts and sends {b} as signs (safely!).',
    ],
    multiplication: [
      'There are {a} ships with {b} rowers each.',
      'Each of {a} altars holds {b} offerings.',
    ],
    division: [
      'Share {a} olives equally among {b} cities.',
      'Divide {a} golden apples into {b} equal gifts.',
    ],
  },
  units: ['laurels', 'offerings', 'olives'],
};
