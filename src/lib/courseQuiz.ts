import { isArithmeticCourse } from '../data/catalog';
import { buildTrackTeach, generateTrackQuiz } from '../data/tracks';
import type { AgeBand, CourseMeta, LessonTeach, QuizItem, ThemeId } from '../types';
import { QUIZ_LENGTH } from '../types';
import { buildLessonTeach } from './lessonContent';
import { generateQuiz } from './questionGen';

export function generateCourseQuiz(meta: CourseMeta, lessonIndex: number): QuizItem[] {
  if (isArithmeticCourse(meta)) {
    return generateQuiz(meta.operation!, meta.grade!, lessonIndex, QUIZ_LENGTH);
  }
  return generateTrackQuiz(meta.id, lessonIndex, QUIZ_LENGTH);
}

export function buildCourseTeach(
  meta: CourseMeta,
  lessonIndex: number,
  themeId: ThemeId,
  ageBand: AgeBand,
): LessonTeach | null {
  if (isArithmeticCourse(meta)) {
    return buildLessonTeach(meta.operation!, meta.grade!, lessonIndex, themeId, ageBand);
  }
  return buildTrackTeach(meta.id, lessonIndex);
}
