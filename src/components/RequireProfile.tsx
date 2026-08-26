import { Navigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import type { ReactNode } from 'react';

export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile, ready } = useProfile();
  if (!ready) {
    return (
      <div className="card">
        <p>Loading…</p>
      </div>
    );
  }
  if (!profile) return <Navigate to="/" replace />;
  return children;
}
