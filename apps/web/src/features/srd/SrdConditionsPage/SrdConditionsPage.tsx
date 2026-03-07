import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Badge, EmptyState, Spinner } from "../../../components/ui/index.js";
import { type SrdCondition, useSrdConditions } from "../hooks/useSrd.js";
import { NoviceBox } from "../SrdHelpers.js";
import styles from "../SrdListPage.module.css";
import { SrdMarkdown } from "../SrdMarkdown/SrdMarkdown.js";

const EDITION_LABELS: Record<string, string> = { "2014": "5.1", "2024": "5.2" };

export function SrdConditionsPage() {
  const { data, isLoading, isError } = useSrdConditions();
  const [search, setSearch] = useState("");
  const [editionFilter, setEditionFilter] = useState("All");
  const [selected, setSelected] = useState<SrdCondition | null>(null);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter(
        (c) => editionFilter === "All" || c.sourceEdition === editionFilter,
      )
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
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
        <EmptyState icon="⚠️" title="Failed to load conditions" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Conditions</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search conditions…"
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
          {filtered.length} of {(data ?? []).length} conditions
        </p>

        <div className={styles.list}>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={clsx(
                styles.listRow,
                selected?.id === c.id && styles.listRowActive,
              )}
              onClick={() => setSelected(c)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background:
                    c.sourceEdition === "2024"
                      ? "var(--color-info)"
                      : "var(--color-warning)",
                }}
              />
              <span className={styles.rowName}>{c.name}</span>
              <span className={styles.rowCategory}>{c.sourceEdition}</span>
              <span className={styles.rowBadge}>
                <Badge variant="warning" size="sm">
                  Status
                </Badge>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? "empty"} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>⚠️</span>
            <p className={styles.emptyDetailText}>
              Select a condition to understand its mechanical effects.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge variant="warning">Status Condition</Badge>
                <Badge variant="info">
                  SRD{" "}
                  {EDITION_LABELS[selected.sourceEdition] ??
                    selected.sourceEdition}
                </Badge>
              </div>
            </div>

            <NoviceBox>
              <strong>What is a Condition?</strong> Conditions are temporary
              status effects that change what a character can do. They can be
              inflicted by spells, monster abilities, or other events. For
              example, a <em>Paralyzed</em> character can't move or take actions
              — a very bad situation in a fight! Most conditions end when a
              spell expires, a saving throw succeeds, or another condition
              removes them.
            </NoviceBox>

            <div className={styles.detailSection}>
              <SrdMarkdown content={selected.description} />
            </div>

            {selected.mechanicalEffects.length > 0 && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionLabel}>
                  Mechanical Effects
                </div>
                <ul
                  style={{
                    paddingLeft: "var(--space-5)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  {selected.mechanicalEffects.map((e) => (
                    <li
                      key={e}
                      className={styles.detailText}
                      style={{ marginBottom: "var(--space-2)" }}
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
