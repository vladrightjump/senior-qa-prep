# QA Interview Prep — Senior Automation: Project Overview

## What it is

A browser-only study tool for senior QA Automation Engineer interviews.
143 questions across 8 categories, each with a full model answer covering
the *why* (trade-offs, anti-patterns, interviewer intent) — not just the *what*.

No backend, no accounts, no telemetry.

---

## Categories

| # | Category | Questions |
|---|---|---|
| 1 | Playwright + TypeScript | 33 |
| 2 | REST API testing | 22 |
| 3 | SQL fundamentals | 19 |
| 4 | Framework & architecture | 12 |
| 5 | CI/CD & flakiness | 18 |
| 6 | Testing theory | 14 |
| 7 | Real scenarios | 15 |
| 8 | Behavioral (STAR-format) | 14 |

---

## Tech Stack

- **React 18.3** — function components and hooks, no class components
- **TypeScript 5.6** — strict mode, `noUnusedLocals`, `noUnusedParameters`
- **Vite 5.4** — dev server with HMR, Rollup for production builds
- **Pure CSS** — custom properties for light/dark/auto theming, no UI library
- **localStorage** — Set-aware JSON serialization for progress persistence

2 runtime deps, 5 dev deps. Production bundle ≈ 50 KB gzipped.

---

## Features

- Per-category search (question text, tags, answer content)
- Difficulty filter: easy / mid / hard
- Mark-as-reviewed with persistent progress tracking
- Global progress bar + per-category progress in sidebar
- Light / dark / auto theme (follows OS preference)
- Mobile-responsive (hamburger menu under 800px)
- Print-friendly (`Cmd/Ctrl+P` → clean PDF output)
- Offline-first — no network calls after initial load

### Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus search |
| `1`–`8` | Jump to category |
| `j` / `k` | Navigate questions |
| `Space` | Toggle question open/closed |
| `r` | Mark focused question as reviewed |
| `Esc` | Unfocus search / close mobile menu |

---

## Project Structure

```
qa-app/
└── src/
    ├── App.tsx                 # App shell, state, keyboard shortcuts
    ├── components/
    │   ├── TopBar.tsx          # Progress bar, theme toggle, reset
    │   ├── Sidebar.tsx         # Category nav with per-category progress
    │   └── QuestionCard.tsx    # Expandable card with answer + tags
    ├── data/
    │   ├── questions.ts        # Assembles and exports CATEGORIES array
    │   ├── categories-1.ts     # Playwright+TS, REST API
    │   ├── categories-2.ts     # SQL, Framework architecture
    │   └── categories-3.ts     # CI/CD, Testing theory
    ├── hooks/
    │   └── useLocalStorage.ts  # Custom hook with Set-aware serialization
    └── styles/
        └── global.css          # CSS variables, layout, component styles
```

---

## Adding Content

All content lives in `src/data/` as TypeScript files. The shape is compile-time enforced:

```ts
interface Question {
  q: string;
  diff: "easy" | "mid" | "hard";
  tags?: string[];
  answer: string; // HTML string
}
```

Adding a question = appending to an array. Adding a category = defining it and
adding it to the `CATEGORIES` export — sidebar, search, and progress tracking
pick it up automatically.

---

## Deployment

Static site. Build with `npm run build`, deploy `dist/` anywhere:

- **Vercel** — `vercel` CLI, ~30 seconds to a live URL
- **Netlify** — drag-and-drop `dist/` onto app.netlify.com/drop
- **GitHub Pages** — `npx gh-pages -d dist`
- **Any static host** — S3, Cloudflare Pages, nginx, etc.

---

## License

MIT — use, fork, modify, share freely.
