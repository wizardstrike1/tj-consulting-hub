'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { clearLegacyIdentity, endAuthSession, getAuthSession, type IonIdentity } from '@/lib/auth-client';

type AuthContextValue = {
  identity: IonIdentity | null;
  notice: string | null;
  dismissNotice: () => void;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<IonIdentity | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    clearLegacyIdentity();
    async function refresh() {
      const version = generation.current;
      try {
        const data = await getAuthSession();
        if (!active || version !== generation.current) return;
        setIdentity(data.identity);
        if (data.notice) setNotice(data.notice);
        clearTimeout(timeout);
        if (data.identity) timeout = setTimeout(refresh, Math.max(0, data.identity.expiresAt - Date.now()));
      } catch {
        if (active && version === generation.current) setIdentity(null);
      }
    }
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; clearTimeout(timeout); window.removeEventListener('focus', refresh); };
  }, []);

  async function logout() {
    generation.current++;
    try {
      await endAuthSession();
      setIdentity(null);
      setNotice(null);
    } catch { setNotice('Could not log out. Please try again.'); }
  }

  return (
    <AuthContext.Provider value={{ identity, notice, dismissNotice: () => setNotice(null), logout }}>
      {children}
    </AuthContext.Provider>
  );
}
