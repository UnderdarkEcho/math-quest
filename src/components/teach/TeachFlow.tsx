import { useMemo, useState } from 'react';
import type { LessonTeach } from '../../types';
import { GuidedCheck } from './GuidedCheck';
import { WorkedExample } from './WorkedExample';

interface Props {
  teach: LessonTeach;
  onComplete: () => void;
}

export function TeachFlow({ teach, onComplete }: Props) {
  const steps = teach.steps;
  const [index, setIndex] = useState(0);
  const step = steps[index];

  const dots = useMemo(
    () =>
      steps.map((_, i) => (
        <span
          key={i}
          className={`step-dot${i === index ? ' on' : ''}${i < index ? ' done' : ''}`}
        />
      )),
    [steps, index],
  );

  const next = () => {
    if (index >= steps.length - 1) onComplete();
    else setIndex((i) => i + 1);
  };

  return (
    <div className="card">
      <div className="step-dots" aria-hidden>
        {dots}
      </div>

      {step.kind === 'hook' && (
        <div>
          <h2>{step.title}</h2>
          <p style={{ color: 'var(--color-text)', fontSize: '1.05rem' }}>{step.body}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={next}>
            Continue
          </button>
        </div>
      )}

      {step.kind === 'worked_example' && (
        <WorkedExample
          key={`worked-${index}`}
          story={step.story}
          op={step.op}
          a={step.a}
          b={step.b}
          answer={step.answer}
          rule={step.rule}
          onDone={next}
        />
      )}

      {step.kind === 'guided' && (
        <GuidedCheck
          key={`guided-${index}`}
          prompt={step.prompt}
          op={step.op}
          a={step.a}
          b={step.b}
          answer={step.answer}
          hint={step.hint}
          onDone={next}
        />
      )}

      {step.kind === 'bridge' && (
        <div>
          <h2>Ready for mastery?</h2>
          <p style={{ color: 'var(--color-text)', fontSize: '1.05rem' }}>{step.message}</p>
          <button type="button" className="btn btn-accent btn-block" onClick={onComplete}>
            Start 10-question quiz
          </button>
        </div>
      )}
    </div>
  );
}
