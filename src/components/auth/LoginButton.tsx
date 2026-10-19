'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './AuthProvider';

const linkStyle = 'inline-flex h-8 items-center whitespace-nowrap leading-6 underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function LoginButton() {
  const { identity, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const signOutButton = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => { setOpen(false); }, [identity?.id]);

  useEffect(() => {
    if (!open) return;
    function positionMenu() {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        setOpen(false);
      } else {
        setPosition({ top: bounds.bottom + 8, right: Math.max(16, window.innerWidth - bounds.right) });
      }
    }
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
    positionMenu();
    signOutButton.current?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', keyboard);
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open]);

  async function logOut() {
    setBusy(true);
    try { await logout(); }
    finally { setBusy(false); setOpen(false); }
  }

  if (!identity) return <a href="/api/auth/login/" className={`${linkStyle} underline`}>Log in</a>;

  return (
    <div className="flex h-8 items-center">
      <button
        ref={trigger}
        type="button"
        title={identity.name}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          const bounds = trigger.current?.getBoundingClientRect();
          if (bounds) setPosition({ top: bounds.bottom + 8, right: Math.max(16, window.innerWidth - bounds.right) });
          setOpen((value) => !value);
        }}
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
      {open && createPortal(
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label="Account"
          style={position}
          className="fixed z-[100] min-w-36 rounded-xl border border-foreground/10 bg-background p-2 text-base font-semibold leading-6 text-foreground shadow-lg"
        >
          <button
            ref={signOutButton}
            type="button"
            role="menuitem"
            onClick={logOut}
            disabled={busy}
            className="block w-full rounded-lg px-3 py-2 text-left underline underline-offset-4 hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            Sign out
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
