'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import Magnetic from '@/components/animations/magnetic';
import Image from 'next/image';
import { assetPath } from '@/lib/utils';

export default function Header() {
  const header = useRef(null);

  return (
    <div
      ref={header}
      className="absolute top-0 z-20 box-border flex w-full items-center justify-between p-4 font-light text-white mix-blend-difference lg:p-8"
    >
      <Link href={'/'} className="group z-10 flex items-center space-x-2">
        <Magnetic>
          <Image
            height={32}
            width={32}
            src={assetPath('/images/TJHSST.png')}
            alt="TJ Consulting Club logo"
            priority
          />
        </Magnetic>
        <div className="hidden h-6 overflow-hidden leading-6 sm:block">
          <div className="ease-custom-cubic transition-transform duration-500 group-hover:-translate-y-6">
            <div className="whitespace-nowrap">TJ Consulting Club</div>
            <div className="whitespace-nowrap">@ TJHSST</div>
          </div>
        </div>
      </Link>
      <div className="z-10 flex items-center gap-5 font-semibold sm:gap-8">
        <Magnetic>
          <Link href={'/about'}>About</Link>
        </Magnetic>
        <Magnetic>
          <Link href={'/projects'}>Projects</Link>
        </Magnetic>
      </div>
    </div>
  );
}
