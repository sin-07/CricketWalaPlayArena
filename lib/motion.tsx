import React from 'react';

type AnyProps = React.DOMAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

const MOTION_PROP_PREFIXES = ['while'];
const MOTION_PROP_KEYS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'custom',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'viewport',
]);

function stripMotionProps<T extends AnyProps>(props: T): T {
  const next: AnyProps = {};

  for (const [key, value] of Object.entries(props)) {
    if (MOTION_PROP_KEYS.has(key)) continue;
    if (MOTION_PROP_PREFIXES.some(prefix => key.startsWith(prefix))) continue;
    next[key] = value;
  }

  return next as T;
}

function createMotionComponent(tag: string) {
  const Comp = React.forwardRef<HTMLElement, AnyProps>((props, ref) => {
    const cleanProps = stripMotionProps(props);
    return React.createElement(tag, { ...cleanProps, ref }, cleanProps.children as React.ReactNode);
  });

  Comp.displayName = `Motion.${tag}`;
  return Comp;
}

const motion = new Proxy({} as Record<string, React.ComponentType<AnyProps>>, {
  get(target, prop: string) {
    if (!target[prop]) {
      target[prop] = createMotionComponent(prop);
    }
    return target[prop];
  },
});

export function AnimatePresence({ children }: { children: React.ReactNode } & AnyProps) {
  return <>{children}</>;
}

export function MotionConfig({ children }: { children: React.ReactNode; reducedMotion?: 'always' | 'never' | 'user' } & AnyProps) {
  return <>{children}</>;
}

export { motion };
