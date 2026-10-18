'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function SiteAnalytics() {
  const pathname = usePathname();
  // OAuth callback query strings must never be sent to analytics providers.
  if (pathname.startsWith('/auth/')) return null;
  return <><Analytics /><SpeedInsights /></>;
}
