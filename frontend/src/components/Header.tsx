import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import RollText from './RollText';
import { useViewTransitionClick } from '../hooks/useViewTransition';
import { useCart } from '../context/CartContext';
import { useUi } from '../context/UiContext';

export const navLinks = [{ to: '/', label: 'Home' }, { to: '/collections', label: 'Collections' }, { to: '/about', label: 'About' }];

export default function Header() {
  const { count, setOpen } = useCart();
  const { setAccountOpen } = useUi();
  const isHome = useLocation().pathname === '/';
  const go = useViewTransitionClick();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [menu]);
  const close = () => setMenu(false);
  return (
    <>
      <header className={`header${isHome ? '' : ' solid'}${scrolled && isHome ? ' scrolled' : ''}`}>
        <Link to="/" className="logo" onClick={(e) => go(e, '/')} aria-label="ARTISRA home">Artisra</Link>
        <nav className="nav label" aria-label="Main">
          {navLinks.map((l) => <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={(e) => go(e, l.to)}><RollText text={l.label.toUpperCase()} /></NavLink>)}
        </nav>
        <div className="hdr-right label">
          <button className="plain" onClick={() => setAccountOpen(true)}><RollText text="ACCOUNT" /></button>
          <button onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>Cart {count}</button>
          <Link to="/contact" className="pill-dark"><span className="dot" /><RollText text="CONTACT ME" /></Link>
          <button className="burger" onClick={() => setMenu(true)} aria-expanded={menu} aria-controls="menu">Menu</button>
        </div>
      </header>
      <div id="menu" className={`menu${menu ? ' open' : ''}`} aria-hidden={!menu}>
        <button className="menu-close label" onClick={close}>Close</button>
        <nav aria-label="Mobile">
          {[...navLinks, { to: '/contact', label: 'Contact' }].map((l, i) => (
            <Link key={l.to} to={l.to} onClick={close} style={{ ['--i' as string]: i }} tabIndex={menu ? 0 : -1}>{l.label}</Link>
          ))}
        </nav>
        <div className="menu-foot label">
          <button onClick={() => { close(); setAccountOpen(true); }} tabIndex={menu ? 0 : -1}>Account</button>
          <button onClick={() => { close(); setOpen(true); }} tabIndex={menu ? 0 : -1}>Cart {count}</button>
        </div>
      </div>
    </>
  );
}
