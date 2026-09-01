import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { applyTheme } from '../lib/theme';
import {
  MAX_PROFILES,
  clearAll,
  emptyRoster,
  loadRoster,
  mergeRosters,
  probeStorage,
  saveRoster,
  upsertProfile,
} from '../lib/storage';
import {
  addPracticeXp,
  createEmptyProfile,
  masterLesson,
  startOrGetCourse,
} from '../lib/progress';
import type {
  Grade,
  Operation,
  ProfileRoster,
  StorageStatus,
  ThemeId,
  UserProfile,
} from '../types';

interface PersistResult {
  ok: boolean;
  status: StorageStatus;
}

interface ProfileContextValue {
  profile: UserProfile | null;
  roster: ProfileRoster;
  ready: boolean;
  storageStatus: StorageStatus;
  createProfile: (name: string, themeId: ThemeId) => Promise<PersistResult & { reason?: 'cap' }>;
  updateName: (name: string) => void;
  setTheme: (themeId: ThemeId) => void;
  setShowTutorials: (on: boolean) => void;
  startCourse: (grade: Grade, operation: Operation) => string;
  recordPracticeXp: (correctCount: number) => void;
  completeLessonMastery: (
    courseId: string,
    lessonIndex: number,
  ) => { newlyMastered: boolean; badgeAwarded: string | null };
  applyProfilePatch: (next: UserProfile) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => Promise<void>;
  importRoster: (incoming: ProfileRoster, mode: 'replace' | 'merge') => Promise<PersistResult>;
  resetAll: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function activeOf(roster: ProfileRoster): UserProfile | null {
  if (!roster.activeId) return null;
  return roster.profiles.find((p) => p.id === roster.activeId) ?? null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [roster, setRoster] = useState<ProfileRoster>(emptyRoster);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>('ok');
  const rosterRef = useRef(roster);
  const persistOnce = useRef(false);
  const booted = useRef(false);

  const applyRosterState = useCallback((next: ProfileRoster) => {
    rosterRef.current = next;
    setRoster(next);
    const active = activeOf(next);
    setProfile(active);
    applyTheme(active?.themeId ?? 'default');
  }, []);

  const persist = useCallback(
    async (next: ProfileRoster): Promise<PersistResult> => {
      applyRosterState(next);
      const result = await saveRoster(next);
      setStorageStatus(result.status);
      if (result.ok && !persistOnce.current && typeof navigator !== 'undefined' && navigator.storage?.persist) {
        persistOnce.current = true;
        void navigator.storage.persist().catch(() => undefined);
      }
      return result;
    },
    [applyRosterState],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await probeStorage();
      const loaded = await loadRoster();
      if (cancelled) return;
      setStorageStatus(status);
      applyRosterState(loaded);
      booted.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyRosterState]);

  useEffect(() => {
    const flush = () => {
      if (!booted.current) return;
      void saveRoster(rosterRef.current);
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  const createProfile = useCallback(
    async (name: string, themeId: ThemeId) => {
      if (rosterRef.current.profiles.length >= MAX_PROFILES) {
        return { ok: false, status: storageStatus, reason: 'cap' as const };
      }
      const created = createEmptyProfile(name, themeId);
      const next: ProfileRoster = {
        schemaVersion: 2,
        activeId: created.id,
        profiles: [...rosterRef.current.profiles, created],
      };
      return persist(next);
    },
    [persist, storageStatus],
  );

  const patchActive = useCallback(
    (mut: (p: UserProfile) => UserProfile) => {
      const current = activeOf(rosterRef.current);
      if (!current) return;
      void persist(upsertProfile(rosterRef.current, mut(current)));
    },
    [persist],
  );

  const updateName = useCallback(
    (name: string) => {
      patchActive((p) => ({ ...p, name: name.trim() }));
    },
    [patchActive],
  );

  const setTheme = useCallback(
    (themeId: ThemeId) => {
      applyTheme(themeId);
      patchActive((p) => ({ ...p, themeId }));
    },
    [patchActive],
  );

  const setShowTutorials = useCallback(
    (on: boolean) => {
      patchActive((p) => ({ ...p, showTutorials: on }));
    },
    [patchActive],
  );

  const startCourse = useCallback(
    (grade: Grade, operation: Operation) => {
      const current = activeOf(rosterRef.current);
      if (!current) return '';
      const { profile: next, course } = startOrGetCourse(current, grade, operation);
      void persist(upsertProfile(rosterRef.current, next));
      return course.courseId;
    },
    [persist],
  );

  const recordPracticeXp = useCallback(
    (correctCount: number) => {
      patchActive((p) => addPracticeXp(p, correctCount));
    },
    [patchActive],
  );

  const completeLessonMastery = useCallback(
    (courseId: string, lessonIndex: number) => {
      const current = activeOf(rosterRef.current);
      if (!current) return { newlyMastered: false, badgeAwarded: null };
      const result = masterLesson(current, courseId, lessonIndex);
      void persist(upsertProfile(rosterRef.current, result.profile));
      return {
        newlyMastered: result.newlyMastered,
        badgeAwarded: result.badgeAwarded,
      };
    },
    [persist],
  );

  const applyProfilePatch = useCallback(
    (next: UserProfile) => {
      void persist(upsertProfile(rosterRef.current, next));
    },
    [persist],
  );

  const switchProfile = useCallback(
    (id: string) => {
      const next = { ...rosterRef.current, activeId: id };
      void persist(next);
    },
    [persist],
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      const remaining = rosterRef.current.profiles.filter((p) => p.id !== id);
      const activeId =
        rosterRef.current.activeId === id ? (remaining[0]?.id ?? null) : rosterRef.current.activeId;
      await persist({ schemaVersion: 2, activeId, profiles: remaining });
    },
    [persist],
  );

  const importRoster = useCallback(
    async (incoming: ProfileRoster, mode: 'replace' | 'merge') => {
      const next =
        mode === 'replace'
          ? { schemaVersion: 2 as const, activeId: incoming.activeId, profiles: incoming.profiles }
          : mergeRosters(rosterRef.current, incoming);
      return persist(next);
    },
    [persist],
  );

  const resetAll = useCallback(async () => {
    await clearAll();
    applyRosterState(emptyRoster());
    setStorageStatus(await probeStorage());
  }, [applyRosterState]);

  const value = useMemo(
    () => ({
      profile,
      roster,
      ready,
      storageStatus,
      createProfile,
      updateName,
      setTheme,
      setShowTutorials,
      startCourse,
      recordPracticeXp,
      completeLessonMastery,
      applyProfilePatch,
      switchProfile,
      deleteProfile,
      importRoster,
      resetAll,
    }),
    [
      profile,
      roster,
      ready,
      storageStatus,
      createProfile,
      updateName,
      setTheme,
      setShowTutorials,
      startCourse,
      recordPracticeXp,
      completeLessonMastery,
      applyProfilePatch,
      switchProfile,
      deleteProfile,
      importRoster,
      resetAll,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
