import type { ThemePack } from '../../../types';

export const minecraftPack: ThemePack = {
  id: 'minecraft',
  label: 'Block World',
  tagline: 'Sunny block hills, a cart of gems, and a miner who won’t sit still.',
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
  byAge: {
    early: {
      tagline: 'A little block miner found a pickaxe. Help count the treasures.',
      hooks: {
        addition: [
          'Put block piles together to see how many you have.',
          'When you find more ore, add it to your chest.',
        ],
        subtraction: [
          'Using blocks to build means some leave the stack.',
          'Place some, then see how many blocks are left.',
        ],
        multiplication: [
          'Same-size chests? Multiply to count them all.',
          'Craft the same recipe again and again — that’s multiplying.',
        ],
        division: [
          'Share blocks fairly with friends.',
          'Split a stack into equal piles.',
        ],
      },
      exampleStories: {
        addition: [
          'You pick up {a} oak planks and find {b} more.',
          'A chest has {a} cobblestone; you mine {b} more.',
        ],
        subtraction: [
          'You have {a} torches and place {b}.',
          'A stack of {a} wool uses {b} for a bed.',
        ],
        multiplication: [
          'You make {a} chests with {b} items in each.',
          'There are {a} farm rows with {b} crops each.',
        ],
        division: [
          'Share {a} carrots with {b} friends.',
          'Split {a} rails into {b} equal paths.',
        ],
      },
    },
    middle: {
      tagline: 'Block World at dusk: inventory check, then the cave run.',
      hooks: {
        addition: [
          'Addition totals what you mined, crafted, and stored.',
          'Combine stacks to know the real stash.',
        ],
        subtraction: [
          'Building spends inventory — subtract to see what’s left.',
          'Place a stack, then update the count.',
        ],
        multiplication: [
          'Batch crafts: multiply recipe size by how many batches.',
          'Equal chests mean you can multiply instead of adding.',
        ],
        division: [
          'Split loot into equal shares.',
          'Divide a stack into matching build kits.',
        ],
      },
      exampleStories: {
        addition: [
          'You haul {a} cobblestone, then {b} more.',
          'Two chests hold {a} and {b} oak planks.',
        ],
        subtraction: [
          'A stack of {a} torches; you place {b} along a mineshaft.',
          'You had {a} wool and used {b}.',
        ],
        multiplication: [
          'You craft {a} batches with {b} bricks each.',
          '{a} farm rows with {b} crops each.',
        ],
        division: [
          'Split {a} carrots among {b} villagers.',
          'Divide {a} rails into {b} equal sections.',
        ],
      },
    },
    high: {
      tagline: 'Block-world haul at dusk. Count the stacks. Plan the build.',
      hooks: {
        addition: [
          'Addition combines two resource counts into one inventory total.',
          'Sum incoming stacks with what you already stored.',
        ],
        subtraction: [
          'Subtraction updates inventory after a spend or a place.',
          'Remaining stock is starting count minus used.',
        ],
        multiplication: [
          'Equal stacks scale by multiplication.',
          'Batches times recipe size is the output count.',
        ],
        division: [
          'Division splits a stockpile into equal shares or kits.',
          'Unit size is total divided by number of groups.',
        ],
      },
      exampleStories: {
        addition: [
          'Stock is {a} units; a haul adds {b}.',
          'Chest A holds {a}, chest B holds {b}.',
        ],
        subtraction: [
          'Inventory starts at {a}; {b} are placed.',
          'A stack of {a} loses {b} used in a build.',
        ],
        multiplication: [
          '{a} batches of {b} units each.',
          '{a} rows at {b} per row.',
        ],
        division: [
          'Split {a} units across {b} sites.',
          'Divide {a} rails into {b} equal runs.',
        ],
      },
    },
  },
};
