import type { ServerToClientEvents } from '@ironquill/shared';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import { connectSocket, disconnectSocket, getSocket, joinSession } from '../../../lib/socket.js';
import { useScenes } from '../../adventure/hooks/useAdventures.js';
import type { InitiativeEntry } from '../hooks/useSessions.js';
import {
  useAdvanceTurn,
  useEndCombat,
  useEndSession,
  usePauseSession,
  useSession,
  useSessionCombat,
  useSetScene,
  useStartCombat,
  useStartSession,
} from '../hooks/useSessions.js';
import { InitiativeTracker } from '../InitiativeTracker/InitiativeTracker.js';
import styles from './DmSessionPage.module.css';

type Props = { sessionId: string };

type PlayerPresence = {
  userId: string;
  characterId: string;
  displayName: string;
};

type RollLogEntry = {
  userId: string;
  displayName: string;
  characterId: string;
  rollType: string;
  result: number;
};

export function DmSessionPage({ sessionId }: Props) {
  const { data: session, isLoading } = useSession(sessionId);
  const { data: combat } = useSessionCombat(sessionId);

  const startSession = useStartSession(sessionId);
  const pauseSession = usePauseSession(sessionId);
  const endSession = useEndSession(sessionId);
  const setScene = useSetScene(sessionId);
  const startCombat = useStartCombat(sessionId);
  const advanceTurn = useAdvanceTurn(sessionId);
  const endCombat = useEndCombat(sessionId);

  const { data: scenes } = useScenes(session?.adventureId ?? '');

  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [rollLog] = useState<RollLogEntry[]>([]);
  const [endSummary, setEndSummary] = useState('');
  const [showEndForm, setShowEndForm] = useState(false);
  const [initiativeInput, setInitiativeInput] = useState('');
  const [showInitiativeForm, setShowInitiativeForm] = useState(false);
  const joined = useRef(false);

  // Narrative textarea ref for broadcast
  const [narrative, setNarrative] = useState('');

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    if (!joined.current) {
      joinSession(sessionId, '');
      joined.current = true;
    }

    const onPlayerJoined: ServerToClientEvents['player:joined'] = (data) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.userId === data.userId)) return prev;
        return [...prev, data];
      });
    };

    const onPlayerLeft: ServerToClientEvents['player:left'] = ({ userId }) => {
      setPlayers((prev) => prev.filter((p) => p.userId !== userId));
    };

    socket.on('player:joined', onPlayerJoined);
    socket.on('player:left', onPlayerLeft);

    return () => {
      socket.off('player:joined', onPlayerJoined);
      socket.off('player:left', onPlayerLeft);
      if (joined.current) {
        disconnectSocket();
        joined.current = false;
      }
    };
  }, [sessionId]);

  if (isLoading || !session) return <Spinner />;

  function parseInitiativeInput(): InitiativeEntry[] {
    return initiativeInput
      .split('\n')
      .map((line, i) => {
        const parts = line.split(',');
        const label = parts[0]?.trim() ?? `Combatant ${i + 1}`;
        const initiative = Number.parseInt(parts[1]?.trim() ?? '0', 10);
        return {
          id: `init-${i}`,
          label,
          initiative: Number.isNaN(initiative) ? 0 : initiative,
          characterId: null,
          npcId: null,
          isCurrent: i === 0,
        };
      })
      .sort((a, b) => b.initiative - a.initiative)
      .map((e, i) => ({ ...e, isCurrent: i === 0 }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>DM View</h1>
        <div className={styles.statusBadge} data-status={session.status}>
          {session.status.toUpperCase()}
        </div>
      </div>

      {/* Session Controls */}
      <div className={styles.controls}>
        {session.status === 'lobby' && (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
          >
            Start Session
          </button>
        )}
        {session.status === 'active' && (
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => pauseSession.mutate()}
            disabled={pauseSession.isPending}
          >
            Pause
          </button>
        )}
        {session.status === 'paused' && (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
          >
            Resume
          </button>
        )}
        {(session.status === 'active' || session.status === 'paused') && (
          <button type="button" className={styles.dangerBtn} onClick={() => setShowEndForm(true)}>
            End Session
          </button>
        )}
      </div>

      {showEndForm && (
        <div className={styles.endForm}>
          <label htmlFor="endSummary" className={styles.label}>
            Session summary (optional)
          </label>
          <textarea
            id="endSummary"
            className={styles.textarea}
            rows={3}
            value={endSummary}
            onChange={(e) => setEndSummary(e.target.value)}
            placeholder="What happened this session?"
          />
          <div className={styles.endFormActions}>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => {
                endSession.mutate(endSummary);
                setShowEndForm(false);
              }}
              disabled={endSession.isPending}
            >
              Confirm End
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowEndForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.left}>
          {/* Scene Selector */}
          {scenes && scenes.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Scene</h2>
              <select
                className={styles.select}
                value={session.currentSceneId ?? ''}
                onChange={(e) => {
                  if (e.target.value) setScene.mutate(e.target.value);
                }}
              >
                <option value="">— select scene —</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Narrative Broadcast */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Narrative</h2>
            <textarea
              id="narrative"
              className={styles.textarea}
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Read-aloud text for players…"
            />
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                getSocket().emit('session:join', {
                  sessionId,
                  characterId: '',
                });
              }}
            >
              Share Narrative
            </button>
          </section>

          {/* Player Roster */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Players ({players.length})</h2>
            {players.length === 0 ? (
              <p className={styles.muted}>Waiting for players to join…</p>
            ) : (
              <ul className={styles.playerList}>
                {players.map((p) => (
                  <li key={p.userId} className={styles.playerItem}>
                    {p.displayName}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className={styles.right}>
          {/* Combat / Initiative */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Combat</h2>
              {!combat?.isActive && (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowInitiativeForm((v) => !v)}
                >
                  {showInitiativeForm ? 'Cancel' : 'Start Combat'}
                </button>
              )}
            </div>

            {showInitiativeForm && (
              <div className={styles.initiativeForm}>
                <label htmlFor="initiativeInput" className={styles.label}>
                  Enter combatants (Name, initiative — one per line)
                </label>
                <textarea
                  id="initiativeInput"
                  className={styles.textarea}
                  rows={5}
                  value={initiativeInput}
                  onChange={(e) => setInitiativeInput(e.target.value)}
                  placeholder={`Gandalf, 18\nSauron, 15\nOrc A, 8`}
                />
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => {
                    const entries = parseInitiativeInput();
                    startCombat.mutate(entries);
                    setShowInitiativeForm(false);
                    setInitiativeInput('');
                  }}
                  disabled={startCombat.isPending || !initiativeInput.trim()}
                >
                  Begin
                </button>
              </div>
            )}

            {combat?.isActive ? (
              <InitiativeTracker
                entries={combat.initiativeOrder}
                round={combat.round}
                isDm={true}
                onAdvance={() => advanceTurn.mutate()}
                onEndCombat={() => endCombat.mutate()}
              />
            ) : (
              !showInitiativeForm && <p className={styles.muted}>No active combat.</p>
            )}
          </section>

          {/* Roll Log */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Roll Log</h2>
            {rollLog.length === 0 ? (
              <p className={styles.muted}>No rolls yet.</p>
            ) : (
              <ul className={styles.rollList}>
                {rollLog.map((r, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: append-only log
                  <li key={i} className={styles.rollItem}>
                    <span className={styles.rollName}>{r.displayName ?? r.userId}</span>
                    <span className={styles.rollType}>{r.rollType}</span>
                    <span className={styles.rollResult}>{r.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className={styles.backLink}>
        <Link to="/adventures/$id/sessions" params={{ id: session.adventureId }}>
          ← Session list
        </Link>
      </div>
    </div>
  );
}
