import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Badge, EmptyState, Spinner } from "../../../components/ui/index.js";
import { type SrdItem, useSrdItems } from "../hooks/useSrd.js";
import { NoviceBox, Tip } from "../SrdHelpers.js";
import styles from "../SrdListPage.module.css";
import { SrdMarkdown } from "../SrdMarkdown/SrdMarkdown.js";

const CATEGORY_LABELS: Record<SrdItem["category"], string> = {
  weapon: "Weapon",
  armor: "Armour",
  adventuring_gear: "Gear",
  tool: "Tool",
  magic_item: "Magic Item",
};

const CATEGORY_COLORS: Record<string, string> = {
  weapon: "#e05c5c",
  armor: "#5c9ee0",
  adventuring_gear: "#5cb87a",
  tool: "#e09d3c",
  magic_item: "#c8a96e",
};

const RARITY_VARIANT: Record<
  string,
  "default" | "accent" | "success" | "warning" | "danger" | "info"
> = {
  Common: "default",
  Uncommon: "success",
  Rare: "info",
  "Very Rare": "warning",
  Legendary: "accent",
  Artifact: "danger",
};

export function SrdItemsPage() {
  const { data, isLoading, isError } = useSrdItems();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<SrdItem | null>(null);

  const categories = useMemo(() => {
    const keys = [...new Set((data ?? []).map((i) => i.category))].sort();
    return ["All", ...keys] as ("All" | SrdItem["category"])[];
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? [])
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, category, search]);

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
        <EmptyState icon="⚠️" title="Failed to load items" />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleText}>Items</span>
            <Link to="/srd" className={styles.sidebarBack}>
              ← SRD
            </Link>
          </div>
          <input
            className={styles.searchInput}
            placeholder="Search items…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
          />
          <div className={styles.chips}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={clsx(
                  styles.chip,
                  category === cat && styles.chipActive,
                )}
                onClick={() => {
                  setCategory(cat);
                  setSelected(null);
                }}
              >
                {cat === "All"
                  ? "All"
                  : CATEGORY_LABELS[cat as SrdItem["category"]]}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.count}>
          {filtered.length} of {(data ?? []).length} items
        </p>

        <div className={styles.list}>
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={clsx(
                styles.listRow,
                selected?.id === item.id && styles.listRowActive,
              )}
              onClick={() => setSelected(item)}
            >
              <span
                className={styles.rowDot}
                style={{
                  background:
                    CATEGORY_COLORS[item.category] ?? "var(--color-border)",
                }}
              />
              <span className={styles.rowName}>{item.name}</span>
              <span className={styles.rowCategory}>
                {CATEGORY_LABELS[item.category]}
              </span>
              {item.rarity && (
                <span className={styles.rowBadge}>
                  <Badge
                    variant={RARITY_VARIANT[item.rarity] ?? "default"}
                    size="sm"
                  >
                    {item.rarity}
                  </Badge>
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon="🗡️"
              title="No items found"
              description="Try different filters."
            />
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div key={selected?.id ?? "empty"} className={styles.detail}>
        {!selected ? (
          <div className={styles.emptyDetail}>
            <span className={styles.emptyDetailIcon}>🗡️</span>
            <p className={styles.emptyDetailText}>
              Select an item to see its properties and description.
            </p>
          </div>
        ) : (
          <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
              <h1 className={styles.detailTitle}>{selected.name}</h1>
              <div className={styles.cardMeta}>
                <Badge>{CATEGORY_LABELS[selected.category]}</Badge>
                {selected.rarity && (
                  <Badge variant={RARITY_VARIANT[selected.rarity] ?? "default"}>
                    {selected.rarity}
                  </Badge>
                )}
                {selected.requiresAttunement && (
                  <Badge variant="warning">Requires Attunement</Badge>
                )}
              </div>
            </div>

            {selected.category === "magic_item" && (
              <NoviceBox>
                <strong>Magic Items</strong> are special enchanted objects that
                grant extra abilities or bonuses. Some require{" "}
                <strong>Attunement</strong> — you must spend a short rest
                bonding with the item before you can use its magic, and you can
                only be attuned to three items at once.
                {selected.rarity && (
                  <>
                    {" "}
                    <strong>Rarity</strong> ({selected.rarity}) indicates how
                    hard the item is to find in the world — Common items might
                    be for sale in a city; Legendary items are ancient and
                    priceless.
                  </>
                )}
              </NoviceBox>
            )}

            <div className={styles.detailSection}>
              <table
                style={{
                  borderCollapse: "collapse",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <tbody>
                  {selected.cost && (
                    <tr
                      style={{
                        borderBottom: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "var(--space-2) var(--space-4) var(--space-2) 0",
                          fontWeight: "var(--font-semibold)",
                          color: "var(--color-text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Cost{" "}
                        <Tip text="The standard market price for this item. gp = gold pieces (the main currency), sp = silver pieces (10 sp = 1 gp), cp = copper pieces (10 cp = 1 sp)." />
                      </td>
                      <td style={{ padding: "var(--space-2) 0" }}>
                        {selected.cost.amount} {selected.cost.unit}
                      </td>
                    </tr>
                  )}
                  {selected.weight !== null && (
                    <tr>
                      <td
                        style={{
                          padding:
                            "var(--space-2) var(--space-4) var(--space-2) 0",
                          fontWeight: "var(--font-semibold)",
                          color: "var(--color-text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Weight{" "}
                        <Tip text="Characters can carry a total weight equal to 15 × their Strength score in pounds before becoming encumbered. Tracking weight is optional but recommended for realism." />
                      </td>
                      <td style={{ padding: "var(--space-2) 0" }}>
                        {selected.weight} lb.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.detailSection}>
              {selected.description ? (
                <SrdMarkdown content={selected.description} />
              ) : (
                <p className={styles.detailText}>No description available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
