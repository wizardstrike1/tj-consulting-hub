'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

const linkStyle = 'inline-flex h-8 items-center whitespace-nowrap leading-6 underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function LoginButton() {
  const { identity, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const signOutButton = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => { setOpen(false); }, [identity?.id]);

  useEffect(() => {
    if (!open) return;
    function outside(event: Event) {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      } else if (event.key === 'Tab') {
        setOpen(false);
        trigger.current?.focus();
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        signOutButton.current?.focus();
      }
    }
    signOutButton.current?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', keyboard);
    };
  }, [open]);

  async function logOut() {
    setBusy(true);
    try { await logout(); }
    finally { setBusy(false); setOpen(false); }
  }

  if (!identity) return <a href="/api/auth/login/" className={`${linkStyle} underline`}>Log in</a>;

  return (
    <div className="relative flex h-8 items-center">
      <button
        ref={trigger}
        type="button"
        title={identity.name}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`${linkStyle} max-w-[min(32vw,18rem)] ${open ? 'no-underline' : 'underline'}`}
      >
        <span className="truncate">{identity.name}</span>
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full whitespace-nowrap"
        >
          <button
            ref={signOutButton}
            type="button"
            role="menuitem"
            onClick={logOut}
            disabled={busy}
            className={`${linkStyle} underline disabled:opacity-50`}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
