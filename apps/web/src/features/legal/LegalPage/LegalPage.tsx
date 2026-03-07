import styles from './LegalPage.module.css';

export function LegalPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Legal</h1>
      <p className={styles.intro}>
        IronQuill is an independent, fan-made tool. It is not affiliated with, endorsed by, or
        connected to Wizards of the Coast LLC or Hasbro Inc.
      </p>

      <nav className={styles.nav}>
        <a href="/legal/terms" className={styles.navLink}>
          <span className={styles.navTitle}>Terms of Service</span>
          <span className={styles.navDesc}>Rules governing your use of IronQuill</span>
        </a>
        <a href="/legal/privacy" className={styles.navLink}>
          <span className={styles.navTitle}>Privacy Policy</span>
          <span className={styles.navDesc}>How we collect, use, and protect your data</span>
        </a>
        <a href="/legal/srd" className={styles.navLink}>
          <span className={styles.navTitle}>SRD Attributions &amp; Licenses</span>
          <span className={styles.navDesc}>
            Open Game License, Creative Commons attribution, and data sources
          </span>
        </a>
      </nav>
    </div>
  );
}
