import styles from './SrdAttributionsPage.module.css';

export function SrdAttributionsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>SRD Attributions &amp; Licenses</h1>
      <p className={styles.intro}>
        IronQuill uses content from the D&amp;D 5e System Reference Document ("SRD"). This content
        is reproduced under the licenses described below. IronQuill is not affiliated with, endorsed
        by, or connected to Wizards of the Coast LLC or Hasbro Inc.
      </p>

      {/* ── CC-BY-4.0 (2024) ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2>SRD 5.2.1 (2024) — Creative Commons Attribution 4.0</h2>
        <div className={styles.attributionBlock}>
          <p>
            This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by
            Wizards of the Coast LLC, available at{' '}
            <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noopener noreferrer">
              https://www.dndbeyond.com/srd
            </a>
            . The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International
            License, available at{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://creativecommons.org/licenses/by/4.0/legalcode
            </a>
            .
          </p>
        </div>
        <p className={styles.note}>
          SRD 5.2.1 content in IronQuill is identified by <code>source_edition: "2024"</code>. Where
          this content has been adapted (e.g., simplified for Kids Mode), the adaptation is noted in
          context.
        </p>
      </section>

      {/* ── OGL 1.0a (2014) ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2>SRD 5.1 (2014) — Open Game License v1.0a</h2>
        <p className={styles.note}>
          SRD 5.1 content in IronQuill is identified by <code>source_edition: "2014"</code> and is
          used under the Open Game License v1.0a reproduced in full below.
        </p>

        <div className={styles.licenseBlock}>
          <h3>OPEN GAME LICENSE Version 1.0a</h3>
          <p>
            The following text is the property of Wizards of the Coast, Inc. and is Copyright 2000
            Wizards of the Coast, Inc ("Wizards"). All Rights Reserved.
          </p>
          <ol>
            <li>
              <strong>Definitions:</strong> (a) "Contributors" means the copyright and/or trademark
              owners who have contributed Open Game Content; (b) "Derivative Material" means
              copyrighted material including derivative works and translations (including into other
              computer languages), potation, modification, correction, addition, extension, upgrade,
              improvement, compilation, abridgment or other form in which an existing work may be
              recast, transformed or adapted; (c) "Distribute" means to reproduce, license, rent,
              lease, sell, broadcast, publicly display, transmit or otherwise distribute; (d) "Open
              Game Content" means the game mechanic and includes the methods, procedures, processes
              and routines to the extent such content does not embody the Product Identity and is an
              enhancement over the prior art and any additional content clearly identified as Open
              Game Content by the Contributor, and means any work covered by this License, including
              translations and derivative works under copyright law, but specifically excludes
              Product Identity. (e) "Product Identity" means product and product line names, logos
              and identifying marks including trade dress; artifacts; creatures characters; stories,
              storylines, plots, thematic elements, dialogue, incidents, language, artwork, symbols,
              designs, depictions, likenesses, formats, poses, concepts, themes and graphic,
              photographic and other visual or audio representations; names and descriptions of
              characters, spells, enchantments, personalities, teams, personas, likenesses and
              special abilities; places, locations, environments, creatures, equipment, magical or
              supernatural abilities or effects, logos, symbols, or graphic designs; and any other
              trademark or registered trademark clearly identified as Product identity by the owner
              of the Product Identity, and which specifically excludes the Open Game Content; (f)
              "Trademark" means the logos, names, mark, sign, motto, designs that are used by a
              Contributor to identify itself or its products or the associated products contributed
              to the Open Game License by the Contributor (g) "Use", "Used" or "Using" means to use,
              Distribute, copy, edit, format, modify, translate and otherwise create Derivative
              Material of Open Game Content. (h) "You" or "Your" means the licensee in terms of this
              agreement.
            </li>
            <li>
              <strong>The License:</strong> This License applies to any Open Game Content that
              contains a notice indicating that the Open Game Content may only be Used under and in
              terms of this License. You must affix such a notice to any Open Game Content that you
              Use. No terms may be added to or subtracted from this License except as described by
              the License itself. No other terms or conditions may be applied to any Open Game
              Content distributed using this License.
            </li>
            <li>
              <strong>Offer and Acceptance:</strong> By Using the Open Game Content You indicate
              Your acceptance of the terms of this License.
            </li>
            <li>
              <strong>Grant and Consideration:</strong> In consideration for agreeing to use this
              License, the Contributors grant You a perpetual, worldwide, royalty-free,
              non-exclusive license with the exact terms of this License to Use, the Open Game
              Content.
            </li>
            <li>
              <strong>Representation of Authority to Contribute:</strong> If You are contributing
              original material as Open Game Content, You represent that Your contributions are Your
              original creation and/or You have sufficient rights to grant the rights conveyed by
              this License.
            </li>
            <li>
              <strong>Notice of License Copyright:</strong> You must update the COPYRIGHT NOTICE
              portion of this License to include the exact text of the COPYRIGHT NOTICE of any Open
              Game Content You are copying, modifying or distributing, and You must add the title,
              the copyright date, and the copyright holder's name to the COPYRIGHT NOTICE of any
              original Open Game Content you Distribute.
            </li>
            <li>
              <strong>Use of Product Identity:</strong> You agree not to Use any Product Identity,
              including as an indication as to compatibility, except as expressly licensed in
              another, independent Agreement with the owner of each element of that Product
              Identity. You agree not to indicate compatibility or co-adaptability with any
              Trademark or Registered Trademark in conjunction with a work containing Open Game
              Content except as expressly licensed in another, independent Agreement with the owner
              of such Trademark or Registered Trademark. The use of any Product Identity in Open
              Game Content does not constitute a challenge to the ownership of that Product
              Identity. The owner of any Product Identity used in Open Game Content shall retain all
              rights, title and interest in and to that Product Identity.
            </li>
            <li>
              <strong>Identification:</strong> If you distribute Open Game Content You must clearly
              indicate which portions of the work that you are distributing are Open Game Content.
            </li>
            <li>
              <strong>Updating the License:</strong> Wizards or its designated Agents may publish
              updated versions of this License. You may use any authorized version of this License
              to copy, modify and distribute any Open Game Content originally distributed under any
              version of this License.
            </li>
            <li>
              <strong>Copy of this License:</strong> You MUST include a copy of this License with
              every copy of the Open Game Content You Distribute.
            </li>
            <li>
              <strong>Use of Contributor Credits:</strong> You may not market or advertise the Open
              Game Content using the name of any Contributor unless You have written permission from
              the Contributor to do so.
            </li>
            <li>
              <strong>Inability to Comply:</strong> If it is impossible for You to comply with any
              of the terms of this License with respect to some or all of the Open Game Content due
              to statute, judicial order, or governmental regulation then You may not Use any Open
              Game Material so affected.
            </li>
            <li>
              <strong>Termination:</strong> This License will terminate automatically if You fail to
              comply with all terms herein and fail to cure such breach within 30 days of becoming
              aware of the breach. All sublicenses shall survive the termination of this License.
            </li>
            <li>
              <strong>Reformation:</strong> If any provision of this License is held to be
              unenforceable, such provision shall be reformed only to the extent necessary to make
              it enforceable.
            </li>
            <li>
              <strong>COPYRIGHT NOTICE</strong>
              <br />
              Open Game License v 1.0a Copyright 2000, Wizards of the Coast, Inc.
              <br />
              System Reference Document 5.1 Copyright 2016, Wizards of the Coast, Inc.; Authors Mike
              Mearls, Jeremy Crawford, Chris Perkins, Rodney Thompson, Peter Lee, James Wyatt,
              Robert J. Schwalb, Bruce R. Cordell, Chris Sims, and Steve Townshend, based on
              original material by E. Gary Gygax and Dave Arneson.
            </li>
          </ol>

          <p className={styles.ogcDeclaration}>
            <strong>Designation of Open Game Content:</strong> All stat blocks, spell descriptions,
            monster statistics, race traits, class features, background features, item descriptions,
            condition descriptions, and rules text reproduced from the SRD 5.1 within IronQuill
            constitute Open Game Content as defined in the OGL v1.0a.
          </p>

          <p className={styles.ogcDeclaration}>
            <strong>Designation of Product Identity:</strong> IronQuill's own application code, UI
            design, adventure content created by users, and any original written content not derived
            from the SRD are Product Identity and are not Open Game Content.
          </p>
        </div>
      </section>

      {/* ── Data source ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2>SRD Data Source</h2>
        <p>
          SRD reference data (races, classes, spells, monsters, items, conditions, rules) is sourced
          from the{' '}
          <a
            href="https://github.com/5e-bits/5e-database"
            target="_blank"
            rel="noopener noreferrer"
          >
            5e-database project by 5e-bits
          </a>{' '}
          (MIT License). The underlying SRD content within that dataset is reproduced under the OGL
          1.0a and CC-BY-4.0 as described above.
        </p>
      </section>

      <p className={styles.back}>
        <a href="/legal">← Back to Legal</a>
      </p>
    </div>
  );
}
