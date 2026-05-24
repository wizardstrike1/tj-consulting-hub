import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { MutableRefObject, useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const line1 = 'Consulting Club';
const line2 = 'Thomas Jefferson High School for Science And Technology';

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
    <div className="flex">
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
      <Word word={word} className={className} />
      <div className={gap}></div>
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
      className="pointer-events-none relative z-20 scroll-smooth px-4 sm:px-8"
    >
      <div className="flex min-h-screen flex-col justify-end pb-24 pt-28">
        <div className="flex flex-wrap items-end">
          <SentenceDisplay
            text={line1}
            gap="w-2 xs:w-4 sm:w-10"
            className="text-5xl leading-none xs:text-7xl sm:text-8xl md:text-[120px] lg:text-[150px] xl:text-[210px]"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-end sm:mt-6">
          <SentenceDisplay
            text={line2}
            gap="w-1.5 xs:w-2 sm:w-4"
            className="text-xl leading-none xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
          />
        </div>
      </div>
    </div>
  );
}
