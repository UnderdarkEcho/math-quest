import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyTheme } from '../lib/theme';
import { clearProfile, loadProfile, saveProfile } from '../lib/storage';
import {
  addPracticeXp,
  createEmptyProfile,
  masterLesson,
  startOrGetCourse,
  startOrGetCourseById,
} from '../lib/progress';
import type { AgeBand, Grade, Operation, ThemeId, UserProfile } from '../types';

interface ProfileContextValue {
  profile: UserProfile | null;
  ready: boolean;
  createProfile: (name: string, themeId: ThemeId, ageBand?: AgeBand) => void;
  updateName: (name: string) => void;
  setTheme: (themeId: ThemeId) => void;
  setAgeBand: (ageBand: AgeBand) => void;
  setShowTutorials: (on: boolean) => void;
  startCourse: (grade: Grade, operation: Operation) => string;
  startCourseById: (courseId: string) => string;
  recordPracticeXp: (correctCount: number) => void;
  completeLessonMastery: (
    courseId: string,
    lessonIndex: number,
  ) => { newlyMastered: boolean; badgeAwarded: string | null };
  /** Replace profile after pure update helpers (tables, etc.) */
  applyProfilePatch: (next: UserProfile) => void;
  resetAll: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (p) applyTheme(p.themeId);
    else applyTheme('default');
    setReady(true);
  }, []);

  const persist = useCallback((p: UserProfile) => {
    setProfile(p);
    saveProfile(p);
  }, []);

  const createProfile = useCallback(
    (name: string, themeId: ThemeId, ageBand: AgeBand = 'upper') => {
      const p = { ...createEmptyProfile(name, themeId), ageBand };
      applyTheme(themeId);
      persist(p);
    },
    [persist],
  );

  const updateName = useCallback(
    (name: string) => {
      if (!profile) return;
      persist({ ...profile, name: name.trim() });
    },
    [profile, persist],
  );

  const setTheme = useCallback(
    (themeId: ThemeId) => {
      applyTheme(themeId);
      if (!profile) return;
      persist({ ...profile, themeId });
    },
    [profile, persist],
  );

  const setAgeBand = useCallback(
    (ageBand: AgeBand) => {
      if (!profile) return;
      persist({ ...profile, ageBand });
    },
    [profile, persist],
  );

  const setShowTutorials = useCallback(
    (on: boolean) => {
      if (!profile) return;
      persist({ ...profile, showTutorials: on });
    },
    [profile, persist],
  );

  const startCourse = useCallback(
    (grade: Grade, operation: Operation) => {
      if (!profile) return '';
      const { profile: next, course } = startOrGetCourse(profile, grade, operation);
      persist(next);
      return course.courseId;
    },
    [profile, persist],
  );

  const startCourseById = useCallback(
    (courseId: string) => {
      if (!profile) return '';
      const { profile: next, course } = startOrGetCourseById(profile, courseId);
      persist(next);
      return course.courseId;
    },
    [profile, persist],
  );

  const recordPracticeXp = useCallback(
    (correctCount: number) => {
      if (!profile) return;
      persist(addPracticeXp(profile, correctCount));
    },
    [profile, persist],
  );

  const completeLessonMastery = useCallback(
    (courseId: string, lessonIndex: number) => {
      if (!profile) return { newlyMastered: false, badgeAwarded: null };
      const result = masterLesson(profile, courseId, lessonIndex);
      persist(result.profile);
      return {
        newlyMastered: result.newlyMastered,
        badgeAwarded: result.badgeAwarded,
      };
    },
    [profile, persist],
  );

  const applyProfilePatch = useCallback(
    (next: UserProfile) => {
      persist(next);
    },
    [persist],
  );

  const resetAll = useCallback(() => {
    clearProfile();
    setProfile(null);
    applyTheme('default');
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      createProfile,
      updateName,
      setTheme,
      setAgeBand,
      setShowTutorials,
      startCourse,
      startCourseById,
      recordPracticeXp,
      completeLessonMastery,
      applyProfilePatch,
      resetAll,
    }),
    [
      profile,
      ready,
      createProfile,
      updateName,
      setTheme,
      setAgeBand,
      setShowTutorials,
      startCourse,
      startCourseById,
      recordPracticeXp,
      completeLessonMastery,
      applyProfilePatch,
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
