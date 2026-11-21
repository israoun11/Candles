export const GOVERNORATES = ['Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan','Kasserine','Kébili','Le Kef','Mahdia','La Manouba','Médenine','Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan'] as const;

export const COLLECTIONS = [
  { slug: 'the-shape-club', title: 'The Shape Club', description: 'Artistic sculptural candles.', order: 1 },
  { slug: 'the-scent-club', title: 'The Scent Club', description: 'Scented candles in decorative glass containers.', order: 2 },
  { slug: 'little-happy-things', title: 'Little Happy Things', description: 'Small playful decorative candles.', order: 3 },
  { slug: 'the-artisra-boxes', title: 'The Artisra Boxes', description: 'Gift sets.', order: 4 },
];
const colors = ['Candy Pink', 'Butter Yellow', 'Soft Green', 'Peach', 'Lavender', 'Cream', 'Coral'];
const byColor = (n = 3) => colors.slice(0, n).map((c) => ({ label: c, color: c, stock: 10 }));
const byScent = (f: string) => [{ label: f, fragrance: f, stock: 10 }];
const one = [{ label: 'Standard', stock: 10 }];
// Demo prices and demo stock (10). All editable from the admin dashboard; none are confirmed product facts.
const P = (slug: string, title: string, collection: string, price: number, description: string, variants: { label: string; color?: string; fragrance?: string; stock: number }[], sortOrder: number) =>
  ({ slug, title, collection, price, description, variants, images: [], details: [], active: true, sortOrder });
export const PRODUCTS = [
  P('the-twist', 'The Twist', 'the-shape-club', 35, 'Twisted sculptural candle.', byColor(), 1),
  P('bubble-pop', 'Bubble Pop', 'the-shape-club', 40, 'Bubble-shaped decorative candle.', byColor(), 2),
  P('wavy-baby', 'Wavy Baby', 'the-shape-club', 38, 'Wavy sculptural candle.', byColor(), 3),
  P('the-daisy', 'The Daisy', 'the-shape-club', 32, 'Three-dimensional flower-shaped candle.', byColor(), 4),
  P('sunday-mood', 'Sunday Mood', 'the-scent-club', 45, 'Scented candle in a decorative glass container.', byScent('Vanilla & Cream'), 5),
  P('slow-morning', 'Slow Morning', 'the-scent-club', 48, 'Scented candle in a decorative glass container.', byScent('Lavender & Cotton'), 6),
  P('golden-hour', 'Golden Hour', 'the-scent-club', 50, 'Scented candle in a decorative glass container.', byScent('Amber & Vanilla'), 7),
  P('sweet-escape', 'Sweet Escape', 'the-scent-club', 48, 'Scented candle in a decorative glass container.', byScent('Strawberry & Rose'), 8),
  P('cherry-baby', 'Cherry Baby', 'little-happy-things', 22, 'Cherry-shaped candle.', one, 9),
  P('daisy-days', 'Daisy Days', 'little-happy-things', 20, 'Small flower-shaped candle.', one, 10),
  P('peachy', 'Peachy', 'little-happy-things', 24, 'Peach-shaped candle.', one, 11),
  P('mini-bloom', 'Mini Bloom', 'little-happy-things', 18, 'Small flower-shaped candle.', one, 12),
  P('little-joy-box', 'Little Joy Box', 'the-artisra-boxes', 38, 'Two mini candles.', one, 13),
  P('the-color-box', 'The Color Box', 'the-artisra-boxes', 65, 'Two sculptural candles.', one, 14),
  P('self-love-box', 'Self Love Box', 'the-artisra-boxes', 62, 'One scented candle and one mini candle.', one, 15),
  P('artisra-box', 'Artisra Box', 'the-artisra-boxes', 95, 'Three mixed candles.', one, 16),
];
export const DEFAULT_SETTINGS = {
  home: { tagline: 'Light up your little world.', intro: 'Handcrafted candles for people who see the world a little differently.' },
  announcement: { active: true, text: 'Cash on delivery across Tunisia. All prices in TND.' },
  contact: { email: '', phone: '', whatsapp: '', address: '' },
  socials: [] as { label: string; href: string }[],
  shipping: { fee: 7, freeOver: 0, note: 'Delivery fees are examples until you set your real rates.' },
  wall: [] as { title: string; caption: string; to: string; image: string; active: boolean }[],
  about: {
    headline: 'Not just candles. Little pieces of happiness.',
    intro: [
      'At Artisra, we believe everyday objects deserve a little imagination.',
      'That’s why we create playful candles inspired by colors, shapes, scents and the little things that make life beautiful.',
      'From sculptural designs to cozy scented moments, every piece is made to bring a little more personality into your space.',
    ],
    portrait: '',
    chapters: [
      { tag: 'Shapes', title: 'Everyday objects deserve imagination', lines: ['At Artisra, we believe everyday objects deserve a little imagination.', 'That’s why we create playful candles inspired by colors, shapes, scents and the little things that make life beautiful.'] },
      { tag: 'Scents', title: 'Cozy scented moments', lines: ['From sculptural designs to cozy scented moments,', 'every piece is made to bring a little more personality into your space.'] },
      { tag: 'Joy', title: 'Little pieces of happiness', lines: ['Not just candles.', 'Made to glow. Designed to be loved.'] },
    ],
    closing: 'Make room for a little glow.',
    spiral: [] as string[],
  },
  contactPage: {
    heading: 'Let’s talk',
    intro: 'Questions about a candle, an order or something made just for you? Send us a message.',
    slides: [] as string[],
    faq: [
      { q: 'How do I pay?', a: 'Cash on delivery across Tunisia.' },
      { q: 'Where do you deliver?', a: 'All 24 governorates; fees are shown at checkout.' },
      { q: 'Can I change my order?', a: 'Message us with your order number as soon as you can.' },
    ],
  },
};
