'use client';

import { useState } from 'react';
import Link from 'next/link';
import { beginIonLogin } from '@/lib/ion-auth';

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    setBusy(true);
    setError('');
    try { await beginIonLogin(); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start login. Please try again.');
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-xl flex-col justify-center gap-6 px-6 pb-24 pt-40">
      <p className="text-sm uppercase tracking-widest text-foreground/60">TJ Consulting Club</p>
      <h1 className="text-4xl font-semibold sm:text-5xl">Welcome back.</h1>
      <p className="text-lg leading-relaxed text-foreground/70">
        Sign in with your TJ account. Ion will ask you to approve access so we can identify you.
      </p>
      {error && <p role="alert" className="rounded-2xl bg-foreground/5 p-4 leading-relaxed">{error}</p>}
      <button type="button" onClick={login} disabled={busy} className="self-start rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50">
        {busy ? 'Opening Ion…' : 'Continue with Ion'}
      </button>
      <Link href="/" className="self-start text-sm underline underline-offset-4">Back to home</Link>
    </section>
  );
}
