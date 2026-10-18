'use client';

import { useEffect, useRef } from 'react';
import { returnHomeAfterIonLogin } from '@/lib/ion-auth';

export default function CallbackPage() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void returnHomeAfterIonLogin();
  }, []);

  return null;
}
