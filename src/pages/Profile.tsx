import { Component, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { BADGE_IMAGE, themeImage } from '../data/assets';
import { getCourse, gradeLabel } from '../data/catalog';
import { AgeBandTabs } from '../components/AgeBandTabs';
import { THEME_PACKS, themeVoice } from '../data/themes';
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
import { AGE_BANDS, OP_LABELS, OP_SYMBOLS, type AgeBand } from '../types';

class ProfileError extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { message: err?.message || String(err) };
  }
  render() {
    if (this.state.message) {
      return (
        <div className="card">
          <h2>Profile hit a snag</h2>
          <p>{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function badgeLabel(id: string): string {
  if (typeof id !== 'string') return String(id);
  if (id === 'first-perfect-lesson') return 'First perfect lesson';
  if (id === 'first-course-badge') return 'First course badge';
  if (id === 'times-table-starter') return 'Times table starter';
  if (id === 'times-table-champ') return 'Times table champion';
  if (id === 'snap-starter') return 'Snap starter';
  if (id === 'snap-champ') return 'Snap champion';
  if (id === 'badge-prealgebra') return 'Pre-algebra';
  if (id === 'badge-algebra1') return 'Algebra I';
  const m = id.match(/^badge-g(\d+)-(\w+)$/);
  if (m) {
    const grade = Number(m[1]) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    const op = m[2] as keyof typeof OP_LABELS;
    return `${gradeLabel(grade)} ${OP_LABELS[op] ?? op}`;
  }
  return id;
}

export function Profile() {
  return (
    <ProfileError>
      <ProfileBody />
    </ProfileError>
  );
}

function ProfileBody() {
  const { profile, setTheme, setAgeBand, setShowTutorials, updateName, resetAll } = useProfile();
  const navigate = useNavigate();
  const [nameEdit, setNameEdit] = useState(profile?.name ?? '');

  if (!profile) return null;

  const ageBand: AgeBand = AGE_BANDS.some((b) => b.id === profile.ageBand)
    ? profile.ageBand
    : 'upper';

  const inProgress = (profile.courses ?? []).filter((c) => c.status === 'in_progress');
  const completed = (profile.courses ?? []).filter((c) => c.status === 'completed');
  const tp = ensureTableProgress(profile);
  const tableSolid = countSolidFacts(tp);
  const tablesMastered = countMasteredTables(tp);
  const sp = ensureSnapProgress(profile);
  const snapSolid = countSolidSnapFacts(sp);
  const snapLanes = countMasteredLanes(sp);

  const saveName = () => {
    if (nameEdit.trim()) updateName(nameEdit.trim());
  };

  const handleReset = () => {
    if (window.confirm('Clear all progress on this device? This cannot be undone.')) {
      resetAll();
      navigate('/');
    }
  };

  return (
    <div className="stack">
      <div className="row">
        <div>
          <h1>Profile</h1>
          <p style={{ margin: 0 }}>Your local progress on this device</p>
        </div>
        <div className="stat-pill">⭐ {profile.totalXp} XP</div>
      </div>

      <div className="card stack">
        <div>
          <label className="label" htmlFor="profile-name">
            Name
          </label>
          <div className="row">
            <input
              id="profile-name"
              className="input"
              value={nameEdit}
              onChange={(e) => setNameEdit(e.target.value)}
              maxLength={24}
            />
            <button type="button" className="btn btn-secondary" onClick={saveName}>
              Save
            </button>
          </div>
        </div>

        <div>
          <div className="label">Lesson tutorials</div>
          <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
            Walkthrough before the quiz. Turn off if you already know the skill.
          </p>
          <label className="tutorial-check" style={{ justifyContent: 'flex-start' }}>
            <input
              type="checkbox"
              checked={profile.showTutorials !== false}
              onChange={(e) => setShowTutorials(e.target.checked)}
            />
            Show lesson tutorials
          </label>
        </div>

      </div>

      <div className="card">
        <h2>Times tables</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          {tableSolid}/{TOTAL_FACTS} facts solid · {tablesMastered}/12 tables mastered
        </p>
        <div className="progress-track" style={{ marginBottom: '0.75rem' }}>
          <div
            className="progress-fill"
            style={{ width: `${(tableSolid / TOTAL_FACTS) * 100}%` }}
          />
        </div>
        <Link to="/tables" className="btn btn-primary btn-block">
          Open table trainer
        </Link>
      </div>

      <div className="card">
        <h2>Snap facts</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          {snapSolid}/{TOTAL_SNAP_FACTS} facts solid · {snapLanes}/6 lanes mastered
        </p>
        <div className="progress-track" style={{ marginBottom: '0.75rem' }}>
          <div
            className="progress-fill"
            style={{ width: `${(snapSolid / TOTAL_SNAP_FACTS) * 100}%` }}
          />
        </div>
        <Link to="/snap" className="btn btn-primary btn-block">
          Open Snap
        </Link>
      </div>

      <div className="card">
        <h2>Badges</h2>
        {profile.badges.length === 0 ? (
          <p className="empty">Master all lessons in a course to earn a badge.</p>
        ) : (
          <div className="badge-grid">
            {profile.badges.map((b) => (
              <div key={b} className="badge-item">
                <img
                  src={BADGE_IMAGE}
                  alt=""
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.8rem', fontWeight: 800, marginTop: 6 }}>
                  {badgeLabel(b)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>In progress</h2>
        {inProgress.length === 0 ? (
          <p className="empty">Nothing in progress. <Link to="/select">Start a course</Link></p>
        ) : (
          <div className="stack">
            {inProgress.map((c) => {
              const meta = getCourse(c.courseId);
              return (
                <Link key={c.courseId} to={`/course/${c.courseId}`} className="row">
                  <strong>
                    {(() => {
                      const m = getCourse(c.courseId);
                      if (m && m.track !== 'arithmetic') return m.title;
                      return `${OP_SYMBOLS[c.operation!]} ${gradeLabel(c.grade!)} ${OP_LABELS[c.operation!]}`;
                    })()}
                  </strong>
                  <span className="muted">
                    {c.completedLessons.length}/{meta?.lessonCount ?? 8}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Completed</h2>
        {completed.length === 0 ? (
          <p className="empty">Finish every lesson’s 10 problems to complete a course.</p>
        ) : (
          <div className="stack">
            {completed.map((c) => {
              const m = getCourse(c.courseId);
              const title =
                m && m.track !== 'arithmetic'
                  ? m.title
                  : `${OP_SYMBOLS[c.operation!]} ${gradeLabel(c.grade!)} ${OP_LABELS[c.operation!]}`;
              return (
                <Link key={c.courseId} to={`/course/${c.courseId}`} className="row">
                  <strong>{title}</strong>
                  <span>✅</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="card stack">
        <h2>Look</h2>
        <AgeBandTabs value={ageBand} onChange={(b) => setAgeBand(b)} />
        <div>
          <div className="label">Theme</div>
          <div className="grid-themes">
            {THEME_PACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-card${profile.themeId === t.id ? ' selected' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <img
                  src={themeImage(t.id, ageBand)}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                />
                <h3>{t.label}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {themeVoice(t, ageBand)?.tagline ?? t.tagline}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-secondary btn-block" onClick={handleReset}>
        Clear all progress
      </button>
    </div>
  );
}
