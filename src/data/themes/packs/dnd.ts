import type { ThemePack } from '../../../types';

export const dndPack: ThemePack = {
  id: 'dnd',
  label: 'Quest & Dice',
  tagline: 'Heroes, gold, and epic number quests',
  hooks: {
    addition: [
      'Track gold and party supplies — addition keeps your totals honest.',
      'When quests pay out treasure, add it to the party fund.',
    ],
    subtraction: [
      'Spending gold or losing hit points? Subtraction updates the count.',
      'After a rest or a purchase, subtract to see what remains.',
    ],
    multiplication: [
      'Equal loot shares and stacked potions — multiply for the full haul.',
      'If each adventurer carries the same kit, multiply for the party total.',
    ],
    division: [
      'Split treasure fairly among the party with division.',
      'Divide quest rewards into equal shares for each hero.',
    ],
  },
  exampleStories: {
    addition: [
      'The party finds {a} gold pieces and earns {b} more from a quest.',
      'You have {a} arrows and buy {b} more at the market.',
    ],
    subtraction: [
      'You start with {a} hit points and lose {b} in a scuffle (no gore — just numbers!).',
      'The party chest has {a} gold; supplies cost {b}.',
    ],
    multiplication: [
      'Each of {a} heroes carries {b} rations.',
      'You brew {a} potions using {b} herbs each.',
    ],
    division: [
      'Split {a} gold coins evenly among {b} party members.',
      'Divide {a} magic scrolls into {b} equal packs.',
    ],
  },
  units: ['gold', 'rations', 'arrows'],
};
