'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { completeIonLogin, IonIdentity } from '@/lib/ion-auth';

export default function CallbackPage() {
  const [identity, setIdentity] = useState<IonIdentity | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    completeIonLogin().then(
      (user) => { if (active) setIdentity(user); },
      (cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Sign-in could not be completed. Please try again.'); }
    );
    return () => { active = false; };
  }, []);

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-xl flex-col justify-center gap-6 px-6 pb-24 pt-40">
      <h1 className="text-4xl font-semibold sm:text-5xl">
        {error ? 'We couldn’t sign you in.' : identity ? `Welcome, ${identity.name}.` : 'Signing you in…'}
      </h1>
      <p role={error ? 'alert' : 'status'} className="text-lg leading-relaxed text-foreground/70">
        {error || (identity ? `You’re signed in as ${identity.username}.` : 'Confirming your identity with Ion.')}
      </p>
      {(error || identity) && (
        <Link href={error ? '/auth/login/' : '/'} className="self-start rounded-full bg-foreground px-6 py-3 font-semibold text-background">
          {error ? 'Try again' : 'Continue to home'}
        </Link>
      )}
    </section>
  );
}
