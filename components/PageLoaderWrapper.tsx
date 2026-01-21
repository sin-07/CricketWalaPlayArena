'use client';

import { Suspense } from 'react';
import PageLoader from './PageLoader';

function PageLoaderFallback() {
  return null;
}

export default function PageLoaderWrapper() {
  return (
    <Suspense fallback={<PageLoaderFallback />}>
      <PageLoader />
    </Suspense>
  );
}
