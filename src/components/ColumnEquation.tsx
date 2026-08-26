import type { Operation } from '../types';
import { OP_SYMBOLS } from '../types';
import type { HighlightRow } from '../lib/columnWalkthrough';

const OP_WORDS: Record<Operation, string> = {
  addition: 'plus',
  subtraction: 'minus',
  multiplication: 'times',
  division: 'divided by',
};

const PLACE_SHORT = ['O', 'T', 'H', 'Th', 'Tth', 'Hth'];

interface Props {
  a: number;
  b: number;
  op: Operation;
  answer?: number | null;
  showBlank?: boolean;
  size?: 'md' | 'lg';
  partialAnswer?: string | null;
  highlightPlaces?: number[];
  highlightRows?: HighlightRow[];
  carries?: Record<number, number>;
  borrowPlaces?: number[];
  /** Worked-example solve theater */
  mode?: 'static' | 'solve';
  activePlace?: number | null;
  dimInactive?: boolean;
  popResultPlaces?: number[];
  emphasizeCarryPlace?: number | null;
  showPlaceHeaders?: boolean;
}

function toDigits(n: number): string[] {
  return String(Math.abs(n)).split('');
}

function padLeft(digits: string[], width: number): (string | null)[] {
  const pad = width - digits.length;
  return [...Array(Math.max(0, pad)).fill(null), ...digits];
}

function resultSlots(
  width: number,
  fullAnswer: number | null | undefined,
  partialAnswer: string | null | undefined,
  showBlank: boolean,
): (string | null)[] {
  if (partialAnswer !== undefined && partialAnswer !== null) {
    const d = partialAnswer.replace(/^-/, '').split('');
    return padLeft(d, width);
  }
  if (fullAnswer !== null && fullAnswer !== undefined) {
    return padLeft(toDigits(fullAnswer), width);
  }
  if (showBlank) {
    return Array.from({ length: width }, (_, i) => (i === width - 1 ? '?' : null));
  }
  return Array(width).fill(null);
}

function placeFromRight(colIndex: number, width: number): number {
  return width - 1 - colIndex;
}

export function ColumnEquation({
  a,
  b,
  op,
  answer = null,
  showBlank = true,
  size = 'lg',
  partialAnswer,
  highlightPlaces = [],
  highlightRows = [],
  carries = {},
  borrowPlaces = [],
  mode = 'static',
  activePlace = null,
  dimInactive = false,
  popResultPlaces = [],
  emphasizeCarryPlace = null,
  showPlaceHeaders = false,
}: Props) {
  const label = `${a} ${OP_WORDS[op]} ${b}${
    answer !== null && answer !== undefined ? ` equals ${answer}` : ''
  }`;

  const displayAnswer =
    partialAnswer !== undefined && partialAnswer !== null
      ? Number(partialAnswer)
      : answer;

  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const ansAbs =
    displayAnswer !== null && displayAnswer !== undefined && !Number.isNaN(displayAnswer)
      ? Math.abs(displayAnswer)
      : answer !== null && answer !== undefined
        ? Math.abs(answer)
        : 0;

  const width = Math.max(
    toDigits(absA).length,
    toDigits(absB).length,
    toDigits(ansAbs).length || 1,
    1,
    ...Object.keys(carries).map((k) => Number(k) + 1),
  );

  const aSlots = padLeft(toDigits(absA), width);
  const bSlots = padLeft(toDigits(absB), width);
  const rSlots = resultSlots(width, answer, partialAnswer, showBlank);

  const hlPlace = new Set(highlightPlaces);
  const hlRow = new Set(highlightRows);
  const popSet = new Set(popResultPlaces);
  const solve = mode === 'solve';

  const isHl = (row: HighlightRow, place: number) => {
    if (solve && activePlace !== null && activePlace !== undefined) {
      return place === activePlace && (hlRow.size === 0 || hlRow.has(row) || row === 'result');
    }
    return hlPlace.has(place) && (hlRow.size === 0 || hlRow.has(row));
  };

  const isDim = (place: number) => {
    if (!solve || !dimInactive) return false;
    if (activePlace === null || activePlace === undefined) return false;
    return place !== activePlace;
  };

  if (op === 'division') {
    const qSlots = resultSlots(
      Math.max(toDigits(ansAbs).length, 1),
      answer,
      partialAnswer,
      showBlank,
    );
    const divDigits = toDigits(absA);
    return (
      <div
        className={`column-eq column-eq-div column-eq-${size}${solve ? ' solve-mode' : ''}`}
        role="img"
        aria-label={label}
      >
        <div className="div-house">
          <span className={`div-divisor${hlRow.has('b') ? ' digit-hl-wrap' : ''}`}>{b}</span>
          <div className="div-box">
            <div className="div-quotient digit-row">
              {qSlots.map((d, i) => {
                const place = qSlots.length - 1 - i;
                const hl = isHl('result', place) || (d !== null && hlRow.has('result'));
                return (
                  <span
                    key={i}
                    className={`digit${hl ? ' hl' : ''}${d === null ? ' empty' : ''}${popSet.has(place) ? ' pop' : ''}`}
                  >
                    {d ??
                      (showBlank &&
                      i === qSlots.length - 1 &&
                      partialAnswer == null &&
                      answer == null
                        ? '?'
                        : '')}
                  </span>
                );
              })}
            </div>
            <div className={`div-dividend digit-row${hlRow.has('a') ? ' row-hl' : ''}`}>
              {divDigits.map((d, i) => {
                const place = divDigits.length - 1 - i;
                return (
                  <span
                    key={i}
                    className={`digit${isHl('a', place) || hlRow.has('a') ? ' hl' : ''}`}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`column-eq column-eq-stack column-eq-${size}${solve ? ' solve-mode' : ''}`}
      role="img"
      aria-label={label}
    >
      {showPlaceHeaders && (
        <div className="digit-row place-headers">
          <span className="col-op-spacer" aria-hidden />
          {Array.from({ length: width }, (_, col) => {
            const place = placeFromRight(col, width);
            return (
              <span key={col} className="place-header">
                {PLACE_SHORT[place] ?? ''}
              </span>
            );
          })}
        </div>
      )}

      {/* Carry row */}
      <div className="digit-row carry-row">
        <span className="col-op-spacer" aria-hidden />
        {Array.from({ length: width }, (_, col) => {
          const place = placeFromRight(col, width);
          const c = carries[place];
          const hl =
            c !== undefined &&
            (isHl('carry', place) ||
              hlRow.has('carry') ||
              emphasizeCarryPlace === place);
          return (
            <span
              key={col}
              className={`digit carry${hl ? ' hl' : ''}${c === undefined ? ' empty' : ''}${emphasizeCarryPlace === place ? ' carry-flash' : ''}`}
            >
              {c !== undefined ? c : ''}
            </span>
          );
        })}
      </div>

      <div className="digit-row">
        <span className="col-op-spacer" aria-hidden>
          {a < 0 ? '−' : ''}
        </span>
        {aSlots.map((d, col) => {
          const place = placeFromRight(col, width);
          const borrow = borrowPlaces.includes(place);
          const active = solve && activePlace === place;
          return (
            <span
              key={col}
              className={`digit${d === null ? ' empty' : ''}${isHl('a', place) ? ' hl' : ''}${borrow ? ' borrow' : ''}${isDim(place) ? ' dim' : ''}${active ? ' place-active' : ''}`}
            >
              {d ?? ''}
            </span>
          );
        })}
      </div>

      <div className="digit-row">
        <span className="col-op" aria-hidden>
          {OP_SYMBOLS[op]}
        </span>
        {bSlots.map((d, col) => {
          const place = placeFromRight(col, width);
          const active = solve && activePlace === place;
          return (
            <span
              key={col}
              className={`digit${d === null ? ' empty' : ''}${isHl('b', place) ? ' hl' : ''}${isDim(place) ? ' dim' : ''}${active ? ' place-active' : ''}`}
            >
              {d ?? ''}
            </span>
          );
        })}
      </div>

      <div className="col-rule-grid" aria-hidden>
        <span className="col-op-spacer" />
        <span className="col-rule-fill" />
      </div>

      <div className="digit-row result-row">
        <span className="col-op-spacer" aria-hidden>
          {answer !== null && answer !== undefined && answer < 0 ? '−' : ''}
        </span>
        {rSlots.map((d, col) => {
          const place = placeFromRight(col, width);
          const active = solve && activePlace === place;
          return (
            <span
              key={col}
              className={`digit col-result-digit${d === null ? ' empty' : ''}${isHl('result', place) ? ' hl' : ''}${isDim(place) ? ' dim' : ''}${active ? ' place-active' : ''}${popSet.has(place) ? ' pop' : ''}`}
            >
              {d ?? ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
