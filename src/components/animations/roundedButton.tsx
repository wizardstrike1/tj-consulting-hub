import React, { PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Magnetic from '@/components/animations/magnetic';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

interface Props {
  backgroundColor?: string;
  className?: string;
}

// While the page is scrolling, buttons slide under a (possibly stationary)
// cursor and fire spurious mouseenter events, which flashed the fill like a
// pink blob. Track scrolling globally and ignore hover fills during it.
// We listen to wheel/touchmove (the raw inputs) because the site uses smooth
// scrolling (locomotive-scroll), so the native `scroll` event may not fire.
let isScrolling = false;
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
    // Ignore hovers that happen while the page is scrolling.
    if (isScrolling) return;
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
