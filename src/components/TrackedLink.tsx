'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { track, type TrackEvent } from '@/lib/analytics';

type Props = {
  href: string;
  children: ReactNode;
  event: TrackEvent;
  params?: Record<string, string | number | boolean | undefined>;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

export function TrackedLink({ href, children, event, params, className, external, ariaLabel }: Props) {
  const onClick = () => track(event, params);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
