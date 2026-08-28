export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ThemeId = 'default' | 'minecraft' | 'dnd' | 'greek' | 'small-business';
export type AgeBand = 'early' | 'upper' | 'middle' | 'high';
export type CourseId = string;
export type TrackId = 'arithmetic' | 'prealgebra' | 'algebra1';

export interface FactStats {
  correct: number;
  wrong: number;
  lastAt: string;
}

export interface TableProgress {
  /** Keys like "6x7" with smaller factor first */
  facts: Record<string, FactStats>;
  masteredTables: number[];
}

export type SnapLaneId = 'bonds10' | 'doubles' | 'make10' | 'add' | 'sub' | 'mixed';

export interface SnapFactStats extends FactStats {
  bestMs?: number;
}

export interface SnapProgress {
  facts: Record<string, SnapFactStats>;
  masteredLanes: string[];
  bestRoundMs: Record<string, number>;
}

export interface UserProfile {
  name: string;
  themeId: ThemeId;
  ageBand: AgeBand;
  createdAt: string;
  totalXp: number;
  badges: string[];
  courses: CourseProgress[];
  tableProgress: TableProgress;
  snapProgress: SnapProgress;
  /** Lesson walkthrough before the quiz. Default true. */
  showTutorials: boolean;
}

export interface CourseProgress {
  courseId: CourseId;
  grade?: Grade;
  operation?: Operation;
  status: 'in_progress' | 'completed';
  completedLessons: number[];
  currentLesson: number;
  startedAt: string;
  completedAt?: string;
}

export interface Question {
  id: string;
  op: Operation;
  a: number;
  b: number;
  answer: number;
  expression: string;
}

export interface PromptQuestion {
  id: string;
  kind: 'prompt';
  prompt: string;
  expected: string;
  hint?: string;
}

export type QuizItem = Question | PromptQuestion;

export function isPromptQuestion(q: QuizItem): q is PromptQuestion {
  return (q as PromptQuestion).kind === 'prompt';
}

export interface CourseMeta {
  id: CourseId;
  track: TrackId;
  title: string;
  lessonCount: number;
  badgeId: string;
  grade?: Grade;
  operation?: Operation;
}

export type TeachStep =
  | { kind: 'hook'; title: string; body: string }
  | {
      kind: 'worked_example';
      story: string;
      op: Operation;
      a: number;
      b: number;
      expression: string;
      answer: number;
      rule: string;
    }
  | {
      kind: 'guided';
      prompt: string;
      op: Operation;
      a: number;
      b: number;
      expression: string;
      answer: number;
      hint?: string;
    }
  | { kind: 'bridge'; message: string }
  | {
      kind: 'prompt_guided';
      prompt: string;
      expected: string;
      hint?: string;
    }
  | {
      kind: 'symbols';
      title: string;
      intro: string;
      items: { symbol: string; meaning: string }[];
      typeHint?: string;
    };

export interface LessonTeach {
  lessonIndex: number;
  op?: Operation;
  steps: TeachStep[];
}

export interface ThemeVoice {
  tagline: string;
  hooks: Record<Operation, string[]>;
  exampleStories: Record<Operation, string[]>;
}

export interface ThemePack extends ThemeVoice {
  id: ThemeId;
  label: string;
  units?: string[];
  /** Overrides for age tabs. Missing bands use the pack’s main (upper) copy. */
  byAge?: Partial<Record<AgeBand, ThemeVoice>>;
}

export const AGE_BANDS: { id: AgeBand; label: string; hint: string }[] = [
  { id: 'early', label: 'Early', hint: '5–8' },
  { id: 'upper', label: 'Upper', hint: '8–11' },
  { id: 'middle', label: 'Middle', hint: '11–14' },
  { id: 'high', label: 'High', hint: '14–18' },
];

export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];
export const LESSONS_PER_COURSE = 8;
export const QUIZ_LENGTH = 10;

export const TRACKS: { id: TrackId; label: string }[] = [
  { id: 'arithmetic', label: 'Arithmetic' },
  { id: 'prealgebra', label: 'Pre-algebra' },
  { id: 'algebra1', label: 'Algebra I' },
];

export const OP_LABELS: Record<Operation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
};

export const OP_SYMBOLS: Record<Operation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};
