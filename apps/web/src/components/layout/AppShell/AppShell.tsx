import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topNav}>
        <div className={styles.logo}>IronQuill</div>
      </header>
      <div className={styles.body}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
