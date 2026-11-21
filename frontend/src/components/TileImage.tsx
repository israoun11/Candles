import { useState } from 'react';
import type { Artwork } from '../data/artworks';

// Real photo only: a blurred preview (if any) first, then the sharp image fades in.
// A tile without a photo, or whose file fails to load, is a plain neutral block (no drawn placeholder).
export default function TileImage({ a }: { a: Artwork }) {
  const [ok, setOk] = useState(false), [bad, setBad] = useState(false);
  if (!a.image || bad) return <div className="tile-img" style={{ background: a.tone }} />;
  return (
    <div className="tile-img" style={{ background: a.tone }}>
      {a.lqip && !ok && <div className="tile-lq" style={{ backgroundImage: `url(${a.lqip})` }} />}
      <img src={a.image} alt={a.title} loading="lazy" draggable={false} className={ok ? 'in' : ''} onLoad={() => setOk(true)} onError={() => setBad(true)} />
    </div>
  );
}
