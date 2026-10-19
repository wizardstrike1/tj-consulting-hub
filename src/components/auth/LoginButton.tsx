'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

const linkStyle = 'whitespace-nowrap underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function LoginButton() {
  const { identity, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function logOut() {
    setBusy(true);
    try { await logout(); }
    finally { setBusy(false); }
  }

  return identity ? (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-40 truncate text-sm lg:block" title={identity.name}>
        {identity.name}
      </span>
      <button type="button" onClick={logOut} disabled={busy} className={linkStyle}>
        Log out
      </button>
    </div>
  ) : (
    <a href="/api/auth/login/" className={linkStyle}>Log in</a>
  );
}
