import { createContext, useContext, useState, type ReactNode } from 'react';
const Ctx = createContext<{ accountOpen: boolean; setAccountOpen: (o: boolean) => void } | null>(null);
export function UiProvider({ children }: { children: ReactNode }) {
  const [accountOpen, setAccountOpen] = useState(false);
  return <Ctx.Provider value={{ accountOpen, setAccountOpen }}>{children}</Ctx.Provider>;
}
export function useUi() { const c = useContext(Ctx); if (!c) throw new Error('useUi outside UiProvider'); return c; }
