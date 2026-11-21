import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from '../components/Placeholder';
import SafeImg from '../components/SafeImg';
import { artworks } from '../data/artworks';
import { useFetch } from '../hooks/useFetch';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import type { Settings } from '../lib/api';

const N = 48, STEP = 30, RADIUS = 290, DY = 23; // 48 cards, 30° apart (12 per turn, 4 turns), 23px rise each
const PINK: [number, number, number] = [244, 184, 197], BURGUNDY: [number, number, number] = [77, 18, 36], CREAM: [number, number, number] = [248, 241, 235], DIM: [number, number, number] = [130, 80, 95];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
const Chars = ({ text }: { text: string }) => <>{text.split(' ').map((w, wi) => <span key={wi} className="w">{[...w].map((c, i) => <span key={i} className="c">{c}</span>)}{' '}</span>)}</>;

export default function AboutPage() {
  const { data: settings, error } = useFetch<Settings>('/settings');
  const about = settings?.about;
  const story = useRef<HTMLElement>(null), quote = useRef<HTMLElement>(null), spin = useRef<HTMLDivElement>(null), wrap = useRef<HTMLDivElement>(null), chap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!about) return;
    const reduced = prefersReducedMotion();
    const sp = spin.current!, wr = wrap.current!, st = story.current!, qu = quote.current!;
    const cards = [...sp.querySelectorAll<HTMLElement>('.sp-card')];
    const blur = cards.map((c) => c.querySelector<HTMLElement>('.sp-blur')!), fog = cards.map((c) => c.querySelector<HTMLElement>('.sp-fog')!);
    const chs = [...chap.current!.children].map((el) => ({ el: el as HTMLElement, chars: [...el.querySelectorAll<HTMLElement>('h2 .c')], lines: [...el.querySelectorAll<HTMLElement>('.ln')] }));
    const n = chs.length;
    const qChars = [...qu.querySelectorAll<HTMLElement>('blockquote .c')], actions = qu.querySelector<HTMLElement>('.q-actions')!;
    const fit = () => sp.style.setProperty('--k', String(Math.min(1, innerWidth / 1000, (innerHeight * 0.7) / (N * DY))));
    fit(); addEventListener('resize', fit);
    let rot = 0, auto = 0, last = performance.now(), raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000; last = now;
      const vh = innerHeight, p = clamp(-st.getBoundingClientRect().top / (st.offsetHeight - vh));
      if (!reduced) auto += 6 * dt; // slow idle rotation, 6°/s
      rot += (p * 540 + auto - rot) * Math.min(1, dt * 4); // scroll-linked, eased
      sp.style.transform = `rotateX(-10deg) rotateY(${rot.toFixed(2)}deg)`;
      wr.style.opacity = String(p < 0.05 ? (p / 0.05) * 0.72 : p < 0.12 ? 0.72 + ((p - 0.05) / 0.07) * 0.28 : 1);
      cards.forEach((_, i) => { const d = (1 - Math.cos(((i * STEP + rot) * Math.PI) / 180)) / 2; blur[i].style.opacity = d.toFixed(3); fog[i].style.opacity = (d * 0.68).toFixed(3); });
      chs.forEach((c, ci) => {
        const s = ci / n, e = (ci + 1) / n, t = clamp((p - s) / (e - s));
        const op = Math.min(clamp((p - s) / 0.03), ci < n - 1 ? 1 - clamp((p - e + 0.03) / 0.03) : 1);
        c.el.style.opacity = String(op); c.el.style.transform = `translateY(${(1 - op) * 18}px)`; c.el.style.visibility = op > 0 ? 'visible' : 'hidden';
        c.el.dataset.state = p > e ? 'read' : t > 0 ? 'active' : 'idle';
        const tp = clamp(t / 0.55) * c.chars.length; c.chars.forEach((ch, i) => { ch.style.color = mix(PINK, BURGUNDY, clamp(tp - i)); });
        const lp = clamp((t - 0.15) / 0.5) * c.lines.length; c.lines.forEach((l, i) => { l.style.opacity = String(clamp(lp - i)); });
      });
      const q = clamp((vh * 0.85 - qu.getBoundingClientRect().top) / (qu.offsetHeight * 0.6));
      qChars.forEach((c, i) => { c.style.color = mix(DIM, CREAM, clamp(q * qChars.length * 1.1 - i)); });
      actions.style.opacity = q > 0.95 ? '1' : '0'; actions.style.pointerEvents = q > 0.95 ? 'auto' : 'none';
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); };
  }, [about]);

  if (error) return <div className="pg"><p role="alert" className="fail">{error}</p></div>;
  if (!about) return <div className="pg"><p className="label center">Loading…</p></div>;
  const insta = settings.socials.find((s) => /instagram/i.test(s.label));
  return (
    <div className="about">
      <section className="about-intro">
        <div className="intro-text">
          <p className="eyebrow">Our story</p>
          <p className="note-hand">hi, we’re Artisra <svg viewBox="0 0 80 40" aria-hidden><path d="M2 8 C 30 2, 55 10, 74 32 M74 32 l-14 -3 M74 32 l-3 -14" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" /></svg></p>
          {about.intro.map((t) => <p key={t}>{t}</p>)}
        </div>
        <div className="intro-art">
          <figure className="portrait"><SafeImg key={about.portrait} src={about.portrait} alt="Artisra" fallback={<Placeholder tone="var(--cream)" label="Artisra photo (add in the admin)" />} /></figure>
          <h1 className="label-card">
            <svg className="flame" viewBox="0 0 24 34" aria-hidden><path d="M12 1c3 6 8 9 8 16a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 2 4 1-4 0-8 2-12z" fill="var(--orange)" /><path d="M12 33V22" stroke="var(--brown)" strokeWidth="1.4" /></svg>
            <span className="lc-brand">Artisra · handmade candles</span>
            <span className="lc-quote">{about.headline}</span>
            <span className="lc-foot">Made to glow. Designed to be loved.</span>
          </h1>
        </div>
      </section>

      <section ref={story} className="story" aria-label="Our story">
        <div className="story-pin">
          <div ref={wrap} className="sp-wrap" aria-hidden>
            <div className="sp-stage"><div ref={spin} className="sp-spin">
              {Array.from({ length: N }, (_, i) => {
                const url = about.spiral.length ? about.spiral[i % about.spiral.length] : '';
                const a = artworks[i % artworks.length];
                const art = <SafeImg key={url} src={url} alt="" fallback={<Placeholder tone={a.tone} label={a.title} />} />;
                return (
                  <div key={i} className="sp-card" style={{ transform: `translateY(calc(${(i - N / 2) * DY}px * var(--k))) rotateY(${i * STEP}deg) translateZ(calc(${RADIUS}px * var(--k)))` }}>
                    <div className="sp-sharp">{art}</div><div className="sp-blur">{art}</div><div className="sp-fog" />
                  </div>
                );
              })}
            </div></div>
          </div>
          <div ref={chap} className="chapters">
            {about.chapters.map((c, i) => (
              <article key={i} className="chapter">
                <p className="label">{String(i + 1).padStart(2, '0')} · {c.tag}</p>
                <h2><Chars text={c.title} /></h2>
                {c.lines.map((l) => <p key={l} className="ln">{l}</p>)}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={quote} className="quote">
        <blockquote><Chars text={about.closing} /></blockquote>
        <p className="sig">— Artisra</p>
        <div className="q-actions">
          <Link className="btn light" to="/collections">See the collection</Link>
          {insta && <a className="btn light" href={insta.href} target="_blank" rel="noreferrer">Follow on Instagram</a>}
        </div>
      </section>
    </div>
  );
}
