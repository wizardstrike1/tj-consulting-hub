'use client';

import { useAuth } from './AuthProvider';

export default function LoginNotice() {
  const { notice: message, dismissNotice } = useAuth();

  if (!message) return null;
  return (
    <div role="alert" className="fixed bottom-6 left-4 right-4 z-50 flex items-start gap-4 rounded-2xl border border-black/10 bg-white p-5 text-sm leading-relaxed text-black shadow-lg sm:left-auto sm:right-6 sm:max-w-sm">
      <p>{message}</p>
      <button type="button" onClick={dismissNotice} aria-label="Dismiss login notice" className="shrink-0 px-1 text-lg leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        ×
      </button>
    </div>
  );
}
