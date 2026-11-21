import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { site } from '../config/site';

export default function CartDrawer() {
  const { open, setOpen, items, subtotal, count, setQty, remove } = useCart();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [setOpen]);
  return (
    <>
      <div className={`drawer-bg${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Cart" aria-hidden={!open}>
        <h2>Cart {count}<button className="label" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>Close</button></h2>
        {items.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <Link className="btn" to="/collections" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>See the collections</Link>
          </div>
        ) : (
          <>
            <ul>
              {items.map((i) => (
                <li key={`${i.id}|${i.variant ?? ''}`}>
                  <div>
                    <strong>{i.name}</strong>{i.variant && <div className="label">{i.variant}</div>}
                    <div className="qty">
                      <button aria-label="Decrease quantity" onClick={() => setQty(i.id, i.variant, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button aria-label="Increase quantity" onClick={() => setQty(i.id, i.variant, i.qty + 1)}>+</button>
                      <button className="label" onClick={() => remove(i.id, i.variant)}>Remove</button>
                    </div>
                  </div>
                  <span>{i.price * i.qty} {site.currency}</span>
                </li>
              ))}
            </ul>
            <div className="sub"><span>Subtotal</span><strong>{subtotal} {site.currency}</strong></div>
            <Link className="btn" to="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
          </>
        )}
      </aside>
    </>
  );
}
