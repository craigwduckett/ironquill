import styles from "./PrivacyPage.module.css";

const EFFECTIVE_DATE = "7 March 2026";

export function PrivacyPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      <p className={styles.meta}>Effective date: {EFFECTIVE_DATE}</p>

      <section className={styles.section}>
        <h2>1. Who We Are</h2>
        <p>
          IronQuill is an independent application for managing fifth-edition SRD
          tabletop sessions. It is not affiliated with Wizards of the Coast LLC
          or Hasbro Inc. References to "we", "us", or "our" mean the operators
          of IronQuill.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Minimum Age &amp; Children's Data</h2>
        <p>
          IronQuill is not directed at children under 13 and we do not knowingly
          collect personal data from children under 13. If you believe a child
          under 13 has created an account, please contact us and we will delete
          it promptly.
        </p>
        <p>
          <strong>Kids Mode</strong> allows an adult Dungeon Master to manage
          game characters for younger players. Children do not create accounts;
          the adult DM is the account holder and is responsible for all data
          entered on behalf of child participants. No personal data is collected
          directly from the children themselves.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Data We Collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> email address, display name, hashed
            password
          </li>
          <li>
            <strong>User content:</strong> characters, adventures, scenes, NPCs,
            session logs, and notes you create
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type,
            timestamps of requests (standard server logs)
          </li>
          <li>
            <strong>Session cookie:</strong> a strictly necessary{" "}
            <code>httpOnly</code> cookie used to maintain your login session
            (refresh token). This cookie is functional and does not track you
            across other sites.
          </li>
        </ul>
        <p>We do not collect payment data, location data, or biometric data.</p>
      </section>

      <section className={styles.section}>
        <h2>4. How We Use Your Data</h2>
        <ul>
          <li>
            To operate and provide the Service (create and manage your account,
            serve your content)
          </li>
          <li>To authenticate you and maintain session security</li>
          <li>To detect and prevent abuse, fraud, or security incidents</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p>
          We do not sell your data. We do not use your data for advertising.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Data Storage and Processors</h2>
        <p>
          Your data is stored in a PostgreSQL database hosted on{" "}
          <strong>Railway</strong> (servers located in the United States). File
          uploads (character portraits, adventure images) are stored on{" "}
          <strong>Cloudflare R2</strong>. The IronQuill web application is
          served via <strong>Cloudflare Pages</strong>.
        </p>
        <p>
          By using IronQuill, you acknowledge that your data may be transferred
          to and processed in the United States. If you are located in the EU or
          UK, this transfer is made on the basis of standard contractual clauses
          or equivalent safeguards provided by our processors.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Cookies</h2>
        <p>
          IronQuill uses a single <strong>strictly necessary</strong> cookie: a
          refresh token stored in an <code>httpOnly</code>, <code>Secure</code>,{" "}
          <code>SameSite=Strict</code> cookie. This cookie is essential for
          keeping you logged in and cannot be disabled without logging out. No
          tracking or analytics cookies are set.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active.
          When you delete your account, your personal data and User Content are
          permanently deleted within 30 days. Server logs are retained for up to
          90 days for security and debugging purposes.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Your Rights</h2>
        <p>
          Depending on where you are located, you may have the following rights
          regarding your personal data:
        </p>
        <ul>
          <li>
            <strong>Access:</strong> request a copy of the data we hold about
            you
          </li>
          <li>
            <strong>Correction:</strong> request correction of inaccurate data
          </li>
          <li>
            <strong>Deletion:</strong> request deletion of your account and
            associated data
          </li>
          <li>
            <strong>Portability:</strong> request an export of your User Content
          </li>
          <li>
            <strong>Objection:</strong> object to processing of your data
          </li>
        </ul>
        <p>
          To exercise any of these rights, or to report a privacy concern,
          contact us at the address listed below.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Data Breach Notification</h2>
        <p>
          In the event of a personal data breach that is likely to result in a
          risk to your rights and freedoms, we will notify affected users and
          relevant supervisory authorities within 72 hours of becoming aware of
          the breach, as required by applicable law.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will update
          the effective date above and, for material changes, notify you by
          email or in-app notice.
        </p>
      </section>

      <p className={styles.back}>
        <a href="/legal">← Back to Legal</a>
      </p>
    </div>
  );
}
