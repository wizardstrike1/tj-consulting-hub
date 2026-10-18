'use client';

import { useEffect, useState } from 'react';
import { beginIonLogin, IDENTITY_EVENT, IonIdentity, LOGIN_NOTICE_EVENT, readIdentity, saveLoginNotice, signOut } from '@/lib/ion-auth';

export default function LoginButton() {
  const [identity, setIdentity] = useState<IonIdentity | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    if (busy) return;
    setBusy(true);
    try { await beginIonLogin(); }
    catch (cause) {
      saveLoginNotice(cause instanceof Error ? cause.message : 'Unable to open Ion. Please try again.');
      window.dispatchEvent(new Event(LOGIN_NOTICE_EVENT));
      setBusy(false);
    }
  }

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timeout);
      const current = readIdentity();
      setIdentity(current);
      if (current) timeout = setTimeout(update, Math.max(0, current.expiresAt - Date.now()));
    };
    update();
    window.addEventListener(IDENTITY_EVENT, update);
    window.addEventListener('focus', update);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener(IDENTITY_EVENT, update);
      window.removeEventListener('focus', update);
    };
  }, []);

  return identity ? (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-40 truncate text-sm lg:block" title={identity.name}>
        {identity.name}
      </span>
      <button type="button" onClick={signOut} className="whitespace-nowrap underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        Log out
      </button>
    </div>
  ) : (
    <button type="button" onClick={login} disabled={busy} aria-busy={busy} className="whitespace-nowrap underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50">
      Log in
    </button>
  );
}
