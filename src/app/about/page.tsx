'use client';

import React from 'react';
import Image from 'next/image';
import Layout from '@/components/layout';
import AnimatedSection from '@/components/about/AnimatedSection';
import ContrastCursor from '@/components/animations/cursor/contrastCursor';
import { assetPath } from '@/lib/utils';

type Officer = {
  name: string;
  role: string;
};

const officers: Officer[] = [
  {
    name: 'Ram Katram',
    role: 'President'
  },
  {
    name: 'Arnav Choudhary',
    role: 'Vice President'
  },
  {
    name: 'Belgutei Naran-Erdene',
    role: 'Secretary'
  },
  {
    name: 'Leo Su',
    role: 'Webmaster'
  },
  {
    name: 'Arnav Arun Kumar',
    role: 'Activities Coordinator'
  }
];

export default function About() {
  return (
    <div className="relative overflow-hidden">
      <Layout title="About Us">
        <div>
          {/* Intro: group photo + who we are */}
          <section className="grid gap-8 py-12 md:gap-12 lg:grid-cols-2 lg:gap-16">
            <AnimatedSection
              animation="fade-right"
              className="lg:order-2 lg:self-start"
            >
              <Image
                src={assetPath('/images/about-group.jpeg')}
                alt="TJ Consulting Club officers"
                width={4032}
                height={3024}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full rounded-3xl shadow-lg shadow-foreground/5"
              />
            </AnimatedSection>

            <div className="flex flex-col gap-[clamp(1.5rem,3vw,4rem)] lg:order-1">
              <AnimatedSection animation="fade-up">
                <p className="text-xl font-medium leading-relaxed text-foreground/90 sm:text-2xl lg:text-[clamp(1.5rem,2.2vw,2.75rem)] lg:leading-snug">
                  TJ Consulting Club explores the overlap between the
                  professional fields of business and science, and exposes
                  students to real consulting techniques.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fade-up" delay={0.1}>
                <p className="text-lg leading-relaxed text-foreground/70 lg:text-[clamp(1.125rem,1.35vw,1.75rem)]">
                  We are a student-run consulting source at Thomas Jefferson High
                  School for Science and Technology. Interested in joining? We
                  meet{' '}
                  <span className="font-semibold text-foreground">
                    8A on Wednesdays in Room 214
                  </span>{' '}
                  for lessons, activities, and work sessions on our current
                  projects. (And you can get cookies!). You&apos;ll gain valuable
                  business, technical, and management skills while working in a
                  collaborative setting.
                </p>
              </AnimatedSection>
            </div>
          </section>

          {/* Club Officers */}
          <section className="py-12">
            <AnimatedSection animation="fade-up">
              <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                Club Officers
              </h2>
            </AnimatedSection>
            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
              <AnimatedSection animation="fade-right" className="lg:self-start">
                <Image
                  src={assetPath('/images/officers-all.jpeg')}
                  alt="TJ Consulting Club officer team"
                  width={2856}
                  height={2142}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-auto w-full rounded-3xl"
                />
              </AnimatedSection>
              <AnimatedSection animation="fade-up" className="flex flex-col">
                <ul className="flex flex-1 list-none flex-col justify-between gap-5 lg:gap-3">
                  {officers.map((officer) => (
                    <li key={officer.name}>
                      <p className="text-xl font-semibold leading-tight text-foreground lg:text-[clamp(1.25rem,2vw,2.5rem)]">
                        {officer.name}
                      </p>
                      <p className="mt-1 text-base text-foreground/60 lg:text-[clamp(1rem,1.2vw,1.5rem)]">
                        {officer.role}
                      </p>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            </div>
          </section>
        </div>
      </Layout>

      <ContrastCursor isActive={false} text="" />
    </div>
  );
}
