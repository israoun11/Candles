import { Card, fromImgs, ImageListEditor, toImgs } from './ui';
import { useSettingsDoc } from './useSettings';

export default function AboutAdmin() {
  const { s, update, save, err, ok, busy } = useSettingsDoc();
  if (!s) return <>{err ? <p role="alert" className="a-err">{err}</p> : <p className="a-muted">Loading…</p>}</>;
  const a = s.about, set = (p: Partial<typeof a>) => update({ about: { ...a, ...p } });
  const setChap = (i: number, p: Partial<(typeof a.chapters)[number]>) => set({ chapters: a.chapters.map((x, k) => (k === i ? { ...x, ...p } : x)) });
  const submit = () => save({ about: { ...a, intro: a.intro.map((t) => t.trim()).filter(Boolean), chapters: a.chapters.map((c) => ({ ...c, lines: c.lines.map((l) => l.trim()).filter(Boolean) })) } });
  return (
    <>
      <Card title="Brand line" desc="The quote shown on the small candle-label card.">
        <label className="a-fld"><span>Quote</span><input value={a.headline} onChange={(e) => set({ headline: e.target.value })} /></label>
      </Card>
      <Card title="Introduction" actions={<button className="a-btn" onClick={() => set({ intro: [...a.intro, ''] })}>Add paragraph</button>}>
        {a.intro.map((t, i) => (
          <div key={i} className="a-drow one"><textarea rows={2} aria-label={`Paragraph ${i + 1}`} value={t} onChange={(e) => set({ intro: a.intro.map((x, k) => (k === i ? e.target.value : x)) })} /><button className="a-btn" onClick={() => set({ intro: a.intro.filter((_, k) => k !== i) })}>Remove</button></div>
        ))}
        <div className="a-fld"><span>Photo next to the introduction</span><ImageListEditor max={1} items={toImgs(a.portrait ? [a.portrait] : [])} onChange={(i) => set({ portrait: i[0]?.url ?? '' })} /></div>
      </Card>
      <Card title="Story chapters" desc="They appear one after another as visitors scroll."
        actions={a.chapters.length < 6 ? <button className="a-btn" onClick={() => set({ chapters: [...a.chapters, { tag: '', title: '', lines: [''] }] })}>Add chapter</button> : undefined}>
        {a.chapters.map((c, i) => (
          <div key={i} className="a-chap">
            <div className="a-grid2"><label className="a-fld"><span>Tag</span><input value={c.tag} onChange={(e) => setChap(i, { tag: e.target.value })} /></label><label className="a-fld"><span>Title</span><input value={c.title} onChange={(e) => setChap(i, { title: e.target.value })} /></label></div>
            <label className="a-fld"><span>Text (one line per row)</span><textarea rows={3} value={c.lines.join('\n')} onChange={(e) => setChap(i, { lines: e.target.value.split('\n') })} /></label>
            <button className="a-btn danger" disabled={a.chapters.length === 1} onClick={() => set({ chapters: a.chapters.filter((_, k) => k !== i) })}>Remove chapter</button>
          </div>
        ))}
      </Card>
      <Card title="Closing quote"><label className="a-fld"><span>Quote</span><input value={a.closing} onChange={(e) => set({ closing: e.target.value })} /></label></Card>
      <Card title="3D spiral images" desc="The spiral has 48 cards. Your images repeat to fill them; with none, placeholders are shown.">
        <ImageListEditor max={48} items={toImgs(a.spiral)} onChange={(i) => set({ spiral: fromImgs(i) })} />
      </Card>
      <div className="a-savebar">{err && <span role="alert" className="a-err">{err}</span>}{ok && <span role="status" className="a-ok">Saved — About page updated.</span>}<button className="a-btn primary" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save About page'}</button></div>
    </>
  );
}
