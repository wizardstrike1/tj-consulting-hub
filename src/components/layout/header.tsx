'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Menu from '../nav';
import Link from 'next/link';
import { isMobile } from '@/components/util';
import Magnetic from '@/components/animations/magnetic';
import Image from 'next/image';

export default function Header() {
  const header = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isActive) setIsActive(false);
  }, [pathname]);

  return (
    <>
      <div
        ref={header}
        className="absolute top-0 z-20 box-border flex w-full items-center p-4 font-light text-white mix-blend-difference lg:p-8"
      >
        <div className="flex lg:pr-56">
          <Link href={'/'} className="group z-10 flex items-center space-x-2">
            <Magnetic>
              <Image
                height={32}
                width={32}
                src="/images/TJHSST.png"
                alt="TJ Consulting Club logo"
                priority
              />
            </Magnetic>
            {!isMobile() && (
              <div className="relative h-6 overflow-hidden leading-6">
                <div className="ease-custom-cubic transition-transform duration-500 group-hover:-translate-y-6">
                  <div className="whitespace-nowrap">TJ Consulting Club</div>
                  <div className="whitespace-nowrap">@ TJHSST</div>
                </div>
              </div>
            )}
          </Link>
        </div>
        {!isMobile() && (
          <div className="z-10 flex flex-1 items-center justify-end gap-8 font-semibold">
            <Magnetic>
              <Link href={'/about'}>About</Link>
            </Magnetic>
            <Magnetic>
              <Link href={'/projects'}>Projects</Link>
            </Magnetic>
          </div>
        )}
      </div>
      {isMobile() && (
        <div className="fixed right-2 z-20 transform">
          <Menu />
        </div>
      )}
    </>
  );
}
