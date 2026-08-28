import { courseId, getCourse } from '../data/catalog';
import type { CourseProgress, Grade, Operation, UserProfile } from '../types';
import { emptySnapProgress } from './snapProgress';
import { emptyTableProgress } from './tablesProgress';

const XP_PER_CORRECT = 5;
const XP_LESSON_MASTERY = 50;
const XP_COURSE_BADGE = 100;

export function createEmptyProfile(name: string, themeId: UserProfile['themeId']): UserProfile {
  return {
    name: name.trim(),
    themeId,
    ageBand: 'upper',
    createdAt: new Date().toISOString(),
    totalXp: 0,
    badges: [],
    courses: [],
    tableProgress: emptyTableProgress(),
    snapProgress: emptySnapProgress(),
    showTutorials: true,
  };
}

export function startOrGetCourse(
  profile: UserProfile,
  grade: Grade,
  operation: Operation,
): { profile: UserProfile; course: CourseProgress } {
  return startOrGetCourseById(profile, courseId(grade, operation));
}

export function startOrGetCourseById(
  profile: UserProfile,
  id: string,
): { profile: UserProfile; course: CourseProgress } {
  const existing = profile.courses.find((c) => c.courseId === id);
  if (existing) {
    return { profile, course: existing };
  }
  const meta = getCourse(id);
  const course: CourseProgress = {
    courseId: id,
    grade: meta?.grade,
    operation: meta?.operation,
    status: 'in_progress',
    completedLessons: [],
    currentLesson: 0,
    startedAt: new Date().toISOString(),
  };
  return {
    profile: { ...profile, courses: [...profile.courses, course] },
    course,
  };
}

export function addPracticeXp(profile: UserProfile, correctCount: number): UserProfile {
  if (correctCount <= 0) return profile;
  return { ...profile, totalXp: profile.totalXp + correctCount * XP_PER_CORRECT };
}

/** Mark lesson mastered (10/10). Idempotent for XP if already mastered. */
export function masterLesson(
  profile: UserProfile,
  courseIdStr: string,
  lessonIndex: number,
): { profile: UserProfile; newlyMastered: boolean; badgeAwarded: string | null } {
  const courseMeta = getCourse(courseIdStr);
  if (!courseMeta) {
    return { profile, newlyMastered: false, badgeAwarded: null };
  }

  const courses = profile.courses.map((c) => ({ ...c, completedLessons: [...c.completedLessons] }));
  const idx = courses.findIndex((c) => c.courseId === courseIdStr);
  if (idx < 0) {
    return { profile, newlyMastered: false, badgeAwarded: null };
  }

  const course = courses[idx];
  const already = course.completedLessons.includes(lessonIndex);
  if (already) {
    return { profile, newlyMastered: false, badgeAwarded: null };
  }

  course.completedLessons.push(lessonIndex);
  course.completedLessons.sort((a, b) => a - b);
  course.currentLesson = Math.min(
    courseMeta.lessonCount - 1,
    Math.max(course.currentLesson, lessonIndex + 1),
  );

  let totalXp = profile.totalXp + XP_LESSON_MASTERY;
  const badges = [...profile.badges];
  let badgeAwarded: string | null = null;

  if (!badges.includes('first-perfect-lesson')) {
    badges.push('first-perfect-lesson');
  }

  if (course.completedLessons.length >= courseMeta.lessonCount) {
    course.status = 'completed';
    course.completedAt = new Date().toISOString();
    const bid = courseMeta.badgeId;
    if (!badges.includes(bid)) {
      badges.push(bid);
      badgeAwarded = bid;
      totalXp += XP_COURSE_BADGE;
    }
    if (!badges.includes('first-course-badge') && badgeAwarded) {
      badges.push('first-course-badge');
    }
  }

  courses[idx] = course;
  return {
    profile: { ...profile, courses, totalXp, badges },
    newlyMastered: true,
    badgeAwarded,
  };
}

export function isLessonUnlocked(course: CourseProgress, lessonIndex: number): boolean {
  if (lessonIndex === 0) return true;
  return course.completedLessons.includes(lessonIndex - 1);
}

export function isLessonMastered(course: CourseProgress, lessonIndex: number): boolean {
  return course.completedLessons.includes(lessonIndex);
}
