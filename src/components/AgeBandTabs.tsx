import { AGE_BANDS, type AgeBand } from '../types';

interface Props {
  value: AgeBand;
  onChange: (band: AgeBand) => void;
}

export function AgeBandTabs({ value, onChange }: Props) {
  const bands = AGE_BANDS ?? [];
  return (
    <div>
      <div className="label">Age look</div>
      <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
        Anyone can pick any tab. Stories and pictures follow the look, not the course grade.
      </p>
      <div className="chip-row">
        {bands.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`chip-btn${value === b.id ? ' selected' : ''}`}
            onClick={() => onChange(b.id)}
          >
            {b.label}
            <span className="muted" style={{ fontWeight: 700, marginLeft: 6, fontSize: '0.8rem' }}>
              {b.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
