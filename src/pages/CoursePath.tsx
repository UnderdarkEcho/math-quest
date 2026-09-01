import { Link, Navigate, useParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { getCourse, gradeLabel } from '../data/catalog';
import { isLessonMastered, isLessonUnlocked } from '../lib/progress';
import { OP_LABELS, OP_SYMBOLS } from '../types';

export function CoursePath() {
  const { courseId } = useParams();
  const { profile, setShowTutorials } = useProfile();
  if (!profile || !courseId) return <Navigate to="/select" replace />;

  const meta = getCourse(courseId);
  const progress = profile.courses.find((c) => c.courseId === courseId);
  if (!meta || !progress) return <Navigate to="/select" replace />;

  const hasBadge = profile.badges.includes(meta.badgeId);
  const allDone = progress.completedLessons.length >= meta.lessonCount;

  return (
    <div className="stack">
      <div>
        <p className="muted" style={{ marginBottom: '0.25rem' }}>
          {gradeLabel(meta.grade)} grade
        </p>
        <h1>
          {OP_SYMBOLS[meta.operation]} {OP_LABELS[meta.operation]}
        </h1>
        <p>
          Complete all <strong>10 problems</strong> in each lesson (retry misses). Badge unlocks
          when every lesson is mastered.
        </p>
        {meta.operation === 'multiplication' && (
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/tables" className="chip">
              Practice times tables →
            </Link>
          </p>
        )}
      </div>

      <div className="card">
        <div className="row">
          <span className="chip">
            {progress.completedLessons.length}/{meta.lessonCount} mastered
          </span>
          <span className="chip">{hasBadge ? '🏅 Badge earned' : '🔒 Badge locked'}</span>
        </div>
        <div className="progress-track" style={{ marginTop: '0.75rem' }}>
          <div
            className="progress-fill"
            style={{
              width: `${(progress.completedLessons.length / meta.lessonCount) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="path">
        {Array.from({ length: meta.lessonCount }, (_, i) => {
          const mastered = isLessonMastered(progress, i);
          const unlocked = isLessonUnlocked(progress, i);
          const className = [
            'path-node',
            mastered ? 'mastered' : '',
            !mastered && unlocked ? 'available' : '',
            !unlocked ? 'locked' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const node = !unlocked ? (
            <div className={className} aria-disabled>
              <span>Lesson {i + 1}</span>
              <span>🔒</span>
            </div>
          ) : (
            <Link to={`/lesson/${courseId}/${i}`} className={className}>
              <span>Lesson {i + 1}</span>
              <span>{mastered ? '✅' : '▶'}</span>
            </Link>
          );

          if (i === 0) {
            return (
              <div key={i} className="path-first">
                {node}
                <label className="tutorial-check">
                  <input
                    type="checkbox"
                    checked={profile.showTutorials !== false}
                    onChange={(e) => setShowTutorials(e.target.checked)}
                  />
                  Show tutorial
                </label>
              </div>
            );
          }

          return <div key={i} className="path-first">{node}</div>;
        })}

        <div className={`path-node ${allDone ? 'mastered' : 'locked'}`}>
          <span>Course badge</span>
          <span>{hasBadge ? '🏅' : '🔒'}</span>
        </div>
      </div>

      <Link to="/home" className="btn btn-secondary btn-block">
        Back to home
      </Link>
    </div>
  );
}
