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
  src: string;
  year?: string;
};

const officers: Officer[] = [
  {
    name: 'Ram Katram',
    role: 'President',
    year: '2028',
    src: 'officer-ram-katram.png'
  },
  {
    name: 'Arnav Choudhary',
    role: 'Vice President',
    year: '2028',
    src: 'officer-arnav-choudhary.png'
  },
  {
    name: 'Belgutei Naran-Erdene',
    role: 'Secretary',
    src: 'officer-belgutei-naran-erdene.png'
  },
  {
    name: 'Leo Su',
    role: 'Webmaster',
    src: 'officer-leo-su.png'
  },
  {
    name: 'Arnav Arun Kumar',
    role: 'Activities Coordinator',
    src: 'officer-arnav-arun-kumar.png'
  }
];

export default function About() {
  return (
    <div className="relative overflow-hidden">
      <Layout title="About Us">
        <div>
          {/* Intro: group photo + who we are */}
          <section className="grid gap-8 py-12 md:gap-12 lg:grid-cols-5 lg:gap-16">
            <AnimatedSection
              animation="fade-right"
              className="lg:sticky lg:top-32 lg:col-span-2 lg:self-start"
            >
              <Image
                src={assetPath('/images/about-group.png')}
                alt="TJ Consulting Club officers"
                width={795}
                height={586}
                className="w-full rounded-3xl"
              />
            </AnimatedSection>

            <div className="space-y-6 lg:col-span-3">
              <AnimatedSection animation="fade-up">
                <p className="text-xl font-medium leading-relaxed text-foreground/90 sm:text-2xl">
                  TJ Consulting Club explores the overlap between the
                  professional fields of business and science, and exposes
                  students to real consulting techniques.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fade-up" delay={0.1}>
                <p className="leading-relaxed text-foreground/70">
                  We are a student-run consulting source at Thomas Jefferson High
                  School for Science and Technology. Interested in joining? We
                  meet{' '}
                  <span className="font-semibold text-foreground">
                    8B on Fridays in Room 39
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
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {officers.map((officer, index) => (
                <AnimatedSection
                  key={index}
                  animation="fade-up"
                  delay={index * 0.1}
                >
                  <div className="flex h-full flex-col">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-foreground/10">
                      <Image
                        src={assetPath(`/images/${officer.src}`)}
                        alt={officer.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground">
                      {officer.name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {officer.role}
                      {officer.year && <> &middot; Class of {officer.year}</>}
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
