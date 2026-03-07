import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button, EmptyState, Spinner } from '../../../components/ui/index.js';
import { useAuthStore } from '../../../stores/auth.js';
import { useJoinAdventure } from '../../adventure/hooks/useAdventures.js';
import { useSrdSpecies } from '../../srd/hooks/useSrd.js';
import { CharacterCard } from '../CharacterCard/CharacterCard.js';
import { useDashboard } from '../hooks/useCharacters.js';
import styles from './DashboardPage.module.css';

type AdventureSummary = {
  id: string;
  title: string;
  status: string;
  adventureType: string;
};

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useDashboard();
  const { data: speciesData } = useSrdSpecies();
  const joinAdventure = useJoinAdventure();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  // Build a quick lookup map: speciesId → display name
  const speciesById = Object.fromEntries((speciesData ?? []).map((s) => [s.id, s.name]));

  const characters = data?.characters ?? [];
  const myAdventures = (data?.adventures ?? []) as AdventureSummary[];
  const joinedAdventures = (data?.joinedAdventures ?? []) as AdventureSummary[];

  const firstName = user?.displayName?.split(' ')[0] ?? 'Adventurer';

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError(null);
    setJoinLoading(true);
    try {
      await joinAdventure.mutateAsync({
        inviteCode: joinCode.trim().toUpperCase(),
      });
      setJoinCode('');
    } catch {
      setJoinError('Invalid invite code. Check the code and try again.');
    } finally {
      setJoinLoading(false);
    }
  }

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
      {!isLoading && (
        <div className={styles.statsBar}>
          <div className={styles.statPill}>
            <span>Characters</span>
            <span className={styles.statPillValue}>{characters.length}</span>
          </div>
          <div className={styles.statPill}>
            <span>Adventures</span>
            <span className={styles.statPillValue}>
              {myAdventures.length + joinedAdventures.length}
            </span>
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

        {isLoading && <Spinner size="lg" label="Loading…" />}

        {isError && (
          <EmptyState
            icon="⚠️"
            title="Failed to load"
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

      {/* ── My Adventures ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            My Adventures
            {myAdventures.length > 0 && (
              <span className={styles.sectionCount}>({myAdventures.length})</span>
            )}
          </h2>
          <Link to="/adventures/new">
            <Button variant="primary" size="sm">
              + New adventure
            </Button>
          </Link>
        </div>

        {!isLoading && myAdventures.length === 0 && (
          <EmptyState
            icon="🗺️"
            title="No adventures yet"
            description="Create your first adventure to start building your world."
            action={
              <Link to="/adventures/new">
                <Button variant="secondary">Create an adventure</Button>
              </Link>
            }
          />
        )}

        {myAdventures.length > 0 && (
          <div className={styles.adventureList}>
            {myAdventures.map((adv) => (
              <Link
                key={adv.id}
                to="/adventures/$id"
                params={{ id: adv.id }}
                className={styles.adventureCard}
              >
                <div className={styles.adventureTitle}>{adv.title}</div>
                <div className={styles.adventureMeta}>
                  <span className={styles.adventureTag}>
                    {adv.adventureType === 'one_shot' ? 'One-shot' : 'Campaign'}
                  </span>
                  <span className={styles.adventureTag}>{adv.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Joined Adventures ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Joined Adventures</h2>
        </div>

        {joinedAdventures.length > 0 && (
          <div className={styles.adventureList}>
            {joinedAdventures.map((adv) => (
              <div key={adv.id} className={styles.adventureCard}>
                <div className={styles.adventureTitle}>{adv.title}</div>
                <div className={styles.adventureMeta}>
                  <span className={styles.adventureTag}>{adv.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={(e) => void handleJoin(e)} className={styles.joinForm}>
          <input
            type="text"
            className={styles.joinInput}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter invite code…"
            maxLength={16}
          />
          <Button type="submit" variant="secondary" size="sm" isLoading={joinLoading}>
            Join
          </Button>
        </form>
        {joinError && <p className={styles.joinError}>{joinError}</p>}
      </section>
    </div>
  );
}
