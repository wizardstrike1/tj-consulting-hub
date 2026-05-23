import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import RoundedButton from '@/components/animations/roundedButton';
import Link from 'next/link';

type Props = {
  slider1: number[];
  slider2: number[];
};

export default function SlidingImages({ slider1, slider2 }: Props) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  });
  const x1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div
      ref={container}
      className="relative z-10 mt-[200px] flex flex-col gap-[3vw] bg-background"
    >
      <motion.div
        style={{ x: x1 }}
        className="relative left-[-10vw] flex w-[300vw] gap-4 sm:w-[120vw] sm:gap-12"
      >
        {slider1.map((_, index) => (
          <div
            key={index}
            className="flex h-60 w-1/2 items-center justify-center bg-foreground/10 text-lg font-medium uppercase tracking-widest text-foreground/40 shadow-lg sm:h-80 sm:w-1/4"
          >
            placeholder
          </div>
        ))}
      </motion.div>
      <motion.div
        style={{ x: x2 }}
        className="relative left-[-10vw] flex  w-[300vw] gap-6 sm:w-[120vw] sm:gap-12"
      >
        {slider2.map((_, index) => (
          <div
            key={index}
            className="flex h-60 w-3/4 items-center justify-center bg-foreground/10 text-lg font-medium uppercase tracking-widest text-foreground/40 shadow-lg sm:h-80 sm:w-1/4"
          >
            placeholder
          </div>
        ))}
      </motion.div>
      <div className="flex w-full justify-center">
        <Link href={'/projects'}>
          <RoundedButton>View Projects</RoundedButton>
        </Link>
      </div>
    </div>
  );
}
