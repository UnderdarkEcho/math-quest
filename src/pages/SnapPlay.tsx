import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NumberPad } from '../components/snap/NumberPad';
import { TenFrame } from '../components/snap/TenFrame';
import { useProfile } from '../context/ProfileContext';
import { buildSnapHelp, type SnapHelp } from '../lib/snapHints';
import {
  laneLabel,
  parseLane,
  pickSnapFacts,
  SNAP_ROUND,
  snapExpression,
} from '../lib/snapFacts';
import type { SnapLaneId } from '../types';
import {
  ensureSnapProgress,
  finishSnapRound,
  formatRoundMs,
  recordSnapResult,
  starsForSolve,
} from '../lib/snapProgress';

function StarRow({ n }: { n: number }) {
  return (
    <span className="snap-stars" aria-label={`${n} star${n === 1 ? '' : 's'}`}>
      {'★'.repeat(n)}
      {'☆'.repeat(Math.max(0, 3 - n))}
    </span>
  );
}

export function SnapPlay() {
  const { profile, applyProfilePatch } = useProfile();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lane = parseLane(params.get('lane'));
  const [roundNonce, setRoundNonce] = useState(0);

  const facts = useMemo(() => {
    if (!profile) return [];
    return pickSnapFacts(ensureSnapProgress(profile), lane, SNAP_ROUND);
    // Re-pick only when the round or lane changes, not on every XP patch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lane, roundNonce]);

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [attemptsOnFact, setAttemptsOnFact] = useState(0);
  const [help, setHelp] = useState<SnapHelp | null>(null);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [starTotal, setStarTotal] = useState(0);
  const [lastStars, setLastStars] = useState<1 | 2 | 3 | 0>(0);
  const [newlyMastered, setNewlyMastered] = useState<string[]>([]);
  const [newBest, setNewBest] = useState(false);
  const [roundMs, setRoundMs] = useState(0);
  const [padKey, setPadKey] = useState(0);

  const factStartedAt = useRef(Date.now());
  const roundStartedAt = useRef(Date.now());

  useEffect(() => {
    factStartedAt.current = Date.now();
  }, [index, roundNonce]);

  if (!profile) return null;

  const current = facts[index];

  const resetFactUi = () => {
    setFeedback('idle');
    setHelp(null);
    setLastWrong(null);
    setLastStars(0);
    setPadKey((k) => k + 1);
  };

  const goNext = (
    nextProfile: typeof profile,
    gained: string[],
    nextSolved: number,
  ) => {
    if (nextSolved >= SNAP_ROUND || index + 1 >= facts.length) {
      const elapsed = Date.now() - roundStartedAt.current;
      const finished = finishSnapRound(nextProfile, lane, elapsed);
      applyProfilePatch(finished.profile);
      setNewlyMastered(gained);
      setNewBest(finished.newBest);
      setRoundMs(elapsed);
      setDone(true);
    } else {
      applyProfilePatch(nextProfile);
      setIndex((i) => i + 1);
      setAttemptsOnFact(0);
      resetFactUi();
    }
  };

  const submit = (n: number) => {
    if (!current || feedback !== 'idle' || done) return;

    if (n === current.answer) {
      const firstTry = attemptsOnFact === 0;
      const ms = Date.now() - factStartedAt.current;
      const stars = starsForSolve(ms, firstTry);
      setLastStars(stars);
      setFeedback('ok');
      setHelp(null);

      const before = ensureSnapProgress(profile);
      const nextProfile = recordSnapResult(profile, current, true, { firstTry, ms });
      const after = ensureSnapProgress(nextProfile);
      const gained = after.masteredLanes.filter((id) => !before.masteredLanes.includes(id));
      if (gained.length) setNewlyMastered((prev) => [...prev, ...gained]);

      const nextSolved = solved + 1;
      const nextStars = starTotal + stars;
      setSolved(nextSolved);
      setStarTotal(nextStars);

      window.setTimeout(() => {
        goNext(nextProfile, [...newlyMastered, ...gained], nextSolved);
      }, 450);
    } else {
      const attempt = attemptsOnFact + 1;
      setAttemptsOnFact(attempt);
      setMistakes((m) => m + 1);
      setLastWrong(n);
      setHelp(buildSnapHelp(current, attempt, n));
      setFeedback('bad');
      applyProfilePatch(recordSnapResult(profile, current, false));
    }
  };

  const tryAgain = () => {
    setFeedback('idle');
    setLastWrong(null);
    setPadKey((k) => k + 1);
  };

  const playAgain = () => {
    roundStartedAt.current = Date.now();
    setRoundNonce((n) => n + 1);
    setIndex(0);
    setFeedback('idle');
    setSolved(0);
    setMistakes(0);
    setDone(false);
    setAttemptsOnFact(0);
    setHelp(null);
    setLastWrong(null);
    setStarTotal(0);
    setLastStars(0);
    setNewlyMastered([]);
    setNewBest(false);
    setRoundMs(0);
    setPadKey((k) => k + 1);
  };

  if (facts.length === 0) {
    return (
      <div className="card">
        <p>Could not build a Snap round. Go back and try again.</p>
        <Link to="/snap" className="btn btn-primary">
          Back
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="hero-mascot" style={{ fontSize: '2.5rem' }} aria-hidden>
          ★
        </div>
        <h2>Snap complete!</h2>
        <p>
          <StarRow n={Math.max(1, Math.round(starTotal / SNAP_ROUND)) as 1 | 2 | 3} />{' '}
          {starTotal}/{SNAP_ROUND * 3} stars
          {mistakes > 0
            ? ` · ${mistakes} coaching moment${mistakes === 1 ? '' : 's'}`
            : ' · no misses'}
        </p>
        <p className="muted">
          Round time {formatRoundMs(roundMs)}
          {newBest ? ' · new personal best!' : ''}
        </p>
        {newlyMastered.length > 0 && (
          <div className="feedback ok">
            Lane mastered: {newlyMastered.map((id) => laneLabel(id as SnapLaneId)).join(', ')}
            !
          </div>
        )}
        <div className="footer-actions row-md">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/snap')}>
            Change lane
          </button>
          <button type="button" className="btn btn-secondary" onClick={playAgain}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  const showVisual = help && (help.showBond || help.showMake10) && feedback !== 'ok';

  return (
    <div className="stack">
      <div className="row">
        <div>
          <p className="muted" style={{ margin: 0 }}>
            Snap · {laneLabel(lane)}
          </p>
          <h1 style={{ fontSize: '1.4rem' }}>
            Fact {index + 1} / {facts.length}
          </h1>
        </div>
        <Link to="/snap" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
          Exit
        </Link>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: '0.5rem' }}>
          <span className="chip">{solved} solved</span>
          <span className="chip">{starTotal} stars</span>
        </div>
        <div className="progress-track" style={{ marginBottom: '1rem' }}>
          <div className="progress-fill" style={{ width: `${(solved / SNAP_ROUND) * 100}%` }} />
        </div>

        <div className="expression" aria-live="polite">
          {snapExpression(current)} ={' '}
          {feedback === 'ok' || (help?.revealAnswer && feedback === 'bad')
            ? current.answer
            : '?'}
        </div>
        {feedback === 'ok' && lastStars > 0 && (
          <div className="snap-star-flash">
            <StarRow n={lastStars} />
          </div>
        )}

        {feedback === 'ok' && <div className="feedback ok">Got it!</div>}

        {feedback === 'bad' && help && (
          <div className="coach-panel" role="status">
            <div className="coach-title">{help.title}</div>
            {lastWrong !== null && (
              <p className="coach-line">
                You entered <strong>{lastWrong}</strong>
                {help.revealAnswer ? (
                  <>
                    {' '}
                    — the answer is <strong>{current.answer}</strong>.
                  </>
                ) : (
                  '.'
                )}
              </p>
            )}
            <p className="coach-body">{help.body}</p>
            {help.scaffold && (
              <div className="coach-scaffold">
                <span className="coach-label">Try this</span>
                <code>{help.scaffold}</code>
              </div>
            )}
            {showVisual && help.showMake10 && (
              <TenFrame filled={10} leftover={help.showMake10.leftover} />
            )}
            {showVisual && help.showBond && (
              <TenFrame filled={help.showBond.filled} ghost={help.showBond.ghost} />
            )}
            {help.revealAnswer && (
              <p className="coach-lock">
                Tap <strong>{current.answer}</strong> to lock this fact, then we continue.
              </p>
            )}
            <button type="button" className="btn btn-primary btn-block" onClick={tryAgain}>
              {help.revealAnswer ? `Tap ${current.answer} to continue` : 'Try again'}
            </button>
          </div>
        )}

        {feedback === 'idle' && (
          <>
            {help && (
              <div className="coach-panel coach-panel-soft" role="note">
                <div className="coach-title">Coach tip</div>
                <p className="coach-body" style={{ marginBottom: 0 }}>
                  {help.revealAnswer
                    ? `${snapExpression(current)} = ${current.answer}. Tap that number.`
                    : help.body}
                </p>
              </div>
            )}
            <NumberPad
              expected={current.answer}
              resetKey={`${roundNonce}-${index}-${padKey}`}
              onSubmit={submit}
            />
          </>
        )}
      </div>
    </div>
  );
}
