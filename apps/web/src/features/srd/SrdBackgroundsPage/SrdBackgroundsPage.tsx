import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Badge, EmptyState, Spinner } from "../../../components/ui/index.js";
import { type SrdBackground, useSrdBackgrounds } from "../hooks/useSrd.js";
import { NoviceBox, Tip } from "../SrdHelpers.js";
import styles from "../SrdListPage.module.css";
import { SrdMarkdown } from "../SrdMarkdown/SrdMarkdown.js";

const EDITION_LABELS: Record<string, string> = { "2014": "5.1", "2024": "5.2" };

export function SrdBackgroundsPage() {
  const { data, isLoading, isError } = useSrdBackgrounds();
  const [search, setSearch] = useState("");
  const [editionFilter, setEditionFilter] = useState("All");
  const [selected, setSelected] = useState<SrdBackground | null>(null);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter(
        (b) => editionFilter === "All" || b.sourceEdition === editionFilter,
      )
      .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, editionFilter, search]);

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
        <EmptyState icon="⚠️" title="Failed to load backgrounds" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Backgrounds</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search backgrounds…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.chips}>
            {["All", "2014", "2024"].map((ed) => (
              <button
                key={ed}
                type="button"
                className={clsx(
                  styles.chip,
                  editionFilter === ed && styles.chipActive,
                )}
                onClick={() => setEditionFilter(ed)}
              >
                {ed === "All" ? "All" : `SRD ${EDITION_LABELS[ed] ?? ed}`}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>
          {filtered.length} of {(data ?? []).length} backgrounds
        </p>

        <div className={styles.list}>
          {filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              className={clsx(
                styles.listRow,
                selected?.id === b.id && styles.listRowActive,
              )}
              onClick={() => setSelected(b)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background:
                    b.sourceEdition === "2024"
                      ? "var(--color-info)"
                      : "var(--color-accent)",
                }}
              />
              <span className={styles.rowName}>{b.name}</span>
              <span className={styles.rowCategory}>{b.sourceEdition}</span>
              <span className={styles.rowBadge}>
                <Badge variant="info" size="sm">
                  SRD {EDITION_LABELS[b.sourceEdition] ?? b.sourceEdition}
                </Badge>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon="📜"
              title="No results"
              description="Try a different search."
            />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? "empty"} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>📜</span>
            <p className={styles.emptyDetailText}>
              Select a background to learn about your character's life before
              adventuring.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant="info">
                  SRD{" "}
                  {EDITION_LABELS[selected.sourceEdition] ??
                    selected.sourceEdition}
                </Badge>
              </div>
            </div>

            <NoviceBox>
              <strong>What is a Background?</strong> Your background represents
              what your character did before becoming an adventurer — their job,
              upbringing, or life experience. It gives you extra skills,
              equipment, and a special feature that reflects your past. A{" "}
              <em>Soldier</em> background might give you military contacts; a{" "}
              <em>Sage</em> might know where to find ancient lore.
            </NoviceBox>

            {selected.skillProficiencies.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Skill Proficiencies
                  <Tip text="These skills are added to your character sheet for free — you don't need to spend any resources on them. They represent what you learned from your pre-adventuring life." />
                </div>
                <ul className={styles.detailList}>
                  {selected.skillProficiencies.map((s) => (
                    <li key={s}>
                      <Badge variant="success">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.toolProficiencies.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Tool Proficiencies
                  <Tip text="Tools are special items that require training to use effectively — like thieves' tools for picking locks, or an instrument for performing music. Being proficient means you can use them properly and add your Proficiency Bonus to rolls." />
                </div>
                <ul className={styles.detailList}>
                  {selected.toolProficiencies.map((t) => (
                    <li key={t}>
                      <Badge>{t}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.detailSection}>
              <div className={styles.detailSectionLabel}>
                Background Feature: {selected.featureName}
                <Tip text="This is a unique non-combat ability you get from your background. Unlike skills, it's not a dice roll — it just gives you access to something special in the world, like contacts, shelter, or insider knowledge." />
              </div>
              <SrdMarkdown content={selected.featureDescription} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
