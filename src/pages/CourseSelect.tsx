import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { GRADES, OPERATIONS, OP_LABELS, OP_SYMBOLS, type Grade, type Operation } from '../types';
import { gradeLabel } from '../data/catalog';

export function CourseSelect() {
  const { startCourse, profile } = useProfile();
  const navigate = useNavigate();
  const [grade, setGrade] = useState<Grade>(4);
  const [operation, setOperation] = useState<Operation>('addition');

  if (!profile) return null;

  const existing = profile.courses.find(
    (c) => c.grade === grade && c.operation === operation,
  );

  const go = () => {
    const id = startCourse(grade, operation);
    navigate(`/course/${id}`);
  };

  return (
    <div className="stack">
      <div>
        <h1>Choose a course</h1>
        <p>Pick your grade and skill. Finish every lesson’s 10 problems to earn the badge.</p>
      </div>

      <div className="card">
        <div className="label">Grade</div>
        <div className="chip-row">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              className={`chip-btn${grade === g ? ' selected' : ''}`}
              onClick={() => setGrade(g)}
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="label">Skill</div>
        <div className="grid-2">
          {OPERATIONS.map((op) => (
            <button
              key={op}
              type="button"
              className={`op-card${operation === op ? ' selected' : ''}`}
              onClick={() => setOperation(op)}
            >
              <span className="op-symbol">{OP_SYMBOLS[op]}</span>
              {OP_LABELS[op]}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={go}>
        {existing
          ? existing.status === 'completed'
            ? 'Review course'
            : 'Continue course'
          : 'Start course'}
      </button>
    </div>
  );
}
