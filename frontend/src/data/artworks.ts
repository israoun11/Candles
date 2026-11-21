// Single source for the wall. 27 originals; replace `image`/`lqip` per tile with real photography.
export interface Artwork { id: string; title: string; caption: string; to: string; tone: string; image?: string; lqip?: string }
const t = ['var(--pink)', 'var(--butter)', 'var(--green)', 'var(--peach)', 'var(--lavender)', 'var(--cream)', 'var(--coral)'];
const p = (id: string, title: string, price: number, i: number): Artwork =>
  ({ id, title, caption: `${title} · ${price} TND`, to: `/products/${id}`, tone: t[i % t.length] });
const s = (id: string, title: string, i: number): Artwork => ({ id, title, caption: title, to: '/collections', tone: t[(i + 3) % t.length] });
export const artworks: Artwork[] = [
  p('the-twist', 'The Twist', 35, 0), p('bubble-pop', 'Bubble Pop', 40, 1), p('wavy-baby', 'Wavy Baby', 38, 2), p('the-daisy', 'The Daisy', 32, 3),
  p('sunday-mood', 'Sunday Mood', 45, 4), p('slow-morning', 'Slow Morning', 48, 5), p('golden-hour', 'Golden Hour', 50, 6), p('sweet-escape', 'Sweet Escape', 48, 0),
  p('cherry-baby', 'Cherry Baby', 22, 1), p('daisy-days', 'Daisy Days', 20, 2), p('peachy', 'Peachy', 24, 3), p('mini-bloom', 'Mini Bloom', 18, 4),
  p('little-joy-box', 'Little Joy Box', 38, 5), p('the-color-box', 'The Color Box', 65, 6), p('self-love-box', 'Self Love Box', 62, 0), p('artisra-box', 'Artisra Box', 95, 1),
  ...['Twist, close-up', 'Bubble, in the studio', 'Wavy, window light', 'Daisy and vase', 'Jars on travertine', 'Peach on a plinth', 'Cherry pair', 'Gift box, open', 'Pouring wax', 'Wicks, detail', 'Colour studies'].map((n, i) => s(`still-${i + 1}`, n, i)),
];
