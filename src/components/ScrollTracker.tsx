'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

/** scroll_50 / scroll_90 — PRD §13 */
export function ScrollTracker() {
  const pathname = usePathname();
  const fired = useRef<{ 50: boolean; 90: boolean }>({ 50: false, 90: false });

  useEffect(() => {
    fired.current = { 50: false, 90: false };
  }, [pathname]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        const pct = (window.scrollY / max) * 100;
        if (pct >= 50 && !fired.current[50]) {
          fired.current[50] = true;
          track('scroll_50');
        }
        if (pct >= 90 && !fired.current[90]) {
          fired.current[90] = true;
          track('scroll_90');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
