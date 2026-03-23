'use client';

import React from 'react';
import { MotionConfig } from '@/lib/motion';

export default function NoMotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="always">{children}</MotionConfig>;
}
