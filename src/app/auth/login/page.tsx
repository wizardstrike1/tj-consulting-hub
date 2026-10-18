'use client';

import { useEffect } from 'react';

// Preserve old bookmarks without displaying an intermediate login page.
export default function LoginPage() {
  useEffect(() => { window.location.replace('/'); }, []);
  return null;
}
