import type { ServerToClientEvents } from '@ironquill/shared';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '../../../components/ui/Spinner/Spinner.js';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinSession,
  leaveSession,
} from '../../../lib/socket.js';
import { useAuthStore } from '../../../stores/auth.js';
import type { InitiativeEntry } from '../hooks/useSessions.js';
import { useSession, useSessionCombat } from '../hooks/useSessions.js';
import { InitiativeTracker } from '../InitiativeTracker/InitiativeTracker.js';
import styles from './PlayerSessionPage.module.css';

type Props = {
  sessionId: string;
  characterId: string;
};

export function PlayerSessionPage({ sessionId, characterId }: Props) {
  const { data: session, isLoading } = useSession(sessionId);
  const { data: combat } = useSessionCombat(sessionId);
  const user = useAuthStore((s) => s.user);

  const [narrative, setNarrative] = useState<string | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [round, setRound] = useState(1);
  const [rollType, setRollType] = useState('');
  const [rollResult, setRollResult] = useState('');
  const joined = useRef(false);

  useEffect(() => {
    if (!session) return;
    setCurrentSceneId(session.currentSceneId);
  }, [session]);

  useEffect(() => {
    if (!combat) return;
    setInitiative(combat.initiativeOrder);
    setRound(combat.round);
  }, [combat]);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    if (!joined.current && characterId) {
      joinSession(sessionId, characterId);
      joined.current = true;
    }

    const onNarrative: ServerToClientEvents['narrative:share'] = ({ text }) => {
      setNarrative(text);
    };

    const onSceneChange: ServerToClientEvents['scene:change'] = ({ sceneId }) => {
      setCurrentSceneId(sceneId);
    };

    const onInitiative: ServerToClientEvents['initiative:update'] = ({ entries }) => {
      setInitiative(
        entries.map((e, i) => ({
          id: `entry-${i}`,
          label: e.characterId ?? e.npcId ?? `Combatant ${i + 1}`,
          initiative: e.value,
          characterId: e.characterId,
          npcId: e.npcId,
          isCurrent: e.isCurrent,
        })),
      );
    };

    const onTurnAdvance: ServerToClientEvents['turn:advance'] = ({ round: r }) => {
      setRound(r);
    };

    socket.on('narrative:share', onNarrative);
    socket.on('scene:change', onSceneChange);
    socket.on('initiative:update', onInitiative);
    socket.on('turn:advance', onTurnAdvance);

    return () => {
      socket.off('narrative:share', onNarrative);
      socket.off('scene:change', onSceneChange);
      socket.off('initiative:update', onInitiative);
      socket.off('turn:advance', onTurnAdvance);
      if (joined.current) {
        leaveSession(sessionId);
        joined.current = false;
      }
      disconnectSocket();
    };
  }, [sessionId, characterId]);

  function sendRoll() {
    const result = Number.parseInt(rollResult, 10);
    if (!rollType.trim() || Number.isNaN(result)) return;
    getSocket().emit('roll:log', {
      characterId,
      rollType: rollType.trim(),
      result,
    });
    setRollType('');
    setRollResult('');
  }

  if (isLoading || !session) return <Spinner />;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>
          {user?.displayName ? `${user.displayName}'s View` : 'Player View'}
        </h1>
        <span className={styles.status} data-status={session.status}>
          {session.status.toUpperCase()}
        </span>
      </div>

      {/* Narrative Banner */}
      {narrative && (
        <div className={styles.narrative}>
          <p className={styles.narrativeText}>{narrative}</p>
          <button type="button" className={styles.dismissBtn} onClick={() => setNarrative(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {/* Left: Initiative */}
        <div className={styles.left}>
          {initiative.length > 0 ? (
            <InitiativeTracker entries={initiative} round={round} isDm={false} />
          ) : (
            <div className={styles.noInitiative}>
              <p className={styles.muted}>No combat active.</p>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className={styles.right}>
          {/* Roll log submission */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Log a Roll</h2>
            <div className={styles.rollForm}>
              <input
                id="rollType"
                className={styles.input}
                placeholder="Roll type (e.g. Attack, Perception)"
                value={rollType}
                onChange={(e) => setRollType(e.target.value)}
              />
              <input
                id="rollResult"
                className={styles.input}
                type="number"
                placeholder="Result"
                value={rollResult}
                onChange={(e) => setRollResult(e.target.value)}
                min={1}
                max={100}
              />
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={sendRoll}
                disabled={!rollType.trim() || !rollResult}
              >
                Send to DM
              </button>
            </div>
          </section>

          {currentSceneId && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Current Scene</h2>
              <p className={styles.sceneId}>Scene ID: {currentSceneId}</p>
            </section>
          )}
        </div>
      </div>

      <div className={styles.backLink}>
        <Link to="/sessions/$id/dm" params={{ id: sessionId }}>
          ← Back to session list
        </Link>
      </div>
    </div>
  );
}
