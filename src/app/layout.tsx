import { Inter } from 'next/font/google';
import './globals.css';
import React, { ReactNode } from 'react';
import { Metadata } from 'next';
import Animations from './animations';
import Header from '@/components/layout/header';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tjconsulting.club';

const metaDescription =
  'TJ Consulting Club at Thomas Jefferson High School for Science and Technology — student consultants solving real-world problems.';

const ogImagePath = '/images/TJHSST.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TJ Consulting Club',
    template: '%s | TJ Consulting Club'
  },
  description: metaDescription,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TJ Consulting Club',
    title: 'TJ Consulting Club',
    description: metaDescription,
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: 'TJ Consulting Club — Thomas Jefferson High School for Science and Technology'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TJ Consulting Club',
    description: metaDescription,
    images: [ogImagePath]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <SpeedInsights />
      <body className="overflow-scroll overflow-x-hidden">
        <Animations>
          <main>
            <Header />
            <div className="flex flex-col bg-background text-foreground">
              <main className={`flex-grow ${inter.className}`}>{children}</main>
              <Analytics />
            </div>
          </main>
        </Animations>
      </body>
    </html>
  );
}
