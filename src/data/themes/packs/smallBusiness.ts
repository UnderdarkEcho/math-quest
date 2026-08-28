import type { ThemePack } from '../../../types';

export const smallBusinessPack: ThemePack = {
  id: 'small-business',
  label: 'Small Business',
  tagline: 'Market day. Lemonade, muffins, and a till that won’t balance itself.',
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
  byAge: {
    early: {
      tagline: 'A fox in an apron pours lemonade. Help count the cups and treats.',
      hooks: {
        addition: [
          'Add morning sales and afternoon sales.',
          'New muffins plus old muffins — that’s the new pile.',
        ],
        subtraction: [
          'When you sell something, subtract to see what’s left.',
          'Making change also uses subtraction.',
        ],
        multiplication: [
          'Same-size packs? Multiply to count what’s inside.',
          'Each day the same amount — multiply for many days.',
        ],
        division: [
          'Share tips fairly.',
          'Split cookies into equal boxes.',
        ],
      },
      exampleStories: {
        addition: [
          'The stand earns ${a} in the morning and ${b} later.',
          'You have {a} muffins and get {b} more.',
        ],
        subtraction: [
          'The jar has ${a}; you give ${b} in change.',
          'You had {a} candles and sold {b}.',
        ],
        multiplication: [
          'You sell {a} packs with {b} stickers in each.',
          'Each of {a} days you sell {b} cups.',
        ],
        division: [
          'Share ${a} of tips with {b} helpers.',
          'Split {a} cookies into {b} boxes.',
        ],
      },
    },
    middle: {
      tagline: 'Small Business: slammed shop, two shifts, one total.',
      hooks: {
        addition: [
          'Addition combines two sales windows into one day total.',
          'Restock: old inventory plus the delivery.',
        ],
        subtraction: [
          'Sold items come off the shelf count.',
          'Cash out minus change is subtraction.',
        ],
        multiplication: [
          'Price times quantity plans an order.',
          'Equal boxes scale by multiplication.',
        ],
        division: [
          'Split earnings among helpers.',
          'Unit price is pack total divided by count.',
        ],
      },
      exampleStories: {
        addition: [
          'Morning take is ${a}; afternoon adds ${b}.',
          'You have {a} muffins and receive {b} more.',
        ],
        subtraction: [
          'Till shows ${a}; change given is ${b}.',
          'Shelf had {a} candles; {b} sold.',
        ],
        multiplication: [
          '{a} packs with {b} in each pack.',
          '{a} days selling {b} each day.',
        ],
        division: [
          'Split ${a} among {b} helpers.',
          'Divide {a} cookies into {b} boxes.',
        ],
      },
    },
    high: {
      tagline: 'Storefront at dusk. Revenue, stock, and a clean close.',
      hooks: {
        addition: [
          'Addition combines two revenue windows into one total.',
          'On-hand stock plus inbound delivery is the new count.',
        ],
        subtraction: [
          'Subtraction records units sold or cash paid out.',
          'Remaining inventory is start minus sold.',
        ],
        multiplication: [
          'Quantity times unit size (or price) is the extension.',
          'Equal lots scale by multiplication.',
        ],
        division: [
          'Division allocates a total across partners or packs.',
          'Unit rate is total divided by count.',
        ],
      },
      exampleStories: {
        addition: [
          'Morning revenue ${a}; afternoon ${b}.',
          'On hand {a}; delivery adds {b}.',
        ],
        subtraction: [
          'Till ${a}; payout ${b}.',
          'Stock {a}; units sold {b}.',
        ],
        multiplication: [
          '{a} lots × {b} per lot.',
          '{a} periods at {b} per period.',
        ],
        division: [
          'Split ${a} across {b} partners.',
          'Divide {a} units into {b} packs.',
        ],
      },
    },
  },
};
