import type { ReactNode } from 'react';
import type { SolveBeat } from '../../lib/columnWalkthrough';

interface Props {
  beats: SolveBeat[];
  stepIndex: number;
  equation: ReactNode;
  mini: ReactNode;
  partialRows?: number[];
  children?: ReactNode;
}

function beatTitle(beat: SolveBeat): string {
  switch (beat.kind) {
    case 'setup':
      return beat.title;
    case 'place':
      return beat.placeLabel;
    case 'partial_product':
      return `Partial product ${beat.index + 1}`;
    case 'combine':
      return beat.title;
    case 'division_beat':
      return beat.title;
    case 'finale':
      return beat.title;
  }
}

function beatBody(beat: SolveBeat): string {
  switch (beat.kind) {
    case 'setup':
      return beat.body;
    case 'place':
      return beat.caption;
    case 'partial_product':
      return beat.caption;
    case 'combine':
      return beat.caption;
    case 'division_beat':
      return beat.caption;
    case 'finale':
      return beat.caption;
  }
}

export function SolveStage({ beats, stepIndex, equation, mini, partialRows, children }: Props) {
  const beat = beats[stepIndex];
  const placeLabel = beat.kind === 'place' ? beat.placeLabel : null;

  return (
    <div className="solve-stage">
      <div className="solve-progress" aria-hidden>
        {beats.map((_, i) => (
          <span
            key={i}
            className={`solve-dot${i === stepIndex ? ' on' : ''}${i < stepIndex ? ' done' : ''}`}
          />
        ))}
      </div>

      <div className="solve-heading">
        <p className="solve-step-meta">
          Step {stepIndex + 1} of {beats.length}
        </p>
        <h3 className="solve-title">{beatTitle(beat)}</h3>
        <p className="solve-body">{beatBody(beat)}</p>
      </div>

      {placeLabel && (
        <div className="place-pill" aria-live="polite">
          {placeLabel}
        </div>
      )}

      <div className="solve-equation-wrap">{equation}</div>

      {partialRows && partialRows.length > 0 && (
        <div className="partial-rows" aria-label="Partial products">
          {partialRows.map((row, i) => (
            <div key={`${row}-${i}`} className="partial-row">
              <span className="partial-label">× digit {i + 1}</span>
              <span className="partial-value">{row}</span>
            </div>
          ))}
        </div>
      )}

      {mini}

      {children}
    </div>
  );
}
