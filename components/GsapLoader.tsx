'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { GiCricketBat } from 'react-icons/gi';

type LoaderTheme = 'green' | 'purple';
type LoaderMode = 'inline' | 'overlay';

interface GsapLoaderProps {
  message?: string;
  mode?: LoaderMode;
  theme?: LoaderTheme;
  overlayTopClassName?: string;
}

export default function GsapLoader({
  message = 'Loading...',
  mode = 'inline',
  theme = 'green',
  overlayTopClassName = 'top-[88px] md:top-[112px]',
}: GsapLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );

      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          rotate: -18,
          duration: 0.35,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          transformOrigin: '50% 90%',
        });
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0.45 },
          { opacity: 1, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }
        );
      }

      dotRefs.current.forEach((dot, idx) => {
        gsap.fromTo(
          dot,
          { y: 0, opacity: 0.45, scale: 1 },
          {
            y: -4,
            opacity: 1,
            scale: 1.12,
            duration: 0.35,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: idx * 0.1,
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const themeClasses =
    theme === 'purple'
      ? {
          bg: 'from-gray-900 via-purple-900 to-indigo-900',
          badge: 'from-purple-500 to-indigo-600 shadow-purple-500/30',
          dots: 'from-purple-400 to-indigo-400',
          text: 'text-purple-200',
        }
      : {
          bg: 'from-emerald-50 via-green-50 to-teal-50',
          badge: 'from-green-500 to-emerald-600 shadow-green-500/30',
          dots: 'from-green-500 to-emerald-600',
          text: 'text-green-700',
        };

  const containerClassName =
    mode === 'overlay'
      ? `fixed ${overlayTopClassName} left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-gradient-to-br ${themeClasses.bg}`
      : `min-h-[60vh] flex items-center justify-center bg-transparent`;

  return (
    <div ref={rootRef} className={containerClassName}>
      <div className="flex flex-col items-center gap-4">
        <div
          ref={badgeRef}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${themeClasses.badge} shadow-xl flex items-center justify-center`}
        >
          <GiCricketBat className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) dotRefs.current[i] = el;
              }}
              className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${themeClasses.dots}`}
            />
          ))}
        </div>

        <p ref={textRef} className={`text-sm font-medium ${themeClasses.text}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
