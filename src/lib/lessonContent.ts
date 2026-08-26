import { getSkillBand } from '../data/skills';
import { getThemePack } from '../data/themes';
import type { Grade, LessonTeach, Operation, TeachStep, ThemeId } from '../types';
import { generateQuestion } from './questionGen';

function fillStory(template: string, a: number, b: number): string {
  return template.replace(/\{a\}/g, String(a)).replace(/\{b\}/g, String(b));
}

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

export function buildLessonTeach(
  op: Operation,
  grade: Grade,
  lessonIndex: number,
  themeId: ThemeId,
): LessonTeach {
  const pack = getThemePack(themeId);
  const skill = getSkillBand(op, lessonIndex);
  const hookBody = pick(pack.hooks[op], lessonIndex);
  const storyTpl = pick(pack.exampleStories[op], lessonIndex);

  const example = generateQuestion(op, grade, Math.max(0, lessonIndex - 1));
  const story = fillStory(storyTpl, Math.abs(example.a), Math.abs(example.b));

  const steps: TeachStep[] = [
    {
      kind: 'hook',
      title: skill.title,
      body: `${hookBody} ${skill.rule}`,
    },
    {
      kind: 'worked_example',
      story,
      op: example.op,
      a: example.a,
      b: example.b,
      expression: example.expression,
      answer: example.answer,
      rule: skill.rule,
    },
  ];

  const guidedCount = 3;
  for (let i = 0; i < guidedCount; i++) {
    const q = generateQuestion(op, grade, Math.max(0, lessonIndex - (i === 0 ? 1 : 0)));
    const themedPrompt =
      i === 0
        ? fillStory(pick(pack.exampleStories[op], lessonIndex + i + 1), Math.abs(q.a), Math.abs(q.b))
        : 'Solve this one:';
    steps.push({
      kind: 'guided',
      prompt: themedPrompt,
      op: q.op,
      a: q.a,
      b: q.b,
      expression: q.expression,
      answer: q.answer,
      hint: skill.hint,
    });
  }

  steps.push({
    kind: 'bridge',
    message:
      'Nice work! Next you’ll solve 10 equations. If you miss one, you’ll try that problem again — finish all 10 to master the lesson.',
  });

  return { lessonIndex, op, steps };
}
