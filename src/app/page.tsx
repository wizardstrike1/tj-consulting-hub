'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import SlidingImages from '@/components/home/SlidingImages';
import ContrastCursor from '@/components/animations/cursor/contrastCursor';
import { LetterCollision } from '@/components/animations/textAnimations/scrollText';
import Magnetic from '@/components/animations/magnetic';
import Image from 'next/image';
import { assetPath } from '@/lib/utils';

const slider1 = [
  { src: '/images/featured/student-profile.jpeg', alt: 'Student sitting indoors' },
  { src: '/images/featured/laptop.jpg', alt: 'Student working on a laptop' },
  { src: '/images/featured/driving-school.png', alt: 'SA Driving School website' },
  { src: '/images/featured/leaf-cat.png', alt: 'Cat wrapped in green leaves' }
];
const slider2 = [
  { src: '/images/featured/eagle.jpg', alt: 'Bald eagle with an American flag' },
  { src: '/images/featured/classroom.jpg', alt: 'Students in a classroom' },
  { src: '/images/featured/students-working.jpeg', alt: 'Two students working with a laptop and notebook' },
  { src: '/images/featured/mountain-plush.webp', alt: 'Green plush toy on a mountain' }
];

export default function Home() {
  const [showScrollButton, setShowScrollButton] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window?.scrollY > 0) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    window?.addEventListener('scroll', handleScroll);

    return () => {
      window?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToHero = () => {
    window?.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div ref={scrollContainerRef} className="relative isolate overflow-x-clip">
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[calc(100%+20vh)]">
          <Image
            src={assetPath('/images/home-campus.webp')}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/60" />
          <div className="absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-b from-transparent to-background" />
        </div>
        <LetterCollision />
      </div>
      {showScrollButton && (
        <Magnetic>
          <div
            className="fixed bottom-4 right-8 z-20 flex cursor-pointer items-center space-x-2 text-3xl font-semibold sm:bottom-8"
            onClick={scrollToHero}
          >
            <p>Scroll</p>

            <ArrowDownRight strokeWidth={3} className="size-6" />
          </div>
        </Magnetic>
      )}
      <SlidingImages slider1={slider1} slider2={slider2} />
      <ContrastCursor isActive={false} text={'Go to project'} />
    </div>
  );
}
