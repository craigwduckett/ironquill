import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useLogout } from '../../../features/auth/hooks/useAuth.js';
import { useAuthStore } from '../../../stores/auth.js';
import { Button } from '../../ui/Button/Button.js';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: ReactNode;
};

const NAV_LINKS = [
  { to: '/srd', label: 'SRD' },
  { to: '/dashboard', label: 'Dashboard', authRequired: true },
] as const;

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuthStore();
  const logout = useLogout();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className={styles.shell}>
      <header className={styles.topNav}>
        <Link to="/" className={styles.logoLink}>
          IronQuill
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          {NAV_LINKS.filter((l) => !('authRequired' in l) || !l.authRequired || user).map(
            (link) => (
              <Link
                key={link.to}
                to={link.to}
                className={styles.navLink}
                data-active={currentPath.startsWith(link.to) ? 'true' : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className={styles.navActions}>
          {user ? (
            <>
              <span className={styles.userDisplay}>{user.displayName}</span>
              <Button
                variant="ghost"
                size="sm"
                isLoading={logout.isPending}
                onClick={() => logout.mutate()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={styles.navLink}
                data-active={currentPath === '/login' ? 'true' : undefined}
              >
                Sign in
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <main className={styles.main}>{children}</main>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerDisclaimer}>
          SRD content used under{' '}
          <a href="/legal/srd" className={styles.footerLink}>
            OGL 1.0a and CC-BY-4.0
          </a>
          {' · '}Not affiliated with Wizards of the Coast
        </span>
        <nav className={styles.footerNav} aria-label="Legal links">
          <a href="/legal/terms" className={styles.footerLink}>
            Terms
          </a>
          <a href="/legal/privacy" className={styles.footerLink}>
            Privacy
          </a>
          <a href="/legal" className={styles.footerLink}>
            Legal
          </a>
        </nav>
      </footer>
    </div>
  );
}
