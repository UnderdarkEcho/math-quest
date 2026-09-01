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

function deviceKind(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallHint() {
  const { roster } = useProfile();
  const [hidden, setHidden] = useState(true);
  const [kind, setKind] = useState<'ios' | 'android' | 'other'>('other');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    setKind(deviceKind());
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

  const body =
    kind === 'ios'
      ? 'On iPhone or iPad: tap Share → Add to Home Screen. Open Math Quest from that icon from now on.'
      : kind === 'android'
        ? 'On Android: open the browser menu → Add to Home screen.'
        : 'On a phone, open this site and add Math Quest to the Home Screen so stars don’t disappear.';

  return (
    <div className="card install-hint">
      <h2>Keep stars on this device</h2>
      <p style={{ marginTop: 0 }}>{body}</p>
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
