import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddGrid } from '../components/snap/AddGrid';
import { useProfile } from '../context/ProfileContext';
import { SNAP_LANES } from '../lib/snapFacts';
import type { SnapLaneId } from '../types';
import {
  countMasteredLanes,
  countSolidSnapFacts,
  emptySnapProgress,
  ensureSnapProgress,
  formatRoundMs,
  isLaneMastered,
  recommendedLane,
  TOTAL_SNAP_FACTS,
} from '../lib/snapProgress';

export function SnapHub() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const sp = useMemo(
    () => (profile ? ensureSnapProgress(profile) : emptySnapProgress()),
    [profile],
  );
  const rec = recommendedLane(sp);
  const [lane, setLane] = useState<SnapLaneId>(rec);

  if (!profile) return null;

  const solid = countSolidSnapFacts(sp);
  const mastered = countMasteredLanes(sp);
  const best = sp.bestRoundMs[lane];

  return (
    <div className="stack">
      <div>
        <h1>Snap Facts</h1>
        <p>See it, tap it. Partners of 10, doubles, then mixed + and −.</p>
      </div>

      <div className="chip-row">
        <span className="chip">
          {solid}/{TOTAL_SNAP_FACTS} facts solid
        </span>
        <span className="chip">{mastered}/6 lanes mastered</span>
        {best != null && <span className="chip">Best {formatRoundMs(best)}</span>}
      </div>

      <div className="card stack">
        <div className="label">Lane</div>
        <div className="chip-row">
          {SNAP_LANES.map((l) => {
            const done = isLaneMastered(sp, l.id);
            const recThis = l.id === rec;
            return (
              <button
                key={l.id}
                type="button"
                className={`chip-btn${lane === l.id ? ' selected' : ''}`}
                onClick={() => setLane(l.id)}
              >
                {l.label}
                {done ? ' ✓' : recThis ? ' · next' : ''}
              </button>
            );
          })}
        </div>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          12 facts per round. Stars from your speed — slow never fails. Misses get a
          ten-frame coach, then you retry.
        </p>
        <button
          type="button"
          className="btn btn-accent btn-block"
          onClick={() => navigate(`/snap/play?lane=${lane}`)}
        >
          Play Snap
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem' }}>
        <div className="label" style={{ padding: '0.25rem 0.25rem 0.5rem' }}>
          Addition heatmap
        </div>
        <AddGrid progress={sp} />
        <p className="muted" style={{ margin: '0.65rem 0.25rem 0.25rem', fontSize: '0.85rem' }}>
          Green = solid · Amber = learning · Red = needs practice
        </p>
      </div>

      <Link to="/home" className="btn btn-secondary btn-block">
        Back to home
      </Link>
    </div>
  );
}
