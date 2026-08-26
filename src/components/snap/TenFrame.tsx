interface FrameProps {
  filled: number;
  ghost?: number;
  caption?: string;
}

function Frame({ filled, ghost = 0, caption }: FrameProps) {
  const fill = Math.max(0, Math.min(10, filled));
  const g = Math.max(0, Math.min(10 - fill, ghost));
  return (
    <div className="tenframe-wrap">
      <div
        className="tenframe"
        role="img"
        aria-label={`${fill} filled${g ? `, ${g} more to fill a ten` : ''}`}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const kind = i < fill ? 'filled' : i < fill + g ? 'ghost' : 'empty';
          return <span key={i} className={`tf-cell tf-${kind}`} />;
        })}
      </div>
      {caption ? <p className="tenframe-cap">{caption}</p> : null}
    </div>
  );
}

export function TenFrame({
  filled,
  ghost = 0,
  leftover,
  caption,
}: FrameProps & { leftover?: number }) {
  if (leftover != null) {
    return (
      <div className="tenframe-row">
        <Frame filled={10} caption="10" />
        <span className="tenframe-plus" aria-hidden>
          +
        </span>
        <Frame filled={leftover} caption={String(leftover)} />
      </div>
    );
  }
  return <Frame filled={filled} ghost={ghost} caption={caption} />;
}
