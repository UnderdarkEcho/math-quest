import type { ThemePack } from '../../../types';

export const defaultPack: ThemePack = {
  id: 'default',
  label: 'Classic',
  tagline: 'Clear, friendly math practice',
  hooks: {
    addition: [
      'Addition means putting two amounts together into one total.',
      'When you combine groups, addition finds how many you have altogether.',
    ],
    subtraction: [
      'Subtraction finds how much is left after you take some away.',
      'Use subtraction to compare two amounts or find a difference.',
    ],
    multiplication: [
      'Multiplication is a fast way to add equal groups.',
      'When every group has the same size, multiply to get the total.',
    ],
    division: [
      'Division splits a total into equal shares or equal groups.',
      'Division asks: how many fit evenly into each group?',
    ],
  },
  exampleStories: {
    addition: [
      'You have {a} stickers and get {b} more.',
      'There are {a} red blocks and {b} blue blocks.',
    ],
    subtraction: [
      'You start with {a} points and use {b}.',
      'A jar holds {a} marbles; you take out {b}.',
    ],
    multiplication: [
      'You pack {a} boxes with {b} items in each.',
      'There are {a} rows with {b} seats in each row.',
    ],
    division: [
      'Share {a} apples equally among {b} friends.',
      'Split {a} cards into {b} equal piles.',
    ],
  },
  units: ['items', 'points', 'blocks'],
};
