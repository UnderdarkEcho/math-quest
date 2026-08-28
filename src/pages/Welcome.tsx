import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { AgeBandTabs } from '../components/AgeBandTabs';
import { themeImage } from '../data/assets';
import { THEME_PACKS, themeVoice } from '../data/themes';
import { applyTheme } from '../lib/theme';
import type { AgeBand, ThemeId } from '../types';

export function Welcome() {
  const { profile, ready, createProfile } = useProfile();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>('default');
  const [ageBand, setAgeBand] = useState<AgeBand>('upper');

  if (!ready) {
    return (
      <div className="card">
        <p>Loading…</p>
      </div>
    );
  }

  if (profile) {
    return <Navigate to="/home" replace />;
  }

  const pickTheme = (id: ThemeId) => {
    setThemeId(id);
    applyTheme(id);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProfile(name.trim(), themeId, ageBand);
    navigate('/home');
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-mascot" aria-hidden>
          <img src={themeImage(themeId, ageBand)} alt="" />
        </div>
        <h1>Math Quest</h1>
        <p>Learn addition, subtraction, multiplication & division — with a world you love.</p>
      </div>

      <form className="card stack" onSubmit={submit}>
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

        <AgeBandTabs value={ageBand} onChange={setAgeBand} />

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
                  src={themeImage(t.id, ageBand)}
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
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{themeVoice(t, ageBand).tagline}</p>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!name.trim()}>
          Start learning
        </button>
      </form>
    </div>
  );
}
