# Math Quest

A Duolingo/Brilliant-style web app for grades **1–12** that teaches **addition, subtraction, multiplication, and division**.

**Play:** https://underdarkecho.github.io/math-quest/

Progress is stored in the browser on that device (not in the cloud), so use the same phone browser and skip private/incognito mode.

## Features

- **Grade + skill courses** — 12 grades × 4 operations = 48 courses, 8 lessons each
- **Column arithmetic** — problems shown in vertical worksheet style (+ − × ÷)
- **Times Table Trainer** — explore a 12×12 grid and drill base facts (1×1–12×12)
- **Snap Facts** — tap-to-answer mini-game for single-digit + and − (bonds to 10, doubles, make-10)
- **Interactive teach** — themed hook, worked example with step reveal, guided practice with feedback
- **Mastery quiz** — 10 simple equations; need **10/10** (any miss fails the run)
- **Course badges** — awarded only when every lesson is mastered at 100%
- **Genre themes** — Classic, Block World, Quest & Dice, Greek Myth, Small Business (global preference)
- **Local profile** — name, XP, badges, in-progress and completed courses in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # production build
npm run preview # preview production build
```

## How to use

1. Enter your name and pick a theme.
2. Start a course (grade + operation).
3. Complete the interactive teach, then the 10-question quiz.
4. Retry until you get **10/10** to unlock the next lesson.
5. Master all 8 lessons to earn the course badge.
6. View progress on **Profile** (change theme anytime).
7. Open **Tables** to explore the chart and drill times tables (retry misses; progress saves).
8. Open **Snap** to tap single-digit + and − facts (stars from speed; slow never fails).

## Extending

### Add a theme

1. Add a pack under `src/data/themes/packs/`.
2. Register it in `src/data/themes/index.ts`.
3. Add CSS variables under `[data-theme='your-id']` in `src/index.css`.
4. Add a mascot image in `public/themes/` and map it in `src/data/assets.ts`.
5. Extend the `ThemeId` union in `src/types.ts`.

### Add a new math topic (e.g. fractions)

1. Extend `Operation` (or introduce a broader `ContentType`) in `src/types.ts`.
2. Add difficulty rules in `src/data/difficulty.ts`.
3. Add a generator branch in `src/lib/questionGen.ts`.
4. Add skill pedagogy in `src/data/skills.ts` and theme hooks in each pack.
5. Catalog auto-builds courses from operations × grades (`GRADES` in `src/types.ts`).

## Tech

- Vite + React + TypeScript
- React Router
- CSS variables for theme skins
- localStorage only (no backend)

## Notes

Theme art is original-inspired and kid-safe — no official third-party IP logos or characters.
