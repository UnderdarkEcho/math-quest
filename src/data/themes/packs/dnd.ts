import type { ThemePack } from '../../../types';

export const dndPack: ThemePack = {
  id: 'dnd',
  label: 'Quest & Dice',
  tagline: 'Map out. Dice on the path. The dragon’s already walking.',
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
  byAge: {
    early: {
      tagline: 'A tiny dragon found a scroll. Count the gold before the next quest.',
      hooks: {
        addition: [
          'Add gold and supplies so the party knows the total.',
          'When a quest pays extra, add it to the bag.',
        ],
        subtraction: [
          'Spending gold or using supplies means some go away.',
          'Subtract to see what the party still has.',
        ],
        multiplication: [
          'Same kit for every hero? Multiply to pack the party.',
          'Equal groups of potions — multiply for the haul.',
        ],
        division: [
          'Share treasure fairly.',
          'Split loot into equal hero shares.',
        ],
      },
      exampleStories: {
        addition: [
          'The party finds {a} gold and earns {b} more.',
          'You have {a} arrows and buy {b} more.',
        ],
        subtraction: [
          'You have {a} hearts and lose {b} (just numbers!).',
          'The chest has {a} gold; snacks cost {b}.',
        ],
        multiplication: [
          '{a} heroes carry {b} snacks each.',
          'You make {a} potions using {b} herbs each.',
        ],
        division: [
          'Share {a} gold among {b} heroes.',
          'Split {a} scrolls into {b} equal packs.',
        ],
      },
    },
    middle: {
      tagline: 'Quest & Dice: gold in, potions out, split the haul.',
      hooks: {
        addition: [
          'Addition keeps gold and supply totals honest.',
          'Quest payouts get added to the party fund.',
        ],
        subtraction: [
          'Purchases and losses come off the count.',
          'After a restock or a hit, subtract what changed.',
        ],
        multiplication: [
          'Equal kits scale with party size.',
          'Multiply stacked potions for the full haul.',
        ],
        division: [
          'Split treasure into equal shares.',
          'Division keeps the party from arguing over loot.',
        ],
      },
      exampleStories: {
        addition: [
          'The party finds {a} gold and earns {b} more from a quest.',
          'You have {a} arrows and buy {b} at the market.',
        ],
        subtraction: [
          'Hit points start at {a} and drop {b}.',
          'The chest has {a} gold; supplies cost {b}.',
        ],
        multiplication: [
          'Each of {a} heroes carries {b} rations.',
          'You brew {a} potions using {b} herbs each.',
        ],
        division: [
          'Split {a} gold among {b} party members.',
          'Divide {a} scrolls into {b} equal packs.',
        ],
      },
    },
    high: {
      tagline: 'Campaign books: hit points, gold, and each hero’s share.',
      hooks: {
        addition: [
          'Addition combines two holdings into one party total.',
          'Payouts are added to the current fund.',
        ],
        subtraction: [
          'Subtraction records a spend or a loss.',
          'Remaining balance is start minus used.',
        ],
        multiplication: [
          'Equal loads scale by party size.',
          'Stack size times count is the haul.',
        ],
        division: [
          'Division allocates a total into equal shares.',
          'Per-person cut is the haul divided by the roster.',
        ],
      },
      exampleStories: {
        addition: [
          'Fund is {a}; a contract adds {b}.',
          'Quiver holds {a}; you requisition {b} more.',
        ],
        subtraction: [
          'Hit points start at {a} and fall by {b}.',
          'Chest balance {a}; supply cost {b}.',
        ],
        multiplication: [
          '{a} people × {b} rations each.',
          '{a} brews using {b} reagents each.',
        ],
        division: [
          'Split {a} gold across {b} members.',
          'Divide {a} items into {b} equal packs.',
        ],
      },
    },
  },
};
