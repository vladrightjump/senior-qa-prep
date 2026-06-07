# QA Interview Prep — Senior Automation: Project Overview

## What it is

A browser-only study tool for senior QA Automation Engineer interviews.
~240 questions across 18 categories (8 core + 10 specialty), each with a
full model answer covering the *why* (trade-offs, anti-patterns,
interviewer intent) — not just the *what*.

No backend, no accounts, no telemetry.

---

## Categories

**Core (8):**

| # | Category | Questions |
|---|---|---|
| 1 | Playwright + TypeScript (incl. assertion pitfalls) | 44 |
| 2 | REST API testing | 21 |
| 3 | SQL fundamentals | 19 |
| 4 | Framework & architecture | 12 |
| 5 | CI/CD & flakiness | 17 |
| 6 | Testing theory | 19 |
| 7 | Real scenarios | 15 |
| 8 | Behavioral (STAR-format) | 13 |

**Specialty (10):** TypeScript programming, GraphQL & contracts, project
structure, visual regression, feature flags, test management, testing
strategy, automation frameworks survey, API & DB integration, driving
improvements.

---

## Tech Stack

- **React 19** — function components and hooks, concurrent features
- **TypeScript 5.6** — strict mode, `noUnusedLocals`, `noUnusedParameters`
- **Vite 5.4** — dev server with HMR, Rollup for production builds
- **@react-three/fiber 9 + @react-three/drei + three** — declarative 3D scenes
  (animated progress orb in the header, interactive Knowledge Galaxy)
- **Mermaid 11** — lazy-loaded diagrams inside answer cards
- **Pure CSS** — custom properties for light/dark/auto theming, no UI library
- **localStorage** — Set-aware JSON serialization for progress persistence

---

## Features

- **🪐 Knowledge Galaxy** — interactive 3D map of all categories (R3F + drei).
  Drag to rotate, scroll to zoom, click an orb to dive in. Orb size encodes
  question count, the green ring shows progress, gold dots mark flagged items.
- **Animated 3D progress orb** in the top bar that shifts hue blue → green as
  you complete more questions.
- Per-category search (question text, tags, answer content)
- Difficulty filter: easy / mid / hard
- Mark-as-reviewed with persistent progress tracking
- Per-question notes saved locally in the browser
- Inline **Mermaid diagrams** and **media blocks** (image / video / YouTube)
  inside answer cards
- First-visit help modal + on-demand `?` shortcut
- Light / dark / auto theme (follows OS preference)
- Mobile-responsive (hamburger menu under 800px)
- Print-friendly (`Cmd/Ctrl+P` → clean PDF output, 3D + modals stripped)
- Offline-first — no network calls after initial load

### Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus search |
| `1`–`8` | Jump to category |
| `j` / `k` | Navigate questions |
| `Space` | Toggle question open/closed |
| `r` | Mark focused question as reviewed |
| `f` | Flag focused question to investigate |
| `g` | Toggle Knowledge Galaxy |
| `?` | Open help modal |
| `Esc` | Unfocus search / close mobile menu / close modal |

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
interface QuestionMedia {
  type: "image" | "video" | "youtube";
  src: string;
  caption?: string;
  alt?: string;
  poster?: string;
}

interface Question {
  q: string;
  diff: "easy" | "mid" | "hard";
  tags?: string[];
  answer: string;        // HTML string
  diagram?: string;      // Mermaid source — rendered above the answer
  media?: QuestionMedia[]; // images / clips / YouTube embeds
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
