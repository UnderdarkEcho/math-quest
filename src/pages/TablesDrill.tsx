import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GroupsAnimator } from '../components/tables/GroupsAnimator';
import { useProfile } from '../context/ProfileContext';
import { parseUserAnswer } from '../lib/answers';
import { buildWrongHelp, type WrongHelp } from '../lib/tablesHints';
import {
  awardRoundBonus,
  ensureTableProgress,
  isTableMastered,
  pickDrillFacts,
  recordFactResult,
} from '../lib/tablesProgress';

const ROUND = 10;

function layoutGroups(a: number, b: number): { groups: number; perGroup: number } {
  // Prefer fewer groups for clearer animation (e.g. 3 groups of 8 over 8 of 3)
  if (a <= b) return { groups: a, perGroup: b };
  return { groups: b, perGroup: a };
}

export function TablesDrill() {
  const { profile, applyProfilePatch } = useProfile();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const focusParam = params.get('focus');
  const focus =
    focusParam && !Number.isNaN(Number(focusParam))
      ? Math.min(12, Math.max(1, Number(focusParam)))
      : null;

  const initialFacts = useMemo(() => {
    if (!profile) return [];
    return pickDrillFacts(ensureTableProgress(profile), focus, ROUND);
  }, [profile, focus]);

  const [facts] = useState(initialFacts);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [newlyMastered, setNewlyMastered] = useState<number[]>([]);
  const [attemptsOnFact, setAttemptsOnFact] = useState(0);
  const [help, setHelp] = useState<WrongHelp | null>(null);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  /** Show animated groups teach-through */
  const [teachGroups, setTeachGroups] = useState(false);
  const [animTick, setAnimTick] = useState(0);

  if (!profile) return null;

  const current = facts[index];
  const expected = current ? current.a * current.b : 0;
  const layout = current ? layoutGroups(current.a, current.b) : { groups: 0, perGroup: 0 };

  const resetFactUi = () => {
    setValue('');
    setFeedback('idle');
    setHelp(null);
    setLastWrong(null);
    setTeachGroups(false);
  };

  const goNext = (nextProfile: typeof profile, gained: number[], nextSolved: number) => {
    if (nextSolved >= ROUND || index + 1 >= facts.length) {
      applyProfilePatch(awardRoundBonus(nextProfile));
      setNewlyMastered(gained);
      setDone(true);
    } else {
      applyProfilePatch(nextProfile);
      setIndex((i) => i + 1);
      setAttemptsOnFact(0);
      resetFactUi();
    }
  };

  const openTeach = () => {
    setTeachGroups(true);
    setAnimTick((t) => t + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!current || feedback !== 'idle' || done) return;
    const n = parseUserAnswer(value);
    if (n === null) return;

    if (n === expected) {
      setFeedback('ok');
      setHelp(null);
      const before = ensureTableProgress(profile);
      const wasMastered = focus != null ? isTableMastered(before, focus) : false;
      let nextProfile = recordFactResult(profile, current.a, current.b, true);
      const after = ensureTableProgress(nextProfile);

      const gained: number[] = [];
      if (focus != null && !wasMastered && isTableMastered(after, focus)) {
        gained.push(focus);
      }
      for (const t of after.masteredTables) {
        if (!before.masteredTables.includes(t) && !gained.includes(t)) gained.push(t);
      }

      const nextSolved = solved + 1;
      setSolved(nextSolved);

      window.setTimeout(() => {
        goNext(nextProfile, gained, nextSolved);
      }, 450);
    } else {
      const attempt = attemptsOnFact + 1;
      setAttemptsOnFact(attempt);
      setMistakes((m) => m + 1);
      setLastWrong(n);
      const h = buildWrongHelp(current.a, current.b, n, attempt);
      setHelp(h);
      setFeedback('bad');
      // Auto-start group animation on 2nd miss (or 1st if product is small)
      if (attempt >= 2 || expected <= 36) {
        setTeachGroups(true);
        setAnimTick((t) => t + 1);
      }
      applyProfilePatch(recordFactResult(profile, current.a, current.b, false));
    }
  };

  const tryAgain = () => {
    setValue('');
    setFeedback('idle');
  };

  if (facts.length === 0) {
    return (
      <div className="card">
        <p>Could not build a practice round. Go back and try again.</p>
        <Link to="/tables" className="btn btn-primary">
          Back
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="hero-mascot" style={{ fontSize: '2.5rem' }} aria-hidden>
          ⭐
        </div>
        <h2>Practice complete!</h2>
        <p>
          You locked in {solved} facts
          {mistakes > 0 ? ` (${mistakes} coaching moment${mistakes === 1 ? '' : 's'})` : ' with no misses'}.
        </p>
        {newlyMastered.length > 0 && (
          <div className="feedback ok">
            Table mastered: {newlyMastered.map((n) => `×${n}`).join(', ')}!
          </div>
        )}
        <div className="footer-actions row-md">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/tables')}>
            Back to tables
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const path =
                focus != null ? `/tables/drill?focus=${focus}` : '/tables/drill';
              navigate('/tables');
              window.setTimeout(() => navigate(path), 0);
            }}
          >
            Practice again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row">
        <div>
          <p className="muted" style={{ margin: 0 }}>
            Mastery practice{focus != null ? ` · ×${focus} table` : ' · mixed facts'}
          </p>
          <h1 style={{ fontSize: '1.4rem' }}>
            Fact {index + 1} / {facts.length}
          </h1>
        </div>
        <Link to="/tables" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
          Exit
        </Link>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: '0.5rem' }}>
          <span className="chip">{solved} solved</span>
          {attemptsOnFact > 0 && (
            <span className="chip">
              Try {attemptsOnFact + (feedback === 'idle' ? 1 : 0)} on this fact
            </span>
          )}
        </div>
        <div className="progress-track" style={{ marginBottom: '1rem' }}>
          <div className="progress-fill" style={{ width: `${(solved / ROUND) * 100}%` }} />
        </div>

        <div className="expression" aria-live="polite">
          {current.a} × {current.b} ={' '}
          {feedback === 'ok' || (help?.revealAnswer && feedback === 'bad') ? expected : '?'}
        </div>

        <p className="muted" style={{ textAlign: 'center', marginTop: 0 }}>
          {layout.groups} groups of {layout.perGroup}
          {layout.groups !== current.a && (
            <> (same as {current.a} × {current.b})</>
          )}
        </p>

        {!teachGroups && feedback !== 'ok' && (
          <button type="button" className="btn btn-secondary btn-block" onClick={openTeach}>
            ▶ Watch equal groups
          </button>
        )}

        {teachGroups && (
          <GroupsAnimator
            groups={layout.groups}
            perGroup={layout.perGroup}
            animKey={`${index}-${animTick}`}
            autoPlay
            controls
          />
        )}

        {feedback === 'ok' && <div className="feedback ok">Correct — fact locked in!</div>}

        {feedback === 'bad' && help && (
          <div className="coach-panel" role="status">
            <div className="coach-title">{help.title}</div>
            {lastWrong !== null && (
              <p className="coach-line">
                You entered <strong>{lastWrong}</strong>
                {help.revealAnswer ? (
                  <>
                    {' '}
                    — the product is <strong>{expected}</strong>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            )}
            <p className="coach-body">{help.body}</p>
            {help.repeatedAdd && (
              <div className="coach-scaffold">
                <span className="coach-label">Add equal groups</span>
                <code>{help.repeatedAdd} = ?</code>
              </div>
            )}
            {help.relatedFact && (
              <div className="coach-scaffold">
                <span className="coach-label">Related fact</span>
                <span>{help.relatedFact}</span>
              </div>
            )}
            {!teachGroups && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ marginBottom: '0.5rem' }}
                onClick={openTeach}
              >
                ▶ Show me with groups
              </button>
            )}
            {help.revealAnswer && (
              <p className="coach-lock">
                Type <strong>{expected}</strong> below to lock this fact, then we continue.
              </p>
            )}
            <button type="button" className="btn btn-primary btn-block" onClick={tryAgain}>
              {help.revealAnswer ? `Type ${expected} to continue` : 'Try again'}
            </button>
          </div>
        )}

        {feedback === 'idle' && (
          <form onSubmit={submit} className="stack">
            {help && (
              <div className="coach-panel coach-panel-soft" role="note">
                <div className="coach-title">Coach tip</div>
                <p className="coach-body" style={{ marginBottom: help.revealAnswer ? '0.5rem' : 0 }}>
                  {help.revealAnswer
                    ? `${current.a} × ${current.b} = ${expected}. Enter that product.`
                    : help.body}
                </p>
                {teachGroups && (
                  <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    Watch the groups above count up to the total, then type your answer.
                  </p>
                )}
              </div>
            )}
            <label className="sr-only" htmlFor="table-answer">
              Answer
            </label>
            <input
              id="table-answer"
              className="input input-lg"
              inputMode="text"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder={help?.revealAnswer ? String(expected) : 'Your answer'}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
              Check
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
