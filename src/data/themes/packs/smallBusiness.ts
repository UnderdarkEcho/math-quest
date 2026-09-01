import type { ThemePack } from '../../../types';

export const smallBusinessPack: ThemePack = {
  id: 'small-business',
  label: 'Small Business',
  tagline: 'Shops, sales, and smart totals',
  hooks: {
    addition: [
      'Morning sales plus afternoon sales — add them to know what the shop earned.',
      'Restocking shelves? Addition combines old stock with new deliveries.',
    ],
    subtraction: [
      'Make change or sell inventory — subtraction updates what’s left.',
      'When costs come out of the till, subtract to see remaining cash.',
    ],
    multiplication: [
      'Price times quantity: multiplication plans big orders and multi-day sales.',
      'If each box holds the same amount, multiply for total inventory.',
    ],
    division: [
      'Split earnings or stock equally — division keeps partners fair.',
      'Find a unit price by dividing a pack total by how many items are inside.',
    ],
  },
  exampleStories: {
    addition: [
      'The lemonade stand earns ${a} in the morning and ${b} after lunch.',
      'You restock {a} muffins and receive {b} more from the bakery.',
    ],
    subtraction: [
      'The till has ${a}; a customer pays with a bill and you give ${b} in change from sales math.',
      'You had {a} candles on the shelf and sold {b}.',
    ],
    multiplication: [
      'You sell {a} packs with {b} stickers in each pack.',
      'Each of {a} days you sell {b} smoothies.',
    ],
    division: [
      'Split ${a} of tip money evenly among {b} helpers.',
      'Divide {a} cookies into {b} equal gift boxes.',
    ],
  },
  units: ['sales', 'stock', 'customers'],
};
