import styles from "./TermsPage.module.css";

const EFFECTIVE_DATE = "7 March 2026";

export function TermsPage(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Terms of Service</h1>
      <p className={styles.meta}>Effective date: {EFFECTIVE_DATE}</p>

      <section className={styles.section}>
        <h2>1. Acceptance</h2>
        <p>
          By creating an account or using IronQuill ("the Service"), you agree
          to these Terms of Service. If you do not agree, do not use the
          Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 13 years old to create an account. If you are
          between 13 and 18, you confirm that your parent or guardian has
          reviewed and agreed to these terms on your behalf. The Service is not
          directed at children under 13, and we do not knowingly collect
          personal data from children under 13.
        </p>
        <p>
          <strong>Kids Mode</strong> is a Dungeon Master feature that allows an
          adult account holder to manage game characters on behalf of younger
          players. Children participating through Kids Mode do not create their
          own accounts; the DM (adult) is solely responsible for appropriateness
          of content shared with minors in their session.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. No Affiliation with Wizards of the Coast</h2>
        <p>
          IronQuill is an independent, fan-made application. It is not
          affiliated with, endorsed by, sponsored by, or approved by Wizards of
          the Coast LLC or Hasbro Inc. "Dungeons &amp; Dragons" and "D&amp;D"
          are trademarks of Wizards of the Coast LLC. IronQuill uses content
          from the D&amp;D 5e System Reference Document under the Open Game
          License v1.0a and the Creative Commons Attribution 4.0 International
          License. See <a href="/legal/srd">SRD Attributions</a> for full
          details.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Your Content</h2>
        <p>
          You retain ownership of the adventures, characters, scenes, and
          session notes you create ("User Content"). By using the Service, you
          grant IronQuill a limited, non-exclusive, royalty-free licence to
          store, display, and transmit your User Content solely as necessary to
          operate the Service.
        </p>
        <p>
          You are responsible for ensuring your User Content does not infringe
          third-party intellectual property rights, does not contain illegal
          content, and is appropriate for the age range of participants in your
          sessions.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, copy, or redistribute SRD data from IronQuill in bulk</li>
          <li>Attempt to access, modify, or disrupt other users' data</li>
          <li>
            Use the Service to transmit illegal, harmful, or offensive content
          </li>
          <li>
            Attempt to reverse-engineer or circumvent the Service's security
            measures
          </li>
          <li>
            Create accounts through automated means or create accounts on behalf
            of others without their consent
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>6. Service Availability</h2>
        <p>
          IronQuill is provided "as is" without warranty of any kind. We do not
          guarantee uninterrupted availability. We may modify, suspend, or
          discontinue any part of the Service at any time with or without
          notice.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Account Termination</h2>
        <p>
          You may delete your account at any time. On deletion, your User
          Content will be permanently removed from our systems within 30 days,
          subject to any legal obligations to retain certain records. SRD
          reference data is shared and will not be removed.
        </p>
        <p>
          We may suspend or terminate accounts that violate these Terms, without
          prior notice.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, IronQuill and its
          operators shall not be liable for any indirect, incidental, special,
          or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes are posted constitutes acceptance of the revised
          Terms. We will update the effective date above when changes are made.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of England and Wales. Any
          disputes shall be subject to the exclusive jurisdiction of the courts
          of England and Wales.
        </p>
      </section>

      <p className={styles.back}>
        <a href="/legal">← Back to Legal</a>
      </p>
    </div>
  );
}
