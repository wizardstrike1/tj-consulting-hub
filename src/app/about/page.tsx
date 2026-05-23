'use client';

import React from 'react';
import Layout from '@/components/layout';
import AnimatedSection from '@/components/about/AnimatedSection';
import ContrastCursor from '@/components/animations/cursor/contrastCursor';

const steps = [
  { title: 'Intake', detail: 'We meet to understand your needs.' },
  { title: 'Strategy', detail: 'We design the goals and a structure.' },
  { title: 'Execution', detail: 'We build — branding, websites, and more.' },
  { title: 'Review', detail: 'We gather feedback and refine.' },
  { title: 'Launch', detail: 'We hand off the finished project.' }
];

const skills = [
  'Business skills',
  'Technical skills',
  'Teamwork',
  'Competition',
  'Management'
];

const officers = [
  { name: 'Aayush Katoch', role: 'President', year: '2026' },
  { name: 'Ram Katram', role: 'Vice President', year: '2028' },
  { name: 'Sanjeev Subramanian', role: 'Secretary', year: '2026' },
  { name: 'Pratham Singh', role: 'Activities Coordinator', year: '2026' },
  { name: 'Nikhil Krishna', role: 'Webmaster', year: '2026' }
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
              <div className="flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-3xl bg-foreground/10 text-lg font-medium uppercase tracking-widest text-foreground/40">
                placeholder group image
              </div>
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
                  We are a student-run consulting source: TJ students who advise
                  real clients and build real solutions — from strategy to
                  branding to finished websites.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fade-up" delay={0.2}>
                <p className="leading-relaxed text-foreground/70">
                  We meet <span className="font-semibold text-foreground">8B
                  on Fridays in Room 39</span> for mini-lessons, activities, and
                  work sessions on our current project. And yes — you can get
                  cookies.
                </p>
              </AnimatedSection>
            </div>
          </section>

          {/* How We Work */}
          <section className="py-12">
            <AnimatedSection animation="fade-up">
              <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                How We Work
              </h2>
            </AnimatedSection>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, index) => (
                <AnimatedSection
                  key={step.title}
                  animation="fade-up"
                  delay={index * 0.08}
                >
                  <div className="h-full rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
                    <span className="text-sm font-semibold text-primary">
                      Step {index + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                      {step.detail}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* Skills You'll Gain */}
          <section className="py-12">
            <AnimatedSection animation="fade-up">
              <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                Skills You&apos;ll Gain
              </h2>
            </AnimatedSection>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <AnimatedSection
                  key={skill}
                  animation="fade-up"
                  delay={index * 0.06}
                >
                  <span className="inline-block rounded-full border border-foreground/10 bg-foreground/5 px-5 py-2 text-base font-medium text-foreground">
                    {skill}
                  </span>
                </AnimatedSection>
              ))}
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
                    <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-foreground/10 text-xs font-medium uppercase tracking-widest text-foreground/40">
                      placeholder
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground">
                      {officer.name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {officer.role} &middot; Class of {officer.year}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground/70">
                      <li>&bull; Favorite tool: placeholder</li>
                      <li>&bull; Specialty: placeholder</li>
                    </ul>
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
