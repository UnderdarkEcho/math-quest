import { Link } from 'react-router-dom';
import { InstallHint } from '../components/InstallHint';
import { useProfile } from '../context/ProfileContext';
import { THEME_IMAGES } from '../data/assets';
import { getCourse, gradeLabel } from '../data/catalog';
import { getThemePack } from '../data/themes';
import {
  countMasteredLanes,
  countSolidSnapFacts,
  ensureSnapProgress,
  TOTAL_SNAP_FACTS,
} from '../lib/snapProgress';
import {
  countMasteredTables,
  countSolidFacts,
  ensureTableProgress,
  TOTAL_FACTS,
} from '../lib/tablesProgress';
import { OP_LABELS, OP_SYMBOLS } from '../types';

export function Home() {
  const { profile } = useProfile();
  if (!profile) return null;

  const theme = getThemePack(profile.themeId);
  const inProgress = profile.courses.filter((c) => c.status === 'in_progress');
  const completedCount = profile.courses.filter((c) => c.status === 'completed').length;
  const tp = ensureTableProgress(profile);
  const tableSolid = countSolidFacts(tp);
  const tablesMastered = countMasteredTables(tp);
  const sp = ensureSnapProgress(profile);
  const snapSolid = countSolidSnapFacts(sp);
  const snapLanes = countMasteredLanes(sp);

  return (
    <div className="stack">
      <div className="row">
        <div className="row" style={{ gap: '0.75rem' }}>
          <div className="hero-mascot" style={{ width: 64, height: 64, margin: 0, borderRadius: 16 }}>
            <img src={THEME_IMAGES[profile.themeId]} alt="" />
          </div>
          <div>
            <h1>Hi, {profile.name}!</h1>
            <p style={{ margin: 0 }}>Ready for your next math quest?</p>
          </div>
        </div>
        <div className="stat-pill">⭐ {profile.totalXp} XP</div>
      </div>

      <InstallHint />

      <div className="chip-row">
        <span className="chip">Theme: {theme.label}</span>
        <span className="chip">{completedCount} courses done</span>
        <span className="chip">{profile.badges.length} badges</span>
        <Link to="/" className="chip">
          Who’s playing?
        </Link>
      </div>

      <Link to="/snap" className="card" style={{ display: 'block' }}>
        <div className="row">
          <div>
            <h2 style={{ marginBottom: 4 }}>Snap Facts</h2>
            <p style={{ margin: 0 }}>
              Instant + and − · {snapSolid}/{TOTAL_SNAP_FACTS} solid · {snapLanes}/6 lanes
            </p>
          </div>
          <span className="chip">+ −</span>
        </div>
      </Link>

      <Link to="/tables" className="card" style={{ display: 'block' }}>
        <div className="row">
          <div>
            <h2 style={{ marginBottom: 4 }}>Times Table Trainer</h2>
            <p style={{ margin: 0 }}>
              Reinforce 1×1–12×12 · {tableSolid}/{TOTAL_FACTS} solid · {tablesMastered}/12 tables
            </p>
          </div>
          <span className="chip">×</span>
        </div>
      </Link>

      <div className="card">
        <h2>Continue</h2>
        {inProgress.length === 0 ? (
          <div className="empty">
            <p>No courses in progress yet.</p>
            <Link to="/select" className="btn btn-primary">
              Start a course
            </Link>
          </div>
        ) : (
          <div className="stack">
            {inProgress.map((c) => {
              const meta = getCourse(c.courseId);
              if (!meta) return null;
              const done = c.completedLessons.length;
              const total = meta.lessonCount;
              return (
                <Link key={c.courseId} to={`/course/${c.courseId}`} className="card" style={{ marginTop: 0 }}>
                  <div className="row">
                    <strong>
                      {OP_SYMBOLS[c.operation]} {gradeLabel(c.grade)} {OP_LABELS[c.operation]}
                    </strong>
                    <span className="muted">
                      {done}/{total} lessons
                    </span>
                  </div>
                  <div className="progress-track" style={{ marginTop: '0.6rem' }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${(done / total) * 100}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Link to="/select" className="btn btn-accent btn-block">
        Start a new course
      </Link>
    </div>
  );
}
