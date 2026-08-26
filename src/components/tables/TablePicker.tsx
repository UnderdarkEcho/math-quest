import { TABLE_FACTORS } from '../../lib/tablesProgress';

interface Props {
  value: number | null;
  onChange: (focus: number | null) => void;
  masteredTables?: number[];
  /** Include mixed option */
  allowMixed?: boolean;
}

export function TablePicker({
  value,
  onChange,
  masteredTables = [],
  allowMixed = true,
}: Props) {
  return (
    <div className="chip-row">
      {allowMixed && (
        <button
          type="button"
          className={`chip-btn${value === null ? ' selected' : ''}`}
          onClick={() => onChange(null)}
        >
          Mixed
        </button>
      )}
      {TABLE_FACTORS.map((n) => {
        const done = masteredTables.includes(n);
        return (
          <button
            key={n}
            type="button"
            className={`chip-btn${value === n ? ' selected' : ''}`}
            onClick={() => onChange(n)}
          >
            ×{n}
            {done ? ' ✓' : ''}
          </button>
        );
      })}
    </div>
  );
}
