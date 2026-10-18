'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import Magnetic from '@/components/animations/magnetic';
import Image from 'next/image';
import { assetPath } from '@/lib/utils';
import LoginButton from '@/components/auth/LoginButton';

export default function Header() {
  const header = useRef(null);

  return (
    <div
      ref={header}
      className="absolute top-0 z-20 box-border flex w-full items-center justify-between gap-4 p-4 font-light text-white mix-blend-difference lg:p-8"
    >
      <Link href={'/'} className="group z-10 flex min-w-0 flex-1 items-center space-x-2">
        <Magnetic>
          <Image
            height={32}
            width={32}
            src={assetPath('/images/TJHSST.png')}
            alt="TJ Consulting Club logo"
            priority
          />
        </Magnetic>
        <div className="hidden h-6 min-w-0 overflow-hidden leading-6 sm:block">
          <div className="ease-custom-cubic transition-transform duration-500 group-hover:-translate-y-6">
            <div className="whitespace-nowrap">TJ Consulting Club</div>
            <div className="whitespace-nowrap">Thomas Jefferson High School for Science and Technology</div>
          </div>
        </div>
      </Link>
      <div className="z-10 flex shrink-0 items-center gap-3 text-sm font-semibold sm:gap-8 sm:text-base">
        <Magnetic>
          <Link href={'/about'}>About</Link>
        </Magnetic>
        <Magnetic>
          <Link href={'/projects'}>Projects</Link>
        </Magnetic>
        <LoginButton />
      </div>
    </div>
  );
}
