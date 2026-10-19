import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { MutableRefObject, useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const line1 = 'Consulting Club';
const line2 = 'Thomas Jefferson High School for Science and Technology';

function getRandomSpeed() {
  const randomDecimal = Math.random();
  return 0.8 + randomDecimal * (1.5 - 0.8); // Increased speed range
}
function getRandomRotation() {
  return Math.random() * 60 - 30; // Random rotation between -30 and 30 degrees
}

const animateLettersOnScroll = (containerRef: MutableRefObject<any>) => {
  const lettersContainer = containerRef.current;
  const letterElements = lettersContainer?.querySelectorAll('.letter');

  letterElements.forEach((letter: Element) => {
    // Assign the random parallax speed on the client only, after hydration,
    // so it never appears in the server-rendered HTML (avoids a mismatch).
    letter.setAttribute('data-speed', String(getRandomSpeed()));
    gsap.to(letter, {
      y: (i, el) =>
        (1 - parseFloat(el.getAttribute('data-speed'))) *
        ScrollTrigger.maxScroll(window),
      ease: 'power2.out',
      duration: 0.8,
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: window.innerHeight,
        invalidateOnRefresh: true,
        scrub: 0.5
      },
      rotation: getRandomRotation()
    });
  });
};

// A single word: its letters stay together (own flex row) so a word never
// breaks across lines — only whole words wrap on small screens.
function Word({ word, className }: { word: string; className: string }) {
  return (
    <div className="flex shrink-0">
      {word.split('').map((letter, index) => (
        <div key={index} className={`letter font-semibold ${className}`}>
          {letter}
        </div>
      ))}
    </div>
  );
}

function SentenceDisplay({
  text,
  className,
  gap
}: {
  text: string;
  className: string;
  gap: string;
}) {
  return text.split(' ').map((word, index) => (
    <React.Fragment key={index}>
      {index > 0 && <div aria-hidden="true" className={gap}></div>}
      <Word word={word} className={className} />
    </React.Fragment>
  ));
}

export function LetterCollision() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animateLettersOnScroll(containerRef);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none relative z-20 scroll-smooth px-4 [container-type:inline-size] sm:px-8"
    >
      <div className="flex min-h-screen flex-col justify-end pb-24 pt-28">
        <div aria-label={line1} role="heading" aria-level={1} className="flex flex-nowrap items-end whitespace-nowrap text-[clamp(2rem,12cqw,18rem)] leading-none">
          <SentenceDisplay
            text={line1}
            gap="w-[0.22em] shrink-0"
            className="leading-none"
          />
        </div>
        <div aria-label={line2} className="mt-3 flex flex-wrap items-end gap-y-[0.2em] text-[clamp(1rem,3.4cqw,5.1rem)] leading-none sm:mt-6">
          <SentenceDisplay
            text={line2}
            gap="w-[0.22em] shrink-0"
            className="leading-none"
          />
        </div>
      </div>
    </div>
  );
}
