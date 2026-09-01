import { badgeId, getCourse } from '../data/catalog';
import type { CourseProgress, Grade, Operation, UserProfile } from '../types';
import { LESSONS_PER_COURSE } from '../types';
import { courseId } from '../data/catalog';
import { emptySnapProgress } from './snapProgress';
import { emptyTableProgress } from './tablesProgress';

const XP_PER_CORRECT = 5;
const XP_LESSON_MASTERY = 50;
const XP_COURSE_BADGE = 100;

export function createEmptyProfile(name: string, themeId: UserProfile['themeId']): UserProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    themeId,
    createdAt: now,
    updatedAt: now,
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
  const id = courseId(grade, operation);
  const existing = profile.courses.find((c) => c.courseId === id);
  if (existing) {
    return { profile, course: existing };
  }
  const course: CourseProgress = {
    courseId: id,
    grade,
    operation,
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
    LESSONS_PER_COURSE - 1,
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
    const bid = badgeId(course.grade, course.operation);
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
