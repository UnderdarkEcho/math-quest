import { useMemo, useState } from 'react';
import type { Operation } from '../../types';
import {
  buildSolveScript,
  type MiniMath,
  type SolveBeat,
} from '../../lib/columnWalkthrough';
import { ColumnEquation } from '../ColumnEquation';
import { MiniMathCard } from '../solve/MiniMathCard';
import { SolveStage } from '../solve/SolveStage';

interface Props {
  story: string;
  op: Operation;
  a: number;
  b: number;
  answer: number;
  rule: string;
  onDone: () => void;
}

interface BeatView {
  partialAnswer: string | null;
  carries: Record<number, number>;
  highlightPlaces: number[];
  highlightRows: SolveBeat extends { highlightRows: infer R } ? R : never;
  borrowPlaces: number[];
  activePlace: number | null;
  showPlaceHeaders: boolean;
  popResultPlaces: number[];
  emphasizeCarryPlace: number | null;
  dimInactive: boolean;
  partialRows?: number[];
  mini: MiniMath | null;
  fullAnswer: number | null;
  factorDigit?: number;
  product?: number;
  shift?: number;
}

function displayFromBeat(beat: SolveBeat): BeatView {
  const base = {
    carries: 'carries' in beat ? beat.carries : {},
    borrowPlaces: 'borrowPlaces' in beat ? beat.borrowPlaces : [],
    highlightPlaces: 'highlightPlaces' in beat ? beat.highlightPlaces : [],
    highlightRows: 'highlightRows' in beat ? beat.highlightRows : [],
  };

  switch (beat.kind) {
    case 'setup':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: null,
        showPlaceHeaders: !!beat.showPlaceHeaders,
        popResultPlaces: [],
        emphasizeCarryPlace: null,
        dimInactive: false,
        mini: null,
        fullAnswer: null,
      };
    case 'place':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: beat.place,
        showPlaceHeaders: false,
        popResultPlaces: [beat.popResultPlace],
        emphasizeCarryPlace:
          beat.mini.carryOut !== undefined ? beat.place + 1 : null,
        dimInactive: true,
        mini: beat.mini,
        fullAnswer: null,
      };
    case 'partial_product':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: beat.shift,
        showPlaceHeaders: false,
        popResultPlaces: [],
        emphasizeCarryPlace: null,
        dimInactive: true,
        partialRows: beat.partialRows,
        mini: null,
        fullAnswer: null,
        factorDigit: beat.factorDigit,
        product: beat.product,
        shift: beat.shift,
      };
    case 'combine':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: null,
        showPlaceHeaders: false,
        popResultPlaces: [],
        emphasizeCarryPlace: null,
        dimInactive: false,
        partialRows: beat.partialRows,
        mini: null,
        fullAnswer: null,
      };
    case 'division_beat':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: null,
        showPlaceHeaders: false,
        popResultPlaces: [],
        emphasizeCarryPlace: null,
        dimInactive: false,
        mini: beat.mini ?? null,
        fullAnswer: null,
      };
    case 'finale':
      return {
        ...base,
        partialAnswer: beat.partialAnswer,
        activePlace: null,
        showPlaceHeaders: false,
        popResultPlaces: [],
        emphasizeCarryPlace: null,
        dimInactive: false,
        partialRows: beat.partialRows,
        mini: null,
        fullAnswer: beat.answer,
      };
  }
}

export function WorkedExample({ story, op, a, b, answer, rule, onDone }: Props) {
  const beats = useMemo(
    () => buildSolveScript(op, a, b, answer, rule),
    [op, a, b, answer, rule],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const beat = beats[stepIndex];
  const isLast = stepIndex >= beats.length - 1;
  const d = displayFromBeat(beat);

  let miniNode: React.ReactNode = null;
  if (d.mini) {
    miniNode = <MiniMathCard mini={d.mini} beatKey={stepIndex} />;
  } else if (beat.kind === 'partial_product') {
    miniNode = (
      <div className="mini-math">
        <div className="mini-math-row">
          <span className="mini-chip">{Math.abs(a)}</span>
          <span className="mini-op">×</span>
          <span className="mini-chip">{beat.factorDigit}</span>
        </div>
        <div className="mini-arrow" aria-hidden>
          ↓
        </div>
        <div className="mini-total">{beat.product}</div>
        <p className="mini-note">
          {beat.shift > 0
            ? `Shifted ${beat.shift} place${beat.shift > 1 ? 's' : ''} (×${10 ** beat.shift})`
            : 'First partial product'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>Worked example</h2>
      <p style={{ color: 'var(--color-text)' }}>{story}</p>

      <SolveStage
        beats={beats}
        stepIndex={stepIndex}
        partialRows={d.partialRows}
        equation={
          <ColumnEquation
            a={a}
            b={b}
            op={op}
            mode="solve"
            answer={d.fullAnswer}
            showBlank={d.partialAnswer == null && d.fullAnswer == null}
            partialAnswer={d.partialAnswer}
            highlightPlaces={d.highlightPlaces}
            highlightRows={d.highlightRows}
            carries={d.carries}
            borrowPlaces={d.borrowPlaces}
            activePlace={d.activePlace}
            dimInactive={d.dimInactive}
            popResultPlaces={d.popResultPlaces}
            emphasizeCarryPlace={d.emphasizeCarryPlace}
            showPlaceHeaders={d.showPlaceHeaders}
          />
        }
        mini={miniNode}
      >
        {isLast && beat.kind === 'finale' && (
          <div className="feedback ok solve-finale">
            Answer: <strong>{answer}</strong>
            <div style={{ fontWeight: 600, marginTop: '0.35rem' }}>{beat.rule}</div>
          </div>
        )}
      </SolveStage>

      {!isLast ? (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setStepIndex((i) => Math.min(beats.length - 1, i + 1))}
        >
          Next step
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={onDone}>
          Got it — continue
        </button>
      )}
    </div>
  );
}
