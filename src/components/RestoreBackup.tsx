import { useState, type ChangeEvent } from 'react';
import { useProfile } from '../context/ProfileContext';
import { parseBackup } from '../lib/storage';
import type { ProfileRoster } from '../types';

export function RestoreBackup({ onDone }: { onDone?: () => void }) {
  const { importRoster, storageStatus } = useProfile();
  const [raw, setRaw] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pending, setPending] = useState<ProfileRoster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const loadText = (text: string) => {
    setError(null);
    setNote(null);
    try {
      setPending(parseBackup(text));
    } catch (err) {
      setPending(null);
      setError(err instanceof Error ? err.message : 'Could not read that backup.');
    }
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    loadText(await file.text());
  };

  const apply = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    if (
      mode === 'replace' &&
      !window.confirm(
        'Replace everyone on this device? Children only on this iPad will be removed. Save a backup first if you are unsure.',
      )
    ) {
      return;
    }
    const result = await importRoster(pending, mode);
    if (!result.ok && result.status === 'unavailable') {
      setError('Restored in this tab only — this browser will not keep progress.');
    } else {
      setPending(null);
      setRaw('');
      setNote('Backup restored.');
      onDone?.();
    }
  };

  return (
    <div className="stack">
      <label className="btn btn-secondary btn-block" style={{ textAlign: 'center' }}>
        Choose backup file
        <input type="file" accept="application/json,.json" onChange={(e) => void onFile(e)} hidden />
      </label>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={() => setShowPaste((v) => !v)}
      >
        Paste backup code
      </button>
      {showPaste && (
        <>
          <label className="label" htmlFor="backup-paste">
            Paste the backup text
          </label>
          <textarea
            id="backup-paste"
            className="input"
            rows={4}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste here"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="btn btn-secondary btn-block"
            disabled={!raw.trim()}
            onClick={() => loadText(raw)}
          >
            Read pasted backup
          </button>
        </>
      )}
      {error && <div className="feedback bad">{error}</div>}
      {note && <div className="feedback ok">{note}</div>}
      {pending && (
        <div className="card" style={{ margin: 0 }}>
          <p>
            Found {pending.profiles.length} child{pending.profiles.length === 1 ? '' : 'ren'}:{' '}
            {pending.profiles.map((p) => p.name).join(', ')}
          </p>
          {storageStatus === 'unavailable' && (
            <p className="muted">This restore will not survive closing the tab.</p>
          )}
          <div className="stack">
            <button type="button" className="btn btn-primary btn-block" onClick={() => void apply('merge')}>
              Add these children
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => void apply('replace')}>
              Replace everyone on this device
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
