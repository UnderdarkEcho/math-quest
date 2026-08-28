import type { ThemePack } from '../../../types';

export const greekPack: ThemePack = {
  id: 'greek',
  label: 'Greek Myth',
  tagline: 'Sunset on the temple steps. The owl is keeping score.',
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
  byAge: {
    early: {
      tagline: 'A little owl in a crown of leaves. Help count the olives for Athena.',
      hooks: {
        addition: [
          'Add offerings so the temple knows the total.',
          'When a ship brings more, add it to the store.',
        ],
        subtraction: [
          'Gifts leave the temple — subtract to see what stays.',
          'After a feast, subtract what was used.',
        ],
        multiplication: [
          'Same-size crews? Multiply to count the fleet.',
          'Each altar holds the same gifts — multiply for all.',
        ],
        division: [
          'Share olives and laurels fairly.',
          'Split a harvest into equal baskets.',
        ],
      },
      exampleStories: {
        addition: [
          'Athena has {a} olive branches; friends bring {b} more.',
          'A hero has {a} laurels and wins {b} more.',
        ],
        subtraction: [
          'The temple has {a} jars; {b} are used for a feast.',
          'Zeus counts {a} signs and sends {b}.',
        ],
        multiplication: [
          'There are {a} ships with {b} rowers each.',
          '{a} altars hold {b} gifts each.',
        ],
        division: [
          'Share {a} olives among {b} cities.',
          'Split {a} golden apples into {b} gifts.',
        ],
      },
    },
    middle: {
      tagline: 'Greek Myth: temple stores, ship crews, festival totals.',
      hooks: {
        addition: [
          'Addition keeps temple stores accurate.',
          'Tribute arriving by ship gets added to the total.',
        ],
        subtraction: [
          'Festival use comes off the treasury.',
          'Subtract gifts that leave the store.',
        ],
        multiplication: [
          'Equal crews scale a fleet fast.',
          'Same offering on each altar — multiply.',
        ],
        division: [
          'Share harvests equally among cities.',
          'Division splits a prize into equal honors.',
        ],
      },
      exampleStories: {
        addition: [
          'Athena collects {a} olive branches; {b} more arrive.',
          'A hero has {a} laurels and wins {b} more.',
        ],
        subtraction: [
          'The temple holds {a} amphorae; {b} are used.',
          'A count of {a} signs; {b} are sent.',
        ],
        multiplication: [
          '{a} ships with {b} rowers each.',
          '{a} altars with {b} offerings each.',
        ],
        division: [
          'Share {a} olives among {b} cities.',
          'Divide {a} apples into {b} equal gifts.',
        ],
      },
    },
    high: {
      tagline: 'Tribute in, stores out. Temple books, kept straight.',
      hooks: {
        addition: [
          'Addition combines two tribute counts into one store.',
          'Incoming cargo is added to the current holding.',
        ],
        subtraction: [
          'Subtraction records disbursement from the treasury.',
          'Remaining stock is start minus used.',
        ],
        multiplication: [
          'Equal crews scale a fleet by multiplication.',
          'Altars times offering size is the grand total.',
        ],
        division: [
          'Division allocates a harvest into equal city shares.',
          'Per-city amount is total divided by the count of cities.',
        ],
      },
      exampleStories: {
        addition: [
          'Store is {a}; a shipment adds {b}.',
          'Laurels on hand {a}; contest adds {b}.',
        ],
        subtraction: [
          'Holdings {a}; festival uses {b}.',
          'A count of {a} decreases by {b}.',
        ],
        multiplication: [
          '{a} ships × {b} rowers.',
          '{a} altars × {b} offerings.',
        ],
        division: [
          'Split {a} units across {b} cities.',
          'Divide {a} prizes into {b} equal gifts.',
        ],
      },
    },
  },
};
