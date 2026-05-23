'use client';

import React from 'react';
import Layout from '@/components/layout';
import AnimatedSection from '@/components/about/AnimatedSection';
import ContrastCursor from '@/components/animations/cursor/contrastCursor';

const officers = [
  { name: 'Officer Name', role: 'Position' },
  { name: 'Officer Name', role: 'Position' },
  { name: 'Officer Name', role: 'Position' },
  { name: 'Officer Name', role: 'Position' },
  { name: 'Officer Name', role: 'Position' }
];

export default function About() {
  return (
    <div className="relative overflow-hidden">
      <Layout title="About Us">
        <div>
          <section className="grid gap-8 py-12 md:gap-12 lg:grid-cols-5 lg:gap-16">
            <AnimatedSection
              animation="fade-right"
              className="lg:sticky lg:top-32 lg:col-span-2 lg:self-start"
            >
              <div className="flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-3xl bg-foreground/10 text-lg font-medium uppercase tracking-widest text-foreground/40">
                placeholder group image
              </div>
            </AnimatedSection>

            <div className="lg:col-span-3">
              <AnimatedSection animation="fade-up">
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-foreground/10 bg-foreground/5 p-8 text-center text-xl font-medium leading-relaxed text-foreground/70 sm:text-2xl">
                  TJ CONSULTING CLUB DESCRIPTION... BLAH BLAH BLAH BLAH BLAH......
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-16">
            <AnimatedSection animation="fade-up">
              <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                Club Officers
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {officers.map((officer, index) => (
                <AnimatedSection
                  key={index}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-foreground/10 text-sm font-medium uppercase tracking-widest text-foreground/40">
                      placeholder
                    </div>
                    <p className="mt-3 text-center text-base font-semibold text-foreground">
                      {officer.name}
                    </p>
                    <p className="text-center text-sm text-foreground/60">
                      {officer.role}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </div>
      </Layout>

      <ContrastCursor isActive={false} text="" />
    </div>
  );
}
