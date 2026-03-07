import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = 'default', size, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[`badge--${variant}`],
        size === 'sm' && styles['badge--sm'],
        className,
      )}
    >
      {children}
    </span>
  );
}
