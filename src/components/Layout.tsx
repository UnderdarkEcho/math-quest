import { NavLink, Outlet } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

export function Layout() {
  const { profile } = useProfile();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <NavLink to={profile ? '/home' : '/'} className="brand">
          <span className="brand-mark" aria-hidden>
            ∑
          </span>
          <span>Math Quest</span>
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
        <Outlet />
      </main>
    </div>
  );
}
