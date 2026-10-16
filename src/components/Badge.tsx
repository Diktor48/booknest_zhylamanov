import type { ReactNode } from 'react';

interface BadgeProps { children: ReactNode; tone?: 'normal' | 'positive' }

export function Badge({ children, tone = 'normal' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
