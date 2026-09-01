import type { ThemePack } from '../../../types';

export const minecraftPack: ThemePack = {
  id: 'minecraft',
  label: 'Block World',
  tagline: 'Build, mine, and craft with numbers',
  hooks: {
    addition: [
      'Stack resources the smart way: add piles of blocks to know your total stash.',
      'When you mine more ore, addition tells you how much you have in the chest.',
    ],
    subtraction: [
      'Building spends blocks — subtraction shows what is left in inventory.',
      'When you place blocks from a stack, subtract to see the new count.',
    ],
    multiplication: [
      'Craft in batches: multiply stacks to plan big builds.',
      'If each chest holds the same amount, multiply to total your storage.',
    ],
    division: [
      'Share loot equally among friends with division.',
      'Split a stack of blocks into equal piles for each build site.',
    ],
  },
  exampleStories: {
    addition: [
      'You gather {a} oak planks and find {b} more in a chest.',
      'Your minecart hauls {a} cobblestone, then {b} more.',
    ],
    subtraction: [
      'You have {a} torches and place {b} along a path.',
      'A stack of {a} wool loses {b} used for a bed.',
    ],
    multiplication: [
      'You craft {a} batches with {b} bricks in each batch.',
      'There are {a} rows of farms with {b} crops each.',
    ],
    division: [
      'Split {a} carrots evenly among {b} villagers.',
      'Divide {a} rails into {b} equal track sections.',
    ],
  },
  units: ['blocks', 'planks', 'ores'],
};
