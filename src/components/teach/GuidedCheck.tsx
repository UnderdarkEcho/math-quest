import { useState, type FormEvent } from 'react';
import { checkAnswer, computeAnswer } from '../../lib/answers';
import type { Operation } from '../../types';
import { ColumnEquation } from '../ColumnEquation';

interface Props {
  prompt: string;
  op: Operation;
  a: number;
  b: number;
  answer: number;
  hint?: string;
  onDone: () => void;
}

export function GuidedCheck({ prompt, op, a, b, hint, onDone }: Props) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'bad'>('idle');
  // Always grade from the digits on screen
  const expected = computeAnswer(op, a, b);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = checkAnswer(value, op, a, b);
    if (result.user === null) return;
    setStatus(result.ok ? 'ok' : 'bad');
  };

  return (
    <div>
      <h2>Try it</h2>
      <p style={{ color: 'var(--color-text)' }}>{prompt}</p>
      <ColumnEquation
        a={a}
        b={b}
        op={op}
        answer={status === 'idle' ? null : expected}
        showBlank={status === 'idle'}
      />

      {status === 'idle' && (
        <form onSubmit={submit} className="stack">
          <label className="sr-only" htmlFor="guided-answer">
            Your answer
          </label>
          <input
            id="guided-answer"
            className="input input-lg"
            inputMode="text"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
            Check
          </button>
          {hint && (
            <p className="muted" style={{ textAlign: 'center' }}>
              Hint: {hint}
            </p>
          )}
        </form>
      )}

      {status === 'ok' && (
        <>
          <div className="feedback ok">Correct! Nice work.</div>
          <button type="button" className="btn btn-primary btn-block" onClick={onDone}>
            Continue
          </button>
        </>
      )}

      {status === 'bad' && (
        <>
          <div className="feedback bad">
            Not quite. The answer is <strong>{expected}</strong>.
            {hint ? <div style={{ fontWeight: 600, marginTop: '0.35rem' }}>{hint}</div> : null}
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={onDone}>
            Continue
          </button>
        </>
      )}
    </div>
  );
}
