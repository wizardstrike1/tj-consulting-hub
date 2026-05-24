import React, { PropsWithChildren, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Magnetic from '@/components/animations/magnetic';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

interface Props {
  backgroundColor?: string;
  className?: string;
}

// Track genuine pointer movement. A mouseenter can also fire when an element
// scrolls under a stationary cursor — those should NOT trigger the fill (that
// caused the fill to flash like a blob while scrolling).
let lastPointerMove = 0;
if (typeof window !== 'undefined') {
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
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

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
    // Ignore "hovers" caused by scrolling (no recent pointer movement).
    if (Date.now() - lastPointerMove > 120) return;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    isHovered.current = true;
    timeline.current!.tweenFromTo('enter', 'exit');
  };

  const manageMouseLeave = () => {
    // Only play the exit if we actually entered, so a scroll-induced leave
    // can't kick off the animation on its own.
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
