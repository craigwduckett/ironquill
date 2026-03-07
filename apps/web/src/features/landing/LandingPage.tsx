import { Link } from '@tanstack/react-router';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>IronQuill</h1>
      <p className={styles.subtitle}>
        Your D&amp;D adventure companion. Run better sessions, build richer worlds.
      </p>
      <div className={styles.actions}>
        <Link to="/register" className={styles.ctaPrimary}>
          Get started
        </Link>
        <Link to="/srd" className={styles.ctaSecondary}>
          Browse SRD
        </Link>
      </div>
    </main>
  );
}
