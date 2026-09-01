import { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';

const HINT_KEY = 'mathquest.installHintDismissedAt';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function dismissedThisWeek(): boolean {
  try {
    const raw = localStorage.getItem(HINT_KEY);
    if (!raw) return false;
    const at = Date.parse(raw);
    return Number.isFinite(at) && Date.now() - at < WEEK_MS;
  } catch {
    return false;
  }
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallHint() {
  const { roster } = useProfile();
  const [hidden, setHidden] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  useEffect(() => {
    if (roster.profiles.length === 0) {
      setHidden(true);
      return;
    }
    setHidden(isStandalone() || dismissedThisWeek());
  }, [roster.profiles.length]);

  if (hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(HINT_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setHidden(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
    dismiss();
  };

  return (
    <div className="card install-hint">
      <p style={{ marginTop: 0 }}>
        On iPhone or iPad: tap Share → Add to Home Screen. Open Math Quest from that icon from now
        on.
      </p>
      <p>On Android: open the browser menu → Add to Home screen.</p>
      <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
        {installEvent && (
          <button type="button" className="btn btn-primary" onClick={() => void install()}>
            Install app
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
