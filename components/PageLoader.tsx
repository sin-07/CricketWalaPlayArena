'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import GsapLoader from './GsapLoader';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader
    setIsLoading(true);

    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return <GsapLoader mode="overlay" message="Loading..." />;
}
