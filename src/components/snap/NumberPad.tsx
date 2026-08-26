import { useEffect, useState } from 'react';

interface Props {
  expected: number;
  disabled?: boolean;
  resetKey: string | number;
  onSubmit: (n: number) => void;
}

export function NumberPad({ expected, disabled, resetKey, onSubmit }: Props) {
  const [built, setBuilt] = useState('');

  useEffect(() => {
    setBuilt('');
  }, [resetKey]);

  const tapDigit = (d: number) => {
    if (disabled) return;
    if (expected < 10) {
      onSubmit(d);
      return;
    }
    if (built === '') {
      if (d === 1) {
        setBuilt('1');
        return;
      }
      onSubmit(d);
      return;
    }
    onSubmit(Number(built + String(d)));
    setBuilt('');
  };

  const backspace = () => {
    if (disabled) return;
    setBuilt('');
  };

  const confirm = () => {
    if (disabled || built === '') return;
    onSubmit(Number(built));
    setBuilt('');
  };

  const keys: Array<{ label: string; action: () => void; className?: string; aria?: string }> = [
    { label: '1', action: () => tapDigit(1) },
    { label: '2', action: () => tapDigit(2) },
    { label: '3', action: () => tapDigit(3) },
    { label: '4', action: () => tapDigit(4) },
    { label: '5', action: () => tapDigit(5) },
    { label: '6', action: () => tapDigit(6) },
    { label: '7', action: () => tapDigit(7) },
    { label: '8', action: () => tapDigit(8) },
    { label: '9', action: () => tapDigit(9) },
    { label: '⌫', action: backspace, className: 'snap-pad-fn', aria: 'Backspace' },
    { label: '0', action: () => tapDigit(0) },
    { label: '✓', action: confirm, className: 'snap-pad-ok', aria: 'Submit' },
  ];

  return (
    <div className="snap-pad-block">
      <div className="snap-built" aria-live="polite">
        {built || <span className="muted">tap a number</span>}
      </div>
      <div className="snap-pad" role="group" aria-label="Number pad">
        {keys.map((k) => (
          <button
            key={k.label}
            type="button"
            className={`snap-pad-key${k.className ? ` ${k.className}` : ''}`}
            onClick={k.action}
            disabled={disabled}
            aria-label={k.aria ?? k.label}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
