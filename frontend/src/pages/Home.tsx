import InfiniteArtWall from '../components/InfiniteArtWall';
import CentralLogo from '../components/CentralLogo';
import ErrorBoundary from '../components/ErrorBoundary';
import type { Artwork } from '../data/artworks';
import { useFetch } from '../hooks/useFetch';
import type { Collection, Product, Settings } from '../lib/api';

const TILES = 27, FLAT = 'var(--cream)'; // 27 wall tiles; FLAT = neutral colour used when a tile has no real photo

type Slot = Omit<Artwork, 'id' | 'tone'>;
const slot = (image: string, title: string, caption: string, to: string): Slot => ({ image, title, caption, to });

// The wall shows REAL images only, all read live from the database (managed in the admin):
// 1) tiles curated in Admin → Settings → Homepage, if any have an image; otherwise
// 2) every collection's images (round-robin so each collection appears), then each product's main image.
function realSlots(cols: Collection[], prods: Product[], s: Settings | null): Slot[] {
  const curated = (s?.wall ?? []).filter((t) => t.active !== false && t.image).map((t) => slot(t.image, t.title, t.caption || t.title, t.to || '/collections'));
  if (curated.length) return curated;
  const lists = cols.map((c) => (c.images?.length ? c.images : c.image ? [c.image] : []).map((u) => slot(u, c.title, c.title, `/collections/${c.slug}`)));
  const out: Slot[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) lists.forEach((l) => l[i] && out.push(l[i]));
  prods.forEach((p) => p.images[0]?.url && out.push(slot(p.images[0].url, p.title, `${p.title} · ${p.price} TND`, `/products/${p.slug}`)));
  const seen = new Set<string>();
  return out.filter((o) => (o.image && !seen.has(o.image) ? (seen.add(o.image), true) : false));
}

function buildTiles(cols: Collection[], prods: Product[], s: Settings | null, ready: boolean): Artwork[] {
  const real = ready ? realSlots(cols, prods, s) : [];
  if (real.length) return Array.from({ length: TILES }, (_, i) => ({ id: `w${i}`, tone: FLAT, ...real[i % real.length] }));
  // No real photos (yet): plain neutral tiles, labelled with collection names when they exist. Nothing is drawn or invented.
  const names = ready && cols.length ? cols : [null];
  return Array.from({ length: TILES }, (_, i) => { const c = names[i % names.length]; return { id: `f${i}`, tone: FLAT, title: c?.title ?? '', caption: c?.title ?? '', to: c ? `/collections/${c.slug}` : '/collections' }; });
}

export default function Home() {
  const settings = useFetch<Settings>('/settings'), cols = useFetch<Collection[]>('/collections'), prods = useFetch<Product[]>('/products');
  const ready = !settings.loading && !cols.loading && !prods.loading;
  return (
    <div className="home">
      <ErrorBoundary><InfiniteArtWall items={buildTiles(cols.data ?? [], prods.data ?? [], settings.data, ready)} /></ErrorBoundary>
      <CentralLogo />
    </div>
  );
}
