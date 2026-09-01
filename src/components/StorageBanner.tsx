import type { StorageStatus } from '../types';

export function StorageBanner({ status }: { status: StorageStatus }) {
  if (status === 'ok') return null;
  const text =
    status === 'unavailable'
      ? 'This browser will not keep progress. Don’t use a Private tab. Add Math Quest to the Home Screen, or use Save backup after each session.'
      : 'Progress may disappear when you close this tab (Private Browsing). Add Math Quest to the Home Screen.';
  return (
    <div className={`storage-banner ${status}`} role="status">
      {text}
    </div>
  );
}
