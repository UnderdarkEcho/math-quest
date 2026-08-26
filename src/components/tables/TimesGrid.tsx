import {
  factStrength,
  getFactStats,
  TABLE_FACTORS,
  type FactStrength,
} from '../../lib/tablesProgress';
import type { TableProgress } from '../../types';

interface Props {
  progress: TableProgress;
  highlightFactor?: number | null;
  selected?: { a: number; b: number } | null;
  onSelect: (a: number, b: number) => void;
}

function cellClass(s: FactStrength, hi: boolean, sel: boolean): string {
  const parts = ['tt-cell', `tt-${s}`];
  if (hi) parts.push('tt-hi');
  if (sel) parts.push('tt-sel');
  return parts.join(' ');
}

export function TimesGrid({ progress, highlightFactor, selected, onSelect }: Props) {
  return (
    <div className="tt-scroll">
      <table className="tt-grid" aria-label="Multiplication table 1 through 12">
        <thead>
          <tr>
            <th className="tt-corner" scope="col">
              ×
            </th>
            {TABLE_FACTORS.map((b) => (
              <th
                key={b}
                scope="col"
                className={highlightFactor === b ? 'tt-hi-head' : undefined}
              >
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_FACTORS.map((a) => (
            <tr key={a}>
              <th
                scope="row"
                className={highlightFactor === a ? 'tt-hi-head' : undefined}
              >
                {a}
              </th>
              {TABLE_FACTORS.map((b) => {
                const s = factStrength(getFactStats(progress, a, b));
                const hi =
                  highlightFactor != null && (a === highlightFactor || b === highlightFactor);
                const sel = selected?.a === a && selected?.b === b;
                return (
                  <td key={b}>
                    <button
                      type="button"
                      className={cellClass(s, hi, sel)}
                      onClick={() => onSelect(a, b)}
                      aria-label={`${a} times ${b} equals ${a * b}`}
                    >
                      {a * b}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
