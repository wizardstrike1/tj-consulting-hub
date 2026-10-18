'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IDENTITY_EVENT, IonIdentity, readIdentity, signOut } from '@/lib/ion-auth';

export default function LoginButton() {
  const [identity, setIdentity] = useState<IonIdentity | null>(null);

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
      <button type="button" onClick={signOut} className="rounded-full border border-current px-4 py-2 text-sm transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        Log out
      </button>
    </div>
  ) : (
    <Link href="/auth/login/" className="whitespace-nowrap rounded-full border border-current px-3 py-2 text-sm transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:px-4">
      Log in with Ion
    </Link>
  );
}
