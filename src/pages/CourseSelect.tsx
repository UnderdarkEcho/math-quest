import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { getCourse, gradeLabel } from '../data/catalog';
import { getTrackLessons } from '../data/tracks';
import {
  GRADES,
  OPERATIONS,
  OP_LABELS,
  OP_SYMBOLS,
  TRACKS,
  type Grade,
  type Operation,
  type TrackId,
} from '../types';

export function CourseSelect() {
  const { startCourse, startCourseById, profile } = useProfile();
  const navigate = useNavigate();
  const [track, setTrack] = useState<TrackId>('arithmetic');
  const [grade, setGrade] = useState<Grade>(4);
  const [operation, setOperation] = useState<Operation>('addition');

  if (!profile) return null;

  const existingArith = profile.courses.find(
    (c) => c.grade === grade && c.operation === operation,
  );
  const trackMeta = track === 'arithmetic' ? undefined : getCourse(track);
  const existingTrack = trackMeta
    ? profile.courses.find((c) => c.courseId === trackMeta.id)
    : undefined;

  const go = () => {
    if (track === 'arithmetic') {
      const id = startCourse(grade, operation);
      navigate(`/course/${id}`);
      return;
    }
    const id = startCourseById(track);
    navigate(`/course/${id}`);
  };

  const lessons = track === 'arithmetic' ? null : getTrackLessons(track);
  const existing = track === 'arithmetic' ? existingArith : existingTrack;

  return (
    <div className="stack">
      <div>
        <h1>Choose a course</h1>
        <p>Pick a track. Finish every lesson’s 10 problems to earn the badge.</p>
      </div>

      <div className="card">
        <div className="label">Track</div>
        <div className="chip-row">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip-btn${track === t.id ? ' selected' : ''}`}
              onClick={() => setTrack(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {track === 'arithmetic' ? (
        <>
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
        </>
      ) : (
        <div className="card">
          <h2>{trackMeta?.title}</h2>
          <p>
            {track === 'prealgebra'
              ? 'Integers, order of operations, fractions, ratios, expressions, and equations.'
              : 'Linear equations, systems, slope, exponents, polynomials, factoring, and quadratics.'}
          </p>
          {lessons && (
            <ol className="muted" style={{ paddingLeft: '1.2rem' }}>
              {lessons.map((l) => (
                <li key={l.title}>{l.title}</li>
              ))}
            </ol>
          )}
        </div>
      )}

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
