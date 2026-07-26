'use client';

// The full projects page is archived in ./_archive/fullProjectsPage.tsx while
// this route shows an under-construction notice.

import React from 'react';
import Layout from '@/components/layout';

export default function ProjectsHome() {
  return (
    <Layout title={'Our Projects'}>
      <div className="flex min-h-[30vh] flex-col justify-center gap-4 py-12">
        <p className="text-xl font-medium leading-relaxed text-foreground/90 sm:text-2xl">
          This page is under construction!
        </p>
        <p className="leading-relaxed text-foreground/70">
          We&apos;re putting together a showcase of our work. Check back later!
        </p>
      </div>
    </Layout>
  );
}
