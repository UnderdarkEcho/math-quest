import { Component, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { StorageBanner } from './StorageBanner';
import { useProfile } from '../context/ProfileContext';

class PageError extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { message: err?.message || String(err) };
  }
  render() {
    if (this.state.message) {
      return (
        <div className="card">
          <h2>This page hit a snag</h2>
          <p>{this.state.message}</p>
          <p className="muted">Refresh the tab and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Layout() {
  const { profile, ready, storageStatus } = useProfile();
  const firstName = profile?.name.trim().split(/\s+/)[0];

  return (
    <div className="app-shell">
      <header className="top-nav">
        <NavLink to={profile ? '/home' : '/'} className="brand">
          <span className="brand-mark" aria-hidden>
            ∑
          </span>
          <span>Math Quest</span>
          {firstName && <span className="nav-child">{firstName}</span>}
        </NavLink>
        {profile && (
          <nav className="nav-links" aria-label="Main">
            <NavLink
              to="/home"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/select"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Courses
            </NavLink>
            <NavLink
              to="/tables"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Tables
            </NavLink>
            <NavLink
              to="/snap"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Snap
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Profile
            </NavLink>
          </nav>
        )}
      </header>
      <main>
        {ready && <StorageBanner status={storageStatus} />}
        <PageError>
          <Outlet />
        </PageError>
      </main>
    </div>
  );
}
