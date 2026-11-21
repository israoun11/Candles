import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Lenis from 'lenis';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import AccountModal from './AccountModal';
import CustomCursor from './CustomCursor';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  useEffect(() => { document.documentElement.classList.toggle('home-lock', isHome); return () => document.documentElement.classList.remove('home-lock'); }, [isHome]);
  useEffect(() => {
    if (prefersReducedMotion() || isHome) return;
    const lenis = new Lenis({ lerp: 0.1 });
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, [isHome]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <Header />
      <main key={pathname} className={isHome ? undefined : 'page'}><Outlet /></main>
      {!isHome && <Footer />}
      <CartDrawer />
      <AccountModal />
      <CustomCursor />
    </>
  );
}
