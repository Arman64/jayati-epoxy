'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

/** lp_view event — PRD §13 */
export function LpViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('lp_view', { lp_path: pathname });
  }, [pathname]);

  return null;
}
