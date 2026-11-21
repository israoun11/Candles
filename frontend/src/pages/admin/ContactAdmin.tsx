import { Card, fromImgs, ImageListEditor, toImgs } from './ui';
import { useSettingsDoc } from './useSettings';

export default function ContactAdmin() {
  const { s, update, save, err, ok, busy } = useSettingsDoc();
  if (!s) return <>{err ? <p role="alert" className="a-err">{err}</p> : <p className="a-muted">Loading…</p>}</>;
  const c = s.contactPage, set = (p: Partial<typeof c>) => update({ contactPage: { ...c, ...p } });
  return (
    <>
      <Card title="Heading and introduction">
        <label className="a-fld"><span>Heading</span><input value={c.heading} onChange={(e) => set({ heading: e.target.value })} /></label>
        <label className="a-fld"><span>Introduction</span><textarea rows={2} value={c.intro} onChange={(e) => set({ intro: e.target.value })} /></label>
      </Card>
      <Card title="Slideshow images" desc="They cross-fade in this order. With none, placeholders are shown.">
        <ImageListEditor max={12} items={toImgs(c.slides)} onChange={(i) => set({ slides: fromImgs(i) })} />
      </Card>
      <Card title="Frequently asked questions" actions={c.faq.length < 10 ? <button className="a-btn" onClick={() => set({ faq: [...c.faq, { q: '', a: '' }] })}>Add question</button> : undefined}>
        {c.faq.map((f, i) => (
          <div key={i} className="a-chap">
            <label className="a-fld"><span>Question</span><input value={f.q} onChange={(e) => set({ faq: c.faq.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)) })} /></label>
            <label className="a-fld"><span>Answer</span><textarea rows={2} value={f.a} onChange={(e) => set({ faq: c.faq.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)) })} /></label>
            <button className="a-btn danger" onClick={() => set({ faq: c.faq.filter((_, k) => k !== i) })}>Remove</button>
          </div>
        ))}
        <p className="a-hint">Email, phone, WhatsApp and social links are in Settings.</p>
      </Card>
      <div className="a-savebar">{err && <span role="alert" className="a-err">{err}</span>}{ok && <span role="status" className="a-ok">Saved — Contact page updated.</span>}<button className="a-btn primary" disabled={busy} onClick={() => save({ contactPage: { ...c, faq: c.faq.filter((f) => f.q.trim() && f.a.trim()) } })}>{busy ? 'Saving…' : 'Save Contact page'}</button></div>
    </>
  );
}
