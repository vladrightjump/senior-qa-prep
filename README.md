# QA Interview Prep — Senior Automation

A personal study app for senior QA Automation Engineer interviews. **~155 questions across 18 categories with full model answers** including TypeScript / Playwright / SQL code examples. Built as a Vite + React + TypeScript single-page app — runs in any modern browser, deploys anywhere static.

![Tech](https://img.shields.io/badge/React-18.3-61dafb?logo=react)
![Tech](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)
![Tech](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Deployment](#deployment)
- [Adding or editing questions](#adding-or-editing-questions)
- [Features](#features)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Browser support](#browser-support)
- [Architecture decisions](#architecture-decisions)

---

## What it does

A browsable, searchable interview-prep reference. Pick a category, scan questions, expand to read the model answer, mark as reviewed. Progress persists in your browser. No accounts, no servers, no telemetry.

**8 core categories:**

| # | Category | Questions | Focus |
|---|---|---|---|
| 1 | Playwright + TS | 22 | Locators, fixtures, auto-waiting, sharding, real framework code, assertion pitfalls |
| 2 | REST API testing | 13 | HTTP semantics, idempotency, schema validation, security |
| 3 | SQL fundamentals | 12 | Joins, indexes, window functions, data-integrity queries |
| 4 | Framework & architecture | 8 | POM, fixture composition, scaling test code |
| 5 | CI/CD & flakiness | 10 | GitHub Actions, sharding, flake reduction, metrics |
| 6 | Testing theory | 12 | Verification vs validation, coverage, mutation testing, ISTQB principles |
| 7 | Real scenarios | 10 | P0 incidents, stakeholder pushback, escape rate |
| 8 | Behavioral | 9 | STAR-format answers with concrete patterns |

**Plus 10 specialty categories** — TypeScript programming, GraphQL & contracts, project structure, visual regression, feature flags, test management, testing strategy, automation frameworks survey, API & DB integration, driving improvements.

Every answer includes the *why* — trade-offs, anti-patterns, what interviewers are signaling for — not just the *what*.

---

## Tech stack

### Runtime
- **[React 19.2](https://react.dev/)** — UI library. Function components and hooks throughout, no class components.
- **[TypeScript 5.6](https://www.typescriptlang.org/)** — strict mode enabled. `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on.
- **HTML5 + CSS3** — no UI library. Pure CSS with custom properties for theming.

### Build & tooling
- **[Vite 5.4](https://vitejs.dev/)** — dev server with HMR (~50ms hot reload), production bundler.
- **[@vitejs/plugin-react 4.3](https://github.com/vitejs/vite-plugin-react)** — React fast refresh.
- **No bundler runtime overhead** — Vite uses native ES modules in dev, Rollup for production builds.

### Storage
- **localStorage** — progress persistence. Set-aware JSON serialization (custom replacer/reviver) for storing reviewed/open question IDs.

### What's intentionally NOT included
- No Tailwind, no styled-components, no CSS-in-JS — handwritten CSS with CSS variables. Smaller bundle, faster first paint, easier to theme.
- No state management library (Redux, Zustand, etc.) — React's built-in `useState` and a custom `useLocalStorage` hook handle everything.
- No router — single-page UI, category selection is local state. Adding `react-router` later is straightforward if needed.
- No testing framework — this is a study tool, not production code. Adding Vitest takes one `npm install` if you want to add tests.
- No backend — pure static site. No database, no API, no auth.

### Dependencies summary

```json
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
},
"devDependencies": {
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  "@vitejs/plugin-react": "^4.3.4",
  "typescript": "^5.6.3",
  "vite": "^5.4.11"
}
```

**That's it.** Two runtime deps, five dev deps. Production bundle ≈ 50 KB gzipped.

---

## Project structure

```
qa-app/
├── index.html              # Vite entry point
├── package.json            # 2 runtime + 5 dev dependencies
├── vite.config.ts          # Vite configuration (base: "./" for portable deploys)
├── tsconfig.json           # Strict TypeScript settings
├── tsconfig.node.json      # Separate config for Vite's Node-side code
├── vercel.json             # Vercel deploy hints (auto-detected anyway)
├── .gitignore
├── README.md
└── src/
    ├── main.tsx            # React 19 createRoot entry
    ├── App.tsx             # Main app shell, state, keyboard shortcuts
    ├── types/
    │   └── index.ts        # Shared TypeScript types (Question, Category, Theme, etc.)
    ├── components/
    │   ├── TopBar.tsx      # Sticky header with progress bar, theme toggle, reset
    │   ├── Sidebar.tsx     # Category nav with per-category progress
    │   └── QuestionCard.tsx # Expandable question card with answer + tags
    ├── data/
    │   ├── questions.ts    # Assembles all categories, exports CATEGORIES array
    │   ├── categories-1.ts # Playwright+TS, REST API
    │   ├── categories-2.ts # SQL, Framework architecture
    │   └── categories-3.ts # CI/CD, Testing theory
    ├── hooks/
    │   └── useLocalStorage.ts # Custom hook with Set-aware serialization
    └── styles/
        └── global.css      # CSS variables, layout, all component styles
```

---

## Getting started

### Prerequisites

- **Node.js 18+** (Vite 5 requires Node 18 or higher)
- **npm** (comes with Node) or **pnpm** / **yarn** if preferred

### Install

```bash
cd qa-app
npm install
```

This installs the seven dependencies and creates `node_modules/` (~80 MB, mostly TypeScript and Vite tooling).

### Run in development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173) with HMR — edit a question and it updates without page reload.

### Build for production

```bash
npm run build
```

Outputs to `dist/`. Production-ready static files: HTML, CSS, JS. Total size ~150 KB uncompressed, ~50 KB gzipped.

### Preview the production build

```bash
npm run preview
```

Serves `dist/` on a local port — final sanity check before deploying.

### Type-check

The build command runs `tsc -b && vite build`, so type errors will fail the build. To run TypeScript alone:

```bash
npx tsc --noEmit
```

---

## Deployment

The project is a static site — deploy it anywhere that serves HTML/CSS/JS files.

### Option 1 — Vercel (recommended, no git required)

```bash
npm install -g vercel
cd qa-app
vercel
```

Pick defaults at the prompts. You'll get a URL like `qa-prep-yourname.vercel.app` in ~30 seconds. Re-run `vercel` after edits to redeploy.

If you connect a git repo to Vercel later, every `git push` auto-deploys.

### Option 2 — Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop) — no CLI needed.

### Option 3 — GitHub Pages

```bash
npm run build
# Push the dist/ folder to a gh-pages branch, or use:
npx gh-pages -d dist
```

### Option 4 — Any static host

Build with `npm run build`, upload `dist/` contents to any web server (S3, Cloudflare Pages, your own nginx, etc.). Because `vite.config.ts` uses `base: "./"`, the build works at any path or subdomain.

---

## Adding or editing questions

All content lives in TypeScript files under `src/data/`. The shape is enforced at compile time:

```ts
interface Question {
  q: string;                              // The question text
  diff: "easy" | "mid" | "hard";          // Difficulty badge
  tags?: string[];                        // Tags shown next to the question
  answer: string;                         // HTML model answer (supports <p>, <ul>, <code>, <pre>)
}

interface Category {
  id: string;                             // Stable identifier (used for state keys)
  label: string;                          // Sidebar label
  desc: string;                           // Subtitle shown under the heading
  questions: Question[];
}
```

### To add a question to an existing category

Open the relevant `categories-N.ts` file, find the category const (e.g. `playwrightTS`), append to its `questions` array:

```ts
{
  q: "How do you handle a date/time picker in tests?",
  diff: "mid",
  tags: ["playwright", "time"],
  answer: `<p>Use Playwright's clock API:</p>
<pre class="code"><code>await page.clock.install({ time: '2026-05-06T10:00:00Z' });</code></pre>`,
},
```

### To add a new category

1. Define the category in `questions.ts` or one of the `categories-N.ts` files:

```ts
const security: Category = {
  id: "security",
  label: "Security testing",
  desc: "OWASP Top 10, auth flows, common vulnerabilities",
  questions: [/* ... */],
};
```

2. Add it to the `CATEGORIES` export at the bottom of `questions.ts`:

```ts
export const CATEGORIES: Category[] = [
  ...PART_1_CATEGORIES,
  ...PART_2_CATEGORIES,
  ...PART_3_CATEGORIES,
  scenarios,
  behavioral,
  security,  // ← new
];
```

3. The sidebar, search, filters, and progress tracking all pick it up automatically.

### Answer formatting

The `answer` field is HTML rendered via `dangerouslySetInnerHTML`. Supported elements:

- `<p>` — paragraphs
- `<ul>`, `<ol>`, `<li>` — lists
- `<strong>`, `<em>` — emphasis
- `<code>` — inline code (gets a subtle background)
- `<pre class="code"><code>...</code></pre>` — code blocks (dark theme, syntax-friendly)
- `<table>`, `<tr>`, `<td>`, `<th>` — tables (already styled)
- `<blockquote>` — quotes

For code snippets, escape angle brackets: `&lt;` and `&gt;`. The TypeScript file uses template literals with backticks, so backslashes inside code need to be escaped as `\\`.

---

## Features

- **~155 senior-level questions** across 18 categories (8 core + 10 specialty) — curated for actual study, not breadth-for-breadth's-sake
- **Per-category search** — searches question text, tags, and answer content
- **Difficulty filter** — easy / mid / hard
- **Mark-as-reviewed** — checkbox on each question, persists in localStorage
- **Progress tracking** — top bar shows global progress, sidebar shows per-category
- **Light / dark / auto theme** — auto follows OS preference, override available
- **Mobile-responsive** — hamburger menu under 800px, full-feature on phone
- **Keyboard shortcuts** — see below
- **Print-friendly** — `Cmd/Ctrl+P` produces a clean PDF-style output
- **Reset button** — clears progress (with confirmation)
- **Offline-first** — once loaded, no network calls

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus search field |
| `1` – `8` | Jump to category by number |
| `j` / `k` | Move focus down / up through visible questions |
| `Space` | Toggle the focused question open/closed |
| `r` | Mark the focused question as reviewed |
| `Esc` | Unfocus search / close mobile menu |

Shortcuts ignore key presses while typing in the search field (except `Esc`, which unfocuses).

---

## Browser support

Tested on:
- Chrome / Edge (current version)
- Firefox (current version)
- Safari 16+
- Mobile Safari (iOS 16+)
- Chrome Android

Uses modern features: CSS custom properties, Set/Map, async/await, ES modules. Won't work in IE11 (and won't be made to).

---

## Architecture decisions

A few non-obvious choices and the reasoning:

### Why no Tailwind?

Pure CSS with custom properties gives faster first paint, smaller bundle, and clean theming via `[data-theme="dark"]` selector. The whole stylesheet is ~370 lines — small enough to read end-to-end. Tailwind would add a build step, more deps, and a longer learning curve for whoever inherits this.

### Why no state library?

The app has ~5 pieces of state: active category, reviewed IDs, open IDs, search, theme. React's `useState` + a localStorage hook handles it without ceremony. Adding Redux would be over-engineering.

### Why split data into `categories-1/2/3.ts`?

Each file is reviewable in one screen of code. Splitting also reduces any single file's TypeScript compilation time, which speeds up Vite's HMR when editing questions.

### Why use HTML strings for answers (`dangerouslySetInnerHTML`) instead of MDX or React components?

The answers are mostly static prose with code blocks. HTML strings are simpler than MDX (no extra build step, no JSX inside data), faster to author than React components, and the security risk is zero because all content is authored by the maintainer — no user input ever flows through.

### Why `base: "./"` in vite.config.ts?

Lets the built site work at any URL — root domain, subpath, file:// protocol. Trade-off: deeper routes don't work without a server config, but this app has no routes.

### Why Set instead of Array for reviewed/open IDs?

O(1) `has()` lookup. With ~155 questions × hundreds of expand/collapse toggles per session, array search would noticeably affect frame rate. Custom JSON serialization handles persistence.

---

## License

MIT — use, fork, modify, share. No attribution required.
