import React, { PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Magnetic from '@/components/animations/magnetic';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

interface Props {
  backgroundColor?: string;
  className?: string;
}

// Buttons slide under a (possibly stationary) cursor while the page scrolls,
// firing spurious mouseenter events that flashed the fill like a pink blob.
// Two guards make the fill respond to *real* hovers only:
//  1. isScrolling — true during/just after scroll input (the site uses
//     locomotive smooth scrolling, so we watch wheel/touchmove, not `scroll`).
//  2. lastPointerMove — a real hover requires the cursor to actually move;
//     scroll inertia moves the page, not the mouse, so a stale value means the
//     "hover" came from the page gliding under the cursor.
let isScrolling = false;
let lastPointerMove = 0;
if (typeof window !== 'undefined') {
  let scrollTimer: ReturnType<typeof setTimeout>;
  const markScrolling = () => {
    isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 250);
  };
  ['wheel', 'touchmove', 'scroll'].forEach((ev) =>
    window.addEventListener(ev, markScrolling, { passive: true, capture: true })
  );
  window.addEventListener(
    'pointermove',
    () => {
      lastPointerMove = Date.now();
    },
    { passive: true }
  );
}

export default function RoundedButton({
  children,
  backgroundColor = 'secondary',
  ...attributes
}: PropsWithChildren<Props>) {
  const circle = useRef(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const isHovered = useRef(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeline.current = gsap.timeline({ paused: true });
    timeline.current
      .to(
        circle.current,
        { top: '-25%', width: '150%', duration: 0.4, ease: 'power3.in' },
        'enter'
      )
      .to(
        circle.current,
        { top: '-150%', width: '125%', duration: 0.25 },
        'exit'
      );
  }, []);

  const manageMouseEnter = () => {
    // Only fill on a real hover: not while scrolling, and only if the cursor
    // actually moved just now (not the page gliding under a still cursor).
    if (isScrolling) return;
    if (Date.now() - lastPointerMove > 100) return;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    isHovered.current = true;
    timeline.current!.tweenFromTo('enter', 'exit');
  };

  const manageMouseLeave = () => {
    // Only run the exit if we actually filled on a real hover.
    if (!isHovered.current) return;
    isHovered.current = false;
    timeoutId.current = setTimeout(() => {
      timeline.current!.play();
    }, 300);
  };

  return (
    <Magnetic>
      <Button
        variant="rounded"
        className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-secondary px-4 py-6"
        style={{ overflow: 'hidden' }}
        onMouseEnter={() => {
          manageMouseEnter();
        }}
        onMouseLeave={() => {
          manageMouseLeave();
        }}
        {...attributes}
      >
        <div className="relative z-10 transition-colors duration-300 ease-linear hover:text-white">
          {children}
        </div>
        <div
          ref={circle}
          className={clsx(
            'absolute top-[100%] h-[20%] w-full rounded-full sm:h-[150%]',
            `bg-${backgroundColor}`
          )}
        ></div>
      </Button>
    </Magnetic>
  );
}
