'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Global GSAP perf settings
  gsap.config({ force3D: true, nullTargetWarn: false });
  ScrollTrigger.config({ limitCallbacks: true });
}

/**
 * GPU-optimized defaults: only animate transform + opacity (composite-friendly).
 * All animations use `fromTo` to prevent FOUC (flash of unstyled content).
 * `force3D: true` promotes to GPU layer; `will-change: 'transform'` hints browser.
 */

// Split text into word wrappers for smooth vertical rise animation.
// Returns the inner word spans so callers can animate them directly.
export function splitTextIntoRiseWords(element: HTMLElement): HTMLElement[] {
  const existingWords = element.querySelectorAll<HTMLElement>('[data-gsap-rise-word="1"]');
  if (existingWords.length > 0) {
    return Array.from(existingWords);
  }

  if (!element.dataset.gsapOriginalHtml) {
    element.dataset.gsapOriginalHtml = element.innerHTML;
  }

  const wordEls: HTMLElement[] = [];

  function processNode(node: ChildNode, parent: HTMLElement) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const tokens = text.split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      tokens.forEach(token => {
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          return;
        }

        if (!token) return;

        const wrapper = document.createElement('span');
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'inline-flex';
        wrapper.style.verticalAlign = 'top';

        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform, opacity';

        // Preserve gradient-clipped text visibility (e.g. `bg-clip-text text-transparent`).
        if (parent.classList.contains('text-transparent')) {
          inner.style.color = 'transparent';
        }
        if (parent.classList.contains('bg-clip-text')) {
          inner.style.background = 'inherit';
          inner.style.webkitBackgroundClip = 'text';
          inner.style.backgroundClip = 'text';
        }

        inner.dataset.gsapRiseWord = '1';
        inner.textContent = token;

        wrapper.appendChild(inner);
        fragment.appendChild(wrapper);
        wordEls.push(inner);
      });

      parent.appendChild(fragment);

      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const originalEl = node as HTMLElement;
      const clonedEl = document.createElement(originalEl.tagName.toLowerCase());

      for (const attr of Array.from(originalEl.attributes)) {
        clonedEl.setAttribute(attr.name, attr.value);
      }

      for (const child of Array.from(originalEl.childNodes)) {
        processNode(child, clonedEl);
      }

      parent.appendChild(clonedEl);
    }
  }

  const originalChildren = Array.from(element.childNodes);
  element.innerHTML = '';
  originalChildren.forEach(child => processNode(child, element));

  return wordEls;
}

export function restoreSplitText(element: HTMLElement) {
  const originalHtml = element.dataset.gsapOriginalHtml;
  if (typeof originalHtml === 'string') {
    element.innerHTML = originalHtml;
    delete element.dataset.gsapOriginalHtml;
  }
}

// ─── Fade up on scroll ───
export function useFadeUp<T extends HTMLElement>(options?: {
  delay?: number;
  duration?: number;
  y?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { y: options?.y ?? 40, opacity: 0, willChange: 'transform, opacity' },
        {
          y: 0,
          opacity: 1,
          duration: options?.duration ?? 0.6,
          delay: options?.delay ?? 0,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Stagger children on scroll ───
export function useStaggerChildren<T extends HTMLElement>(options?: {
  stagger?: number;
  duration?: number;
  y?: number;
  childSelector?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll(options?.childSelector ?? ':scope > *');
    if (children.length === 0) return;

    // Set initial hidden state immediately to prevent flash
    gsap.set(children, { y: options?.y ?? 30, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(children, {
        y: 0,
        opacity: 1,
        duration: options?.duration ?? 0.5,
        stagger: options?.stagger ?? 0.08,
        ease: 'power2.out',
        force3D: true,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Scale in on scroll ───
export function useScaleIn<T extends HTMLElement>(options?: {
  delay?: number;
  duration?: number;
  scale?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { scale: options?.scale ?? 0.9, opacity: 0, willChange: 'transform, opacity' },
        {
          scale: 1,
          opacity: 1,
          duration: options?.duration ?? 0.5,
          delay: options?.delay ?? 0,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Slide from left ───
export function useSlideInLeft<T extends HTMLElement>(options?: {
  delay?: number;
  duration?: number;
  x?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { x: options?.x ?? -50, opacity: 0, willChange: 'transform, opacity' },
        {
          x: 0,
          opacity: 1,
          duration: options?.duration ?? 0.6,
          delay: options?.delay ?? 0,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Slide from right ───
export function useSlideInRight<T extends HTMLElement>(options?: {
  delay?: number;
  duration?: number;
  x?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { x: options?.x ?? 50, opacity: 0, willChange: 'transform, opacity' },
        {
          x: 0,
          opacity: 1,
          duration: options?.duration ?? 0.6,
          delay: options?.delay ?? 0,
          ease: 'power2.out',
          force3D: true,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Hero timeline reveal (mount-based, no scroll trigger) ───
export function useHeroReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', force3D: true } });

      const badge = el.querySelector('[data-gsap="hero-badge"]');
      const heading = el.querySelector('[data-gsap="hero-heading"]');
      const subtitle = el.querySelector('[data-gsap="hero-subtitle"]');
      const cta = el.querySelector('[data-gsap="hero-cta"]');

      // Set all hidden immediately
      const targets = [badge, heading, subtitle, cta].filter(Boolean);
      gsap.set(targets, { opacity: 0 });

      if (badge)    tl.fromTo(badge,    { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
      if (heading)  tl.fromTo(heading,  { y: 30, opacity: 0 },  { y: 0, opacity: 1, duration: 0.5 }, '-=0.25');
      if (subtitle) tl.fromTo(subtitle, { y: 20, opacity: 0 },  { y: 0, opacity: 1, duration: 0.4 }, '-=0.2');
      if (cta)      tl.fromTo(cta,      { y: 15, opacity: 0 },  { y: 0, opacity: 1, duration: 0.4 }, '-=0.15');
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Magnetic hover (desktop only, throttled) ───
export function useMagneticHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on touch devices — avoids mobile jank
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return; // throttle to 1 rAF
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        gsap.to(el, { x, y, duration: 0.25, ease: 'power2.out', force3D: true, overwrite: 'auto' });
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', force3D: true, overwrite: 'auto' });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
}

// ─── Text split + reveal (word-by-word, used on hero heading) ───
export function useTextReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const wordSpans = splitTextIntoRiseWords(el);
    gsap.set(wordSpans, { opacity: 0, y: 20 });

    const ctx = gsap.context(() => {
      gsap.to(wordSpans, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power2.out',
        force3D: true,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    return () => {
      ctx.revert();
      restoreSplitText(el);
    };
  }, []);

  return ref;
}

// ─── Clip-path reveal (wipe effect) ───
export function useClipReveal<T extends HTMLElement>(direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clips = {
      up:    { from: 'inset(100% 0% 0% 0%)', to: 'inset(0% 0% 0% 0%)' },
      down:  { from: 'inset(0% 0% 100% 0%)', to: 'inset(0% 0% 0% 0%)' },
      left:  { from: 'inset(0% 100% 0% 0%)', to: 'inset(0% 0% 0% 0%)' },
      right: { from: 'inset(0% 0% 0% 100%)', to: 'inset(0% 0% 0% 0%)' },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { clipPath: clips[direction].from, willChange: 'clip-path' },
        {
          clipPath: clips[direction].to,
          duration: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Float / hover bob (subtle looping float for decorative elements) ───
export function useFloat<T extends HTMLElement>(options?: { y?: number; duration?: number }) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: options?.y ?? -8,
        duration: options?.duration ?? 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        force3D: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

// ─── Counter animation ───
export function useCountUp(endValue: number, options?: { duration?: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: endValue,
        duration: options?.duration ?? 1.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.value) + (options?.suffix ?? '');
        },
      });
    });

    return () => ctx.revert();
  }, [endValue]);

  return ref;
}
