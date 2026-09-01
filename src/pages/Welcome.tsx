import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstallHint } from '../components/InstallHint';
import { RestoreBackup } from '../components/RestoreBackup';
import { useProfile } from '../context/ProfileContext';
import { THEME_IMAGES } from '../data/assets';
import { THEME_PACKS } from '../data/themes';
import { applyTheme } from '../lib/theme';
import { MAX_PROFILES } from '../lib/storage';
import type { ThemeId } from '../types';

export function Welcome() {
  const { ready, roster, profile, createProfile, switchProfile, storageStatus } = useProfile();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>('default');
  const [ackEphemeral, setAckEphemeral] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="card">
        <p>Loading…</p>
      </div>
    );
  }

  const hasKids = roster.profiles.length > 0;
  const atCap = roster.profiles.length >= MAX_PROFILES;
  const showForm = !hasKids || adding;

  const pickTheme = (id: ThemeId) => {
    setThemeId(id);
    applyTheme(id);
  };

  const goHome = (id?: string) => {
    if (id) switchProfile(id);
    navigate('/home');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    if (storageStatus === 'unavailable' && !ackEphemeral) return;
    setBusy(true);
    setError(null);
    const result = await createProfile(name.trim(), themeId);
    setBusy(false);
    if (result.reason === 'cap') {
      setError('This iPad already has 12 children. Delete one on Profile, or use another device.');
      return;
    }
    if (!result.ok && result.status === 'unavailable' && !ackEphemeral) {
      setError('This browser will not keep progress.');
      return;
    }
    navigate('/home');
  };

  return (
    <div className="stack">
      <div className="hero">
        <div className="hero-mascot" aria-hidden>
          <img src={THEME_IMAGES[profile?.themeId ?? themeId]} alt="" />
        </div>
        <h1>Math Quest</h1>
        <p>
          Progress stays on this device. No account needed. Add Math Quest to your Home Screen so
          stars don’t disappear.
        </p>
      </div>

      <InstallHint />

      {hasKids && !adding && !restoring && (
        <div className="card stack">
          <h2>Who’s playing?</h2>
          <div className="child-list">
            {roster.profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`child-row${p.id === roster.activeId ? ' selected' : ''}`}
                onClick={() => goHome(p.id)}
              >
                <img src={THEME_IMAGES[p.themeId]} alt="" />
                <span>
                  <strong>{p.name}</strong>
                  <span className="muted">⭐ {p.totalXp} XP</span>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={atCap}
            onClick={() => setAdding(true)}
          >
            Add another child
          </button>
          {atCap && (
            <p className="muted">This device already has 12 children. Delete one on Profile first.</p>
          )}
          <button type="button" className="btn btn-secondary btn-block" onClick={() => setRestoring(true)}>
            Restore a backup
          </button>
        </div>
      )}

      {restoring && (
        <div className="card stack">
          <h2>Restore a backup</h2>
          <RestoreBackup onDone={() => { setRestoring(false); }} />
          <button type="button" className="btn btn-secondary btn-block" onClick={() => setRestoring(false)}>
            Back
          </button>
        </div>
      )}

      {showForm && !restoring && (
        <form className="card stack" onSubmit={(e) => void submit(e)}>
          {hasKids && <h2>Add another child</h2>}
          <div>
            <label className="label" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={24}
              required
              autoFocus
            />
          </div>

          <div>
            <div className="label">Pick a theme</div>
            <div className="grid-themes">
              {THEME_PACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-card${themeId === t.id ? ' selected' : ''}`}
                  onClick={() => pickTheme(t.id)}
                >
                  <img
                    src={THEME_IMAGES[t.id]}
                    alt=""
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  />
                  <h3>{t.label}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.tagline}</p>
                </button>
              ))}
            </div>
          </div>

          {storageStatus !== 'ok' && (
            <label className="tutorial-check" style={{ justifyContent: 'flex-start' }}>
              <input
                type="checkbox"
                checked={ackEphemeral}
                onChange={(e) => setAckEphemeral(e.target.checked)}
              />
              I understand progress may disappear
            </label>
          )}

          {error && <div className="feedback bad">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!name.trim() || busy || (storageStatus !== 'ok' && !ackEphemeral)}
          >
            Start learning
          </button>
          {hasKids && (
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setAdding(false)}>
              Back
            </button>
          )}
          {!hasKids && (
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setRestoring(true)}>
              Restore a backup
            </button>
          )}
        </form>
      )}
    </div>
  );
}
