import { useState, type FormEvent } from 'react';
import { checkPromptAnswer } from '../../lib/promptAnswers';

interface Props {
  prompt: string;
  expected: string;
  hint?: string;
  onDone: () => void;
}

export function GuidedPrompt({ prompt, expected, hint, onDone }: Props) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'bad'>('idle');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const ok = checkPromptAnswer(value, expected);
    setStatus(ok ? 'ok' : 'bad');
  };

  return (
    <div>
      <h2>Try it</h2>
      <p className="expression" style={{ fontSize: '1.6rem' }}>
        {prompt}
      </p>
      {hint && status !== 'ok' && (
        <div className="coach-panel coach-panel-soft" role="note">
          <div className="coach-title">Coach</div>
          <p className="coach-body" style={{ marginBottom: 0 }}>
            {hint}
          </p>
        </div>
      )}
      {status === 'ok' && <div className="feedback ok">Correct — {expected}</div>}
      {status === 'bad' && (
        <div className="feedback bad">Not quite — read the coach tip and try again.</div>
      )}
      {status !== 'ok' && (
        <form onSubmit={submit} className="stack">
          <input
            className="input input-lg"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
            Check
          </button>
        </form>
      )}
      {status === 'ok' && (
        <button type="button" className="btn btn-primary btn-block" onClick={onDone}>
          Continue
        </button>
      )}
    </div>
  );
}
