import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GroupsAnimator } from '../components/tables/GroupsAnimator';
import { TablePicker } from '../components/tables/TablePicker';
import { TimesGrid } from '../components/tables/TimesGrid';
import { useProfile } from '../context/ProfileContext';
import {
  countMasteredTables,
  countSolidFacts,
  emptyTableProgress,
  ensureTableProgress,
  TOTAL_FACTS,
} from '../lib/tablesProgress';

type Mode = 'explore' | 'drill';

export function TablesHub() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialFocus = params.get('focus');
  const parsedFocus =
    initialFocus && !Number.isNaN(Number(initialFocus))
      ? Math.min(12, Math.max(1, Number(initialFocus)))
      : null;

  const [mode, setMode] = useState<Mode>(params.get('mode') === 'drill' ? 'drill' : 'explore');
  const [focus, setFocus] = useState<number | null>(parsedFocus);
  const [selected, setSelected] = useState<{ a: number; b: number } | null>(null);
  const [learnAnim, setLearnAnim] = useState(0);

  const tp = useMemo(
    () => (profile ? ensureTableProgress(profile) : emptyTableProgress()),
    [profile],
  );
  const solid = countSolidFacts(tp);
  const mastered = countMasteredTables(tp);

  if (!profile) return null;

  const startDrill = () => {
    const q = focus != null ? `?focus=${focus}` : '';
    navigate(`/tables/drill${q}`);
  };

  return (
    <div className="stack">
      <div>
        <h1>Times Table Trainer</h1>
        <p>
          Master base facts (1×1 through 12×12). Practice mode coaches you on misses — related
          facts, equal groups, and skip-counting — until the table sticks.
        </p>
      </div>

      <div className="chip-row">
        <span className="chip">
          {solid}/{TOTAL_FACTS} facts solid
        </span>
        <span className="chip">{mastered}/12 tables mastered</span>
      </div>

      <div className="row" style={{ gap: '0.5rem' }}>
        <button
          type="button"
          className={`chip-btn${mode === 'explore' ? ' selected' : ''}`}
          onClick={() => setMode('explore')}
        >
          Explore grid
        </button>
        <button
          type="button"
          className={`chip-btn${mode === 'drill' ? ' selected' : ''}`}
          onClick={() => setMode('drill')}
        >
          Practice
        </button>
      </div>

      {mode === 'explore' && (
        <>
          <div className="card stack">
            <div className="label">Highlight a table</div>
            <TablePicker
              value={focus}
              onChange={setFocus}
              masteredTables={tp.masteredTables}
              allowMixed
            />
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              Tap any cell to see the fact. Green = solid · Amber = learning · Red = needs practice.
            </p>
          </div>

          <div className="card" style={{ padding: '0.75rem' }}>
            <TimesGrid
              progress={tp}
              highlightFactor={focus}
              selected={selected}
              onSelect={(a, b) => setSelected({ a, b })}
            />
          </div>

          {selected && (
            <div className="card fact-pop stack">
              <div className="expression" style={{ margin: '0.5rem 0' }}>
                {selected.a} × {selected.b} = {selected.a * selected.b}
              </div>
              <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
                {Math.min(selected.a, selected.b)} groups of {Math.max(selected.a, selected.b)}
              </p>
              <GroupsAnimator
                groups={Math.min(selected.a, selected.b)}
                perGroup={Math.max(selected.a, selected.b)}
                animKey={`${selected.a}x${selected.b}-${learnAnim}`}
                autoPlay
                controls
              />
              <div className="footer-actions row-md">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLearnAnim((n) => n + 1)}
                >
                  Replay groups
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
                  Got it
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setFocus(selected.a);
                    navigate(`/tables/drill?focus=${selected.a}`);
                  }}
                >
                  Practice ×{selected.a}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'drill' && (
        <div className="card stack">
          <h2>Mastery practice</h2>
          <p>
            10 facts per round. Wrong answers get a coach tip (near-misses, related facts, equal
            groups). You retry the same fact — progress is never wiped.
          </p>
          <div className="label">Focus table</div>
          <TablePicker
            value={focus}
            onChange={setFocus}
            masteredTables={tp.masteredTables}
            allowMixed
          />
          {focus != null && (
            <div className="tt-preview">
              <strong>×{focus} table:</strong>{' '}
              {Array.from({ length: 12 }, (_, i) => (i + 1) * focus).join(', ')}
            </div>
          )}
          <button type="button" className="btn btn-accent btn-block" onClick={startDrill}>
            Start mastery practice
          </button>
        </div>
      )}

      <Link to="/home" className="btn btn-secondary btn-block">
        Back to home
      </Link>
    </div>
  );
}
