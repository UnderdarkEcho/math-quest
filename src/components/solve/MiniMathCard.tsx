import type { MiniMath } from '../../lib/columnWalkthrough';

interface Props {
  mini: MiniMath;
  /** remount key for enter animation */
  beatKey: string | number;
}

export function MiniMathCard({ mini, beatKey }: Props) {
  return (
    <div className="mini-math" key={beatKey}>
      <div className="mini-math-row">
        {mini.left.map((n, i) => (
          <span key={`${i}-${n}`} className="mini-chip-wrap">
            {i > 0 && (
              <span className="mini-op" aria-hidden>
                {mini.op === '×' && i >= 2 ? '+' : mini.op}
              </span>
            )}
            <span className="mini-chip" style={{ animationDelay: `${i * 50}ms` }}>
              {n}
            </span>
          </span>
        ))}
      </div>
      <div className="mini-arrow" aria-hidden>
        ↓
      </div>
      <div className="mini-total">{mini.total}</div>
      <div className="mini-tags">
        <span className="mini-tag write">Write {mini.writeDigit}</span>
        {mini.carryOut !== undefined && mini.carryOut > 0 && (
          <span className="mini-tag carry">Carry {mini.carryOut}</span>
        )}
        {mini.borrow && <span className="mini-tag borrow">Borrowed</span>}
      </div>
      {mini.note && <p className="mini-note">{mini.note}</p>}
    </div>
  );
}
