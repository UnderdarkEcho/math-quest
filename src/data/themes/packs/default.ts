import type { ThemePack } from '../../../types';

export const defaultPack: ThemePack = {
  id: 'default',
  label: 'Classic',
  tagline: 'The owl with the calculator belly just claimed the front desk. Your move.',
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
  byAge: {
    early: {
      tagline: 'Meet the counting owl. Wave back, then add the numbers on its belly.',
      hooks: {
        addition: [
          'Addition means putting two groups together.',
          'When you add, you find how many you have in all.',
        ],
        subtraction: [
          'Subtraction means taking some away.',
          'When you subtract, you find how many are left.',
        ],
        multiplication: [
          'Multiplication is adding the same group again and again.',
          'Same-size groups? Multiply to get the total.',
        ],
        division: [
          'Division means sharing equally.',
          'Division asks how many in each fair share.',
        ],
      },
      exampleStories: {
        addition: [
          'You have {a} stickers and get {b} more.',
          'There are {a} red blocks and {b} blue blocks.',
        ],
        subtraction: [
          'You have {a} crackers and eat {b}.',
          'A jar has {a} marbles; you take out {b}.',
        ],
        multiplication: [
          'You pack {a} boxes with {b} toys in each.',
          'There are {a} rows of {b} seats.',
        ],
        division: [
          'Share {a} apples equally among {b} friends.',
          'Split {a} cards into {b} equal piles.',
        ],
      },
    },
    middle: {
      tagline: 'Visor owl in a hoodie. Late-night grind. The keypad is the whole point.',
      hooks: {
        addition: [
          'Addition combines two amounts into one total.',
          'Use addition when two counts belong together.',
        ],
        subtraction: [
          'Subtraction finds what remains or the gap between two amounts.',
          'Take away, or compare — both are subtraction.',
        ],
        multiplication: [
          'Multiplication is repeated equal groups, written short.',
          'Same size groups? Multiply instead of adding over and over.',
        ],
        division: [
          'Division splits a total into equal parts, or asks how many groups fit.',
          'Division undoes multiplication.',
        ],
      },
      exampleStories: {
        addition: [
          'A playlist has {a} songs; you add {b} more.',
          'Team A scores {a} and team B scores {b}.',
        ],
        subtraction: [
          'You start with {a} points and spend {b}.',
          'A battery shows {a}% and drops {b}.',
        ],
        multiplication: [
          'You run {a} sets of {b} reps.',
          'There are {a} rows with {b} seats in each row.',
        ],
        division: [
          'Split {a} tickets evenly among {b} friends.',
          'Deal {a} cards into {b} equal hands.',
        ],
      },
    },
    high: {
      tagline: 'Teal-and-gold owl emblem. Quiet desk. Sharp numbers.',
      hooks: {
        addition: [
          'Addition combines two quantities into a single total.',
          'Use addition when two measurements belong in one sum.',
        ],
        subtraction: [
          'Subtraction finds a remainder or a difference.',
          'Compare two values, or take one from the other.',
        ],
        multiplication: [
          'Multiplication scales a quantity by equal groups.',
          'Repeated addition of a constant is multiplication.',
        ],
        division: [
          'Division partitions a total, or finds how many groups fit.',
          'Division is the inverse of multiplication.',
        ],
      },
      exampleStories: {
        addition: [
          'A reading is {a}. A second measurement adds {b}.',
          'Account A holds {a} and account B holds {b}.',
        ],
        subtraction: [
          'Balance starts at {a} and {b} is withdrawn.',
          'A count of {a} drops by {b}.',
        ],
        multiplication: [
          'You have {a} lots of {b} units each.',
          'Rate {b} for each of {a} intervals.',
        ],
        division: [
          'Split {a} units evenly across {b} groups.',
          'A total of {a} is shared among {b} people.',
        ],
      },
    },
  },
};
