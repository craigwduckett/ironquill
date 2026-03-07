import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

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
      <footer className={styles.footer}>
        <span className={styles.footerDisclaimer}>
          SRD content used under{" "}
          <a href="/legal/srd" className={styles.footerLink}>
            OGL 1.0a and CC-BY-4.0
          </a>
          {" · "}Not affiliated with Wizards of the Coast
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
