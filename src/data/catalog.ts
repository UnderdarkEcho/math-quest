import type { CourseMeta, Grade, Operation, TrackId } from '../types';
import { GRADES, LESSONS_PER_COURSE, OPERATIONS, OP_LABELS } from '../types';

export function courseId(grade: Grade, operation: Operation): string {
  return `g${grade}-${operation}`;
}

export function badgeId(grade: Grade, operation: Operation): string {
  return `badge-g${grade}-${operation}`;
}

export function buildCourses(): CourseMeta[] {
  const courses: CourseMeta[] = [];
  for (const grade of GRADES) {
    for (const operation of OPERATIONS) {
      courses.push({
        id: courseId(grade, operation),
        track: 'arithmetic',
        grade,
        operation,
        title: `Grade ${grade} ${OP_LABELS[operation]}`,
        lessonCount: LESSONS_PER_COURSE,
        badgeId: badgeId(grade, operation),
      });
    }
  }
  return courses;
}

export const TRACK_COURSES: CourseMeta[] = [
  {
    id: 'prealgebra',
    track: 'prealgebra',
    title: 'Pre-algebra',
    lessonCount: 10,
    badgeId: 'badge-prealgebra',
  },
  {
    id: 'algebra1',
    track: 'algebra1',
    title: 'Algebra I',
    lessonCount: 8,
    badgeId: 'badge-algebra1',
  },
];

export const COURSES: CourseMeta[] = [...buildCourses(), ...TRACK_COURSES];

export function isArithmeticCourse(meta: CourseMeta): boolean {
  return meta.track === 'arithmetic';
}

export function getCourse(id: string): CourseMeta | undefined {
  return COURSES.find((c) => c.id === id);
}

export function coursesForTrack(track: TrackId): CourseMeta[] {
  return COURSES.filter((c) => c.track === track);
}

export function gradeLabel(grade: Grade): string {
  if (grade === 1) return '1st';
  if (grade === 2) return '2nd';
  if (grade === 3) return '3rd';
  if (grade === 4) return '4th';
  if (grade === 5) return '5th';
  if (grade === 6) return '6th';
  if (grade === 7) return '7th';
  if (grade === 8) return '8th';
  if (grade === 9) return '9th';
  if (grade === 10) return '10th';
  if (grade === 11) return '11th';
  return '12th';
}
