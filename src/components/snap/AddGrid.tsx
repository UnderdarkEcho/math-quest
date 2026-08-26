import { factStrength } from '../../lib/tablesProgress';
import type { SnapProgress } from '../../types';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface Props {
  progress: SnapProgress;
}

export function AddGrid({ progress }: Props) {
  return (
    <div className="tt-scroll">
      <table className="tt-grid" aria-label="Addition facts 0 through 9">
        <thead>
          <tr>
            <th className="tt-corner" scope="col">
              +
            </th>
            {DIGITS.map((b) => (
              <th key={b} scope="col">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIGITS.map((a) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {DIGITS.map((b) => {
                const s = factStrength(progress.facts[`${a}+${b}`] ?? null);
                return (
                  <td key={b}>
                    <span className={`tt-cell tt-${s}`}>{a + b}</span>
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
