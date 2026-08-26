import { useEffect, useState } from 'react';

interface Props {
  /** Number of equal groups (usually the smaller factor for display) */
  groups: number;
  /** Items in each group */
  perGroup: number;
  /** Restart animation when this changes */
  animKey?: string | number;
  /** Auto-play group reveal */
  autoPlay?: boolean;
  /** ms between group reveals */
  stepMs?: number;
  /** Show step controls */
  controls?: boolean;
  /** Max total dots before we use a compact bar mode */
  maxDots?: number;
  onComplete?: () => void;
}

/**
 * Animated equal-groups lesson: groups appear one-by-one with a running total.
 * Teaches a × b as "a groups of b" (or swapped for layout).
 */
export function GroupsAnimator({
  groups,
  perGroup,
  animKey = 0,
  autoPlay = true,
  stepMs = 650,
  controls = true,
  maxDots = 60,
  onComplete,
}: Props) {
  const total = groups * perGroup;
  const compact = total > maxDots || groups > 12 || perGroup > 12;
  const [visible, setVisible] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);

  // Reset when fact changes
  useEffect(() => {
    setVisible(0);
    setPlaying(autoPlay);
  }, [animKey, groups, perGroup, autoPlay]);

  // Auto-advance
  useEffect(() => {
    if (!playing || visible >= groups) {
      if (visible >= groups && groups > 0) onComplete?.();
      return;
    }
    const t = window.setTimeout(() => {
      setVisible((v) => Math.min(groups, v + 1));
    }, stepMs);
    return () => window.clearTimeout(t);
  }, [playing, visible, groups, stepMs, onComplete]);

  const runningTotal = visible * perGroup;
  const done = visible >= groups;

  if (groups < 1 || perGroup < 1) return null;

  return (
    <div className="groups-anim" aria-live="polite">
      <div className="groups-anim-caption">
        {done ? (
          <>
            <strong>
              {groups} groups of {perGroup} = {total}
            </strong>
          </>
        ) : (
          <>
            Showing group <strong>{Math.min(visible + (playing ? 1 : 0), groups)}</strong> of{' '}
            <strong>{groups}</strong>
            {visible > 0 && (
              <>
                {' '}
                · so far <strong>{runningTotal}</strong>
              </>
            )}
          </>
        )}
      </div>

      {!compact ? (
        <div className="eq-groups eq-groups-anim">
          {Array.from({ length: groups }, (_, g) => {
            const shown = g < visible;
            return (
              <div
                key={g}
                className={`eq-group${shown ? ' eq-group-in' : ' eq-group-wait'}`}
                style={shown ? { animationDelay: '0ms' } : undefined}
              >
                <span className="eq-group-label">+{perGroup}</span>
                {Array.from({ length: perGroup }, (_, i) => (
                  <span
                    key={i}
                    className="eq-dot"
                    style={
                      shown
                        ? { animationDelay: `${40 + i * 35}ms` }
                        : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="groups-bars">
          {Array.from({ length: groups }, (_, g) => (
            <div
              key={g}
              className={`groups-bar${g < visible ? ' groups-bar-in' : ''}`}
              style={{ flex: perGroup }}
            >
              {g < visible ? `+${perGroup}` : ''}
            </div>
          ))}
        </div>
      )}

      <div className="groups-running">
        <div className="groups-running-track">
          <div
            className="groups-running-fill"
            style={{ width: `${groups ? (visible / groups) * 100 : 0}%` }}
          />
        </div>
        <div className="groups-running-total">
          Total: <strong>{runningTotal}</strong>
          {!done && visible > 0 && (
            <span className="muted">
              {' '}
              (next +{perGroup} → {runningTotal + perGroup})
            </span>
          )}
          {done && <span className="groups-check"> ✓</span>}
        </div>
      </div>

      {controls && (
        <div className="groups-controls">
          {!done && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.9rem', flex: 1 }}
                onClick={() => {
                  setPlaying(false);
                  setVisible((v) => Math.min(groups, v + 1));
                }}
              >
                Next group
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.9rem', flex: 1 }}
                onClick={() => setPlaying(true)}
                disabled={playing}
              >
                {playing ? 'Playing…' : 'Play all'}
              </button>
            </>
          )}
          {done && (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                setVisible(0);
                setPlaying(true);
              }}
            >
              Replay animation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
