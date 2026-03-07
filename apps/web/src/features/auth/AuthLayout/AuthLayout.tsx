import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          IronQuill
        </Link>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
        <div className={styles.homeLink}>
          <Link to="/" className={styles.footerLink}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
