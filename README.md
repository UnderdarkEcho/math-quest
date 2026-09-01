# Math Quest

A Duolingo/Brilliant-style web app for grades **1–12** that teaches **addition, subtraction, multiplication, and division**.

**Play:** https://underdarkecho.github.io/math-quest/

Free for homeschool families. No account. Progress stays on the device.

**Use the Home Screen icon.** Add Math Quest to the iPhone/iPad Home Screen (Share → Add to Home Screen) or Android home screen, then always open it from that icon. A regular Safari tab can forget site data after about a week. Keep a **Save backup** file on a parent phone before clearing Safari or moving to a new device. See [docs/HOMESCHOOL.md](docs/HOMESCHOOL.md).

## Features

- **Grade + skill courses** — 12 grades × 4 operations = 48 courses, 8 lessons each
- **Column arithmetic** — problems shown in vertical worksheet style (+ − × ÷)
- **Times Table Trainer** — explore a 12×12 grid and drill base facts (1×1–12×12)
- **Snap Facts** — tap-to-answer mini-game for single-digit + and − (bonds to 10, doubles, make-10)
- **Interactive teach** — themed hook, worked example with step reveal, guided practice with feedback
- **Mastery quiz** — 10 simple equations; miss one and you retry that problem; finish all 10
- **Course badges** — awarded only when every lesson is mastered
- **Genre themes** — Classic, Block World, Quest & Dice, Greek Myth, Small Business
- **Local family profiles** — several children on one iPad, IndexedDB + backup file, no cloud

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

1. Enter a name and pick a theme (or pick an existing child on **Who’s playing?**).
2. Start a course (grade + operation).
3. Complete the interactive teach, then the 10-question quiz.
4. Retry misses until you finish all 10 to unlock the next lesson.
5. Master all 8 lessons to earn the course badge.
6. Open **Profile** to change theme, switch children, save a backup, or restore one.
7. Open **Tables** to explore the chart and drill times tables.
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
- IndexedDB roster with localStorage fallback (no backend)

## Notes

Theme art is original-inspired and kid-safe — no official third-party IP logos or characters.
