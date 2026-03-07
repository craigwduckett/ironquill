import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Badge, EmptyState, Spinner } from '../../../components/ui/index.js';
import { type SrdClass, useSrdClasses } from '../hooks/useSrd.js';
import { NoviceBox, Tip } from '../SrdHelpers.js';
import styles from '../SrdListPage.module.css';
import { SrdMarkdown } from '../SrdMarkdown/SrdMarkdown.js';

const CLASS_DOTS: Record<string, string> = {
  Barbarian: '#e05c5c',
  Bard: '#9b59b6',
  Cleric: '#f1c40f',
  Druid: '#5cb87a',
  Fighter: '#e09d3c',
  Monk: '#1abc9c',
  Paladin: '#f39c12',
  Ranger: '#27ae60',
  Rogue: '#7f8c8d',
  Sorcerer: '#e74c3c',
  Warlock: '#8e44ad',
  Wizard: '#2980b9',
};

export function SrdClassesPage() {
  const { data, isLoading, isError } = useSrdClasses();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SrdClass | null>(null);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, search]);

  if (isLoading) {
    return (
      <div className={styles.loadingPane}>
        <Spinner size="lg" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.loadingPane}>
        <EmptyState icon="⚠️" title="Failed to load classes" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Classes</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search classes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p className={styles.count}>
          {filtered.length} of {(data ?? []).length} classes
        </p>

        <div className={styles.list}>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={clsx(styles.listRow, selected?.id === c.id && styles.listRowActive)}
              onClick={() => setSelected(c)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background: CLASS_DOTS[c.name] ?? 'var(--color-accent)',
                }}
              />
              <span className={styles.rowName}>{c.name}</span>
              <span className={styles.rowCategory}>d{c.hitDie}</span>
              <span className={styles.rowBadge}>
                <Badge variant="accent" size="sm">
                  Hit Die
                </Badge>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState icon="⚔️" title="No results" description="Try a different search." />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? 'empty'} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>⚔️</span>
            <p className={styles.emptyDetailText}>
              Select a class from the list to see what it can do.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant="accent">Hit Die d{selected.hitDie}</Badge>
                {selected.savingThrows.map((s) => (
                  <Badge key={s} variant="warning">
                    {s} Save
                  </Badge>
                ))}
              </div>
            </div>

            <NoviceBox>
              <strong>What is a Class?</strong> Your class is your character's job or calling — it
              shapes how you fight, what magic you can use, and what special abilities you gain as
              you level up. Every class plays differently: Fighters are tough melee warriors,
              Wizards study arcane magic, Rogues are stealthy and skilled, and so on.
            </NoviceBox>

            {selected.description && (
              <div className={styles.detailSection}>
                <SrdMarkdown content={selected.description} />
              </div>
            )}

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>
                Hit Die: d{selected.hitDie}
                <Tip text="When you level up, you roll this die to see how many Hit Points (HP) you gain. A Fighter's d10 means more HP (tougher) than a Wizard's d6. More HP = harder to knock out in a fight." />
              </div>
            </div>

            {selected.savingThrows.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Saving Throw Proficiencies
                  <Tip text="Saving throws are rolls you make when something bad happens to you — like dodging a fireball or resisting a poison. Being proficient in one means you're especially good at shrugging off those effects." />
                </div>
                <ul className={styles.detailList}>
                  {selected.savingThrows.map((s) => (
                    <li key={s}>
                      <Badge variant="warning">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.armorProficiencies.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Armour Proficiencies
                  <Tip text="You can only wear armour your class is proficient with. Wearing armour you're not trained in makes you clumsy — your Dexterity bonus disappears and some abilities are disabled." />
                </div>
                <ul className={styles.detailList}>
                  {selected.armorProficiencies.map((a) => (
                    <li key={a}>
                      <Badge>{a}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.weaponProficiencies.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Weapon Proficiencies
                  <Tip text="Weapons you're trained to use properly. Without proficiency you can still swing a sword, but you don't add your Proficiency Bonus to your attack roll — making you much less likely to hit." />
                </div>
                <ul className={styles.detailList}>
                  {selected.weaponProficiencies.map((w) => (
                    <li key={w}>
                      <Badge>{w}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.skillChoices && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Skills — choose {selected.skillChoices.choose}
                  <Tip text="Skills represent things your character is particularly good at, like sneaking, persuading people, or knowing history. You pick a few when you first create your character, and they influence dice rolls when you try those things." />
                </div>
                <ul className={styles.detailList}>
                  {selected.skillChoices.from.map((s) => (
                    <li key={s}>
                      <Badge variant="info">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.startingEquipment.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>Starting Equipment</div>
                <ul className={styles.detailList}>
                  {selected.startingEquipment.map((e) => (
                    <li key={`${String(e.name)}-eq`}>
                      <Badge>
                        {String(e.name)} ×{String(e.quantity)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.featuresByLevel.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Level 1 Features
                  <Tip text="These are the special abilities you get immediately when you start playing this class. You'll gain more features as you level up." />
                </div>
                {(selected.featuresByLevel.find((f) => f.level === 1)?.features ?? []).map((f) => (
                  <div key={f.name} className={styles.detailSubsection}>
                    <div className={styles.detailSubsectionName}>{f.name}</div>
                    <SrdMarkdown content={f.description} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
