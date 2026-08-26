import { GroupsAnimator } from './GroupsAnimator';

interface Props {
  groups: number;
  perGroup: number;
  maxDots?: number;
  /** When set, plays step-through animation */
  animate?: boolean;
  animKey?: string | number;
}

/** Equal-groups picture; set animate for teaching playback. */
export function EqualGroupsVisual({
  groups,
  perGroup,
  maxDots = 48,
  animate = false,
  animKey,
}: Props) {
  if (animate) {
    return (
      <GroupsAnimator
        groups={groups}
        perGroup={perGroup}
        maxDots={maxDots}
        animKey={animKey}
        autoPlay
        controls
      />
    );
  }

  const total = groups * perGroup;
  if (total <= 0 || total > maxDots || groups > 12 || perGroup > 12) {
    return null;
  }

  return (
    <div className="eq-groups" aria-hidden title={`${groups} groups of ${perGroup}`}>
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="eq-group eq-group-in">
          {Array.from({ length: perGroup }, (_, i) => (
            <span key={i} className="eq-dot" />
          ))}
        </div>
      ))}
    </div>
  );
}
