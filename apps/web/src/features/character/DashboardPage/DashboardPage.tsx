import { Link } from '@tanstack/react-router';
import { Button, EmptyState, Spinner } from '../../../components/ui/index.js';
import { useAuthStore } from '../../../stores/auth.js';
import { useSrdSpecies } from '../../srd/hooks/useSrd.js';
import { CharacterCard } from '../CharacterCard/CharacterCard.js';
import { useDashboard } from '../hooks/useCharacters.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useDashboard();
  const { data: speciesData } = useSrdSpecies();

  // Build a quick lookup map: speciesId → display name
  const speciesById = Object.fromEntries((speciesData ?? []).map((s) => [s.id, s.name]));

  const characters = data?.characters ?? [];

  const firstName = user?.displayName?.split(' ')[0] ?? 'Adventurer';

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>Welcome back, {firstName}</h1>
        <p className={styles.subtitle}>
          Your characters, adventures, and sessions — all in one place.
        </p>
      </header>

      {/* ── Quick stats ─────────────────────────────────────────────────── */}
      {!isLoading && characters.length > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statPill}>
            <span>Characters</span>
            <span className={styles.statPillValue}>{characters.length}</span>
          </div>
          <div className={styles.statPill}>
            <span>Adventures</span>
            <span className={styles.statPillValue}>0</span>
          </div>
        </div>
      )}

      {/* ── Characters ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            My Characters
            {characters.length > 0 && (
              <span className={styles.sectionCount}>({characters.length})</span>
            )}
          </h2>
          <Link to="/characters/new">
            <Button variant="primary" size="sm">
              + New character
            </Button>
          </Link>
        </div>

        {isLoading && <Spinner size="lg" label="Loading characters…" />}

        {isError && (
          <EmptyState
            icon="⚠️"
            title="Failed to load characters"
            description="Check the API is running and try refreshing."
          />
        )}

        {!isLoading && !isError && characters.length === 0 && (
          <EmptyState
            icon="⚔️"
            title="No characters yet"
            description="Create your first character to get started on your adventure."
            action={
              <Link to="/characters/new">
                <Button variant="primary">Create a character</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !isError && characters.length > 0 && (
          <div className={styles.characterGrid}>
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                speciesName={character.speciesId ? speciesById[character.speciesId] : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Adventures (Phase 2 placeholder) ────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Adventures</h2>
        </div>
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>🗺️</div>
          <p>Adventure building comes in Phase 2.</p>
        </div>
      </section>
    </div>
  );
}
