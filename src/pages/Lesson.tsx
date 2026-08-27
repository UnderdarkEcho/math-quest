import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ColumnEquation } from '../components/ColumnEquation';
import { TeachFlow } from '../components/teach/TeachFlow';
import { useProfile } from '../context/ProfileContext';
import { getCourse } from '../data/catalog';
import { checkAnswer, computeAnswer } from '../lib/answers';
import { buildLessonTeach } from '../lib/lessonContent';
import { isLessonUnlocked } from '../lib/progress';
import { generateQuiz } from '../lib/questionGen';
import { QUIZ_LENGTH, type Question } from '../types';

type Phase = 'teach' | 'quiz' | 'results';

export function Lesson() {
  const { courseId, lessonIndex: lessonIndexStr } = useParams();
  const lessonIndex = Number(lessonIndexStr);
  const { profile, completeLessonMastery, recordPracticeXp } = useProfile();
  const navigate = useNavigate();

  const meta = courseId ? getCourse(courseId) : undefined;
  const progress = profile?.courses.find((c) => c.courseId === courseId);

  const teach = useMemo(() => {
    if (!meta || !profile || Number.isNaN(lessonIndex)) return null;
    return buildLessonTeach(meta.operation, meta.grade, lessonIndex, profile.themeId);
  }, [meta, profile, lessonIndex]);

  const skipTeach = profile?.showTutorials === false && meta && !Number.isNaN(lessonIndex);
  const [phase, setPhase] = useState<Phase>(skipTeach ? 'quiz' : 'teach');
  const [questions, setQuestions] = useState<Question[]>(() =>
    skipTeach ? generateQuiz(meta.operation, meta.grade, lessonIndex, QUIZ_LENGTH) : [],
  );
  const [qIndex, setQIndex] = useState(0);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [solvedCount, setSolvedCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [badgeAwarded, setBadgeAwarded] = useState<string | null>(null);
  const [newlyMastered, setNewlyMastered] = useState(false);

  if (!profile || !courseId || !meta || !progress || Number.isNaN(lessonIndex)) {
    return <Navigate to="/select" replace />;
  }
  if (lessonIndex < 0 || lessonIndex >= meta.lessonCount) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }
  if (!isLessonUnlocked(progress, lessonIndex)) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  const startQuiz = () => {
    setQuestions(generateQuiz(meta.operation, meta.grade, lessonIndex, QUIZ_LENGTH));
    setQIndex(0);
    setValue('');
    setFeedback('idle');
    setSolvedCount(0);
    setMistakeCount(0);
    setBadgeAwarded(null);
    setNewlyMastered(false);
    setPhase('quiz');
  };

  const current = questions[qIndex];

  const finishSuccess = (finalSolved: number) => {
    // XP for each problem eventually solved; small nod if no mistakes
    recordPracticeXp(finalSolved + (mistakeCount === 0 ? 2 : 0));
    const result = completeLessonMastery(courseId, lessonIndex);
    setNewlyMastered(result.newlyMastered);
    setBadgeAwarded(result.badgeAwarded);
    setSolvedCount(finalSolved);
    setPhase('results');
  };

  const submitAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (!current || feedback !== 'idle') return;
    const result = checkAnswer(value, current.op, current.a, current.b);
    if (result.user === null) return;

    if (result.ok) {
      setFeedback('ok');
      const nextSolved = solvedCount + 1;
      setSolvedCount(nextSolved);
      window.setTimeout(() => {
        if (qIndex + 1 >= QUIZ_LENGTH) {
          finishSuccess(nextSolved);
        } else {
          setQIndex((i) => i + 1);
          setValue('');
          setFeedback('idle');
        }
      }, 450);
    } else {
      // Wrong: show brief feedback, then retry the same question (progress kept)
      setFeedback('bad');
      setMistakeCount((m) => m + 1);
      window.setTimeout(() => {
        setValue('');
        setFeedback('idle');
      }, 900);
    }
  };

  return (
    <div className="stack">
      <div className="row">
        <div>
          <p className="muted" style={{ margin: 0 }}>
            {meta.title}
          </p>
          <h1 style={{ fontSize: '1.4rem' }}>Lesson {lessonIndex + 1}</h1>
        </div>
        <Link to={`/course/${courseId}`} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
          Exit
        </Link>
      </div>

      {phase === 'teach' && teach && <TeachFlow teach={teach} onComplete={startQuiz} />}

      {phase === 'quiz' && current && (
        <div className="card">
          <div className="row" style={{ marginBottom: '0.75rem' }}>
            <strong>
              Question {qIndex + 1} / {QUIZ_LENGTH}
            </strong>
            <span className="chip">
              {solvedCount} solved · finish all {QUIZ_LENGTH}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(solvedCount / QUIZ_LENGTH) * 100}%` }}
            />
          </div>

          <div aria-live="polite">
            <ColumnEquation
              a={current.a}
              b={current.b}
              op={current.op}
              answer={feedback === 'ok' ? computeAnswer(current.op, current.a, current.b) : null}
              showBlank={feedback !== 'ok'}
            />
          </div>

          {feedback === 'ok' && <div className="feedback ok">Correct!</div>}
          {feedback === 'bad' && (
            <div className="feedback bad">Not quite — try this one again.</div>
          )}

          {feedback === 'idle' && (
            <form onSubmit={submitAnswer} className="stack">
              <label className="sr-only" htmlFor="quiz-answer">
                Answer
              </label>
              <input
                id="quiz-answer"
                className="input input-lg"
                inputMode="text"
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
                Check
              </button>
            </form>
          )}
        </div>
      )}

      {phase === 'results' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="hero-mascot" style={{ fontSize: '2.5rem' }} aria-hidden>
            🎉
          </div>
          <h2>Lesson complete!</h2>
          <p>
            You solved all {QUIZ_LENGTH} problems
            {mistakeCount > 0 ? ` (${mistakeCount} retry${mistakeCount === 1 ? '' : 'ies'})` : ' with no mistakes'}
            {newlyMastered ? ' · Mastery bonus XP earned' : ' · Already mastered'}
          </p>
          {badgeAwarded && (
            <div className="feedback ok">Course badge unlocked!</div>
          )}
          <div className="footer-actions row-md">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Back to path
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
