import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import type { Settings } from '../lib/api';

export default function Footer() {
  const s = useFetch<Settings>('/settings').data;
  return (
    <footer className="footer">
      <p>{s?.announcement.active && <><span className="dot" />{s.announcement.text}</>}</p>
      <nav className="label" aria-label="Footer">
        <Link to="/collections">Collections</Link>
        <Link to="/contact">Contact</Link>
        {s?.socials.map((x) => <a key={x.href} href={x.href} target="_blank" rel="noreferrer">{x.label}</a>)}
      </nav>
    </footer>
  );
}
