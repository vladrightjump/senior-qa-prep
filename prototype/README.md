# QA Prep — Prototype

A field-guide study app for the senior automation-interview question bank. Browse
questions by topic, mark them reviewed, bookmark for later, and drill them in a
focused flash-card session. Fully responsive — desktop, tablet, and phone — with a
tweakable visual style.

---

## Running it

It's plain HTML + React (via CDN) + Babel-in-browser. No build step.

1. Open **`QA Prep Prototype.html`** in a browser, **or**
2. Open **`Mobile Preview.html`** to see it inside two phone frames (390 × 844).

> Because scripts are loaded relatively, keep the folder structure intact. If your
> browser blocks local `file://` module loads, serve the folder over any static
> server (e.g. `npx serve .` or `python3 -m http.server`).

---

## File structure

```
QA Prep Prototype.html      App shell: <head> assets, root mount, <App/> + Tweaks panel
Mobile Preview.html         Two device frames embedding the prototype (viewing aid)
tweaks-panel.jsx            Tweaks panel host protocol + control components

qa-prototype/
  proto-data.js             Question bank: GROUPS, CATS, questions, seed progress
  proto-ui.jsx              Shared bits: icons, progress ring, useReveal() hook, helpers
  proto-home.jsx            HomeScreen — greeting, "continue" card, category grid
  proto-category.jsx        CategoryScreen + TocSidebar + QuestionRow (the reading room)
  proto-focus.jsx           FocusSession — one-card-at-a-time flash-card mode

  proto-styles.css          Base design system: tokens, topbar, home
  proto-styles-2.css        Category layout, question rows, focus session
  proto-styles-notion.css   "Notion-minimal" style overrides ([data-style="notion"])
  proto-styles-modern.css   "Modern" style overrides — default ([data-style="modern"])
  proto-responsive.css      Responsive + mobile layer (see below)
  proto-anim.css            Motion layer (see below)
```

### Load order matters
Stylesheets are linked in this order so later files win the cascade:

```
proto-styles → proto-styles-2 → proto-styles-notion → proto-styles-modern → proto-anim → proto-responsive
```

### Script scope
Each `<script type="text/babel">` is transpiled in its own scope, so shared
components/helpers are published to `window` at the bottom of each file
(`Object.assign(window, { ... })`) and read off `window` elsewhere.

---

## Architecture

**State lives in `<App/>`** (in the main HTML file) and is persisted to
`localStorage` under `qa-proto-state-v1`:

| field      | meaning                                    |
|------------|--------------------------------------------|
| `reviewed` | Set of reviewed question ids               |
| `flagged`  | Set of bookmarked question ids             |
| `openIds`  | Set of expanded question ids               |
| `screen`   | `"home"` \| `"category"`                    |
| `catId`    | active category (or `"__bookmarks__"`)     |

- **Home → Category** navigation swaps the rendered screen component.
- **Focus session** mounts as a fixed overlay on top of the current screen.
- **Tweaks** (style direction, accent color, field-notes flavor) are stored by the
  Tweaks panel and applied to CSS custom properties / a `data-style` attribute.
- **Keyboard**: `/` focuses search; in a focus session `space` reveals, `1/2/3`
  grade, `→` skips, `f` bookmarks, `esc` ends.

---

## Responsive & mobile implementation

All adaptation lives in **`proto-responsive.css`** (plus a small amount of JSX for
the drawer). The desktop layout is the base; media queries layer down from there.

**Breakpoints**
- `≤ 900px` (tablet): the category **sidebar collapses into a slide-in drawer**
  with a scrim overlay, opened by a "Contents" button. Home header stacks to one
  column.
- `≤ 560px` (phone): denser type, tighter gutters, stacked search/filter controls,
  simplified question rows (the number gutter and difficulty chip are hidden), and
  a phone-sized focus card.
- `≤ 360px`: the 2-up category grid drops to a single column.

**The drawer** (markup in `proto-category.jsx`)
- `CategoryScreen` holds `sidebarOpen` state; it auto-closes on category change.
- `TocSidebar` gets an `open` class (`transform: translateX`) and a mobile header
  with a close button; an overlay (`.sidebar-overlay`) sits behind it.
- While open, the page behind it is scroll-locked (`.layout.drawer-open .main { overflow: hidden }`).

**Touch refinements** — gated behind `@media (hover: none) and (pointer: coarse)`:
- Hit targets raised to ~40–44px (nav, ToC rows, pills); invisible `::after`
  padding expands the tap area around small icons (check / bookmark / chevron).
- Search input forced to `16px` to stop iOS zoom-on-focus.
- `:active` press feedback replaces `:hover` (which never resolves on touch);
  blue tap highlight removed; contained overscroll on scroll panes.

**Notch / home-indicator** — `viewport-fit=cover` + `env(safe-area-inset-*)` padding
on the topbar, content, and focus session. A short/landscape media query keeps the
focus card usable.

---

## Motion implementation

All motion lives in **`proto-anim.css`** and is gated behind
`@media (prefers-reduced-motion: no-preference)`.

**Entrance — mount-reveal pattern (`useReveal()` in `proto-ui.jsx`).**
The key design goal: *the visible state must never depend on the animation clock.*
- A screen container gets an `in` class a tick after mount; CSS transitions stage a
  staggered fade/rise of its children. It replays whenever a screen remounts (and
  the category view re-keys on `catId`).
- A `settled` class is then applied via `setTimeout` (which fires even in a
  backgrounded/throttled tab, unlike `requestAnimationFrame`) and force-locks the
  final visible state. So if the animation timeline is ever frozen, content still
  resolves visible and is never stuck blank.

**Micro-interactions** use short keyframes with **no fill-mode**, so they always
rest on the visible base state:
- Checkmark "pop" when a question is marked reviewed.
- Bookmark "spring" when flagged.
- `:active` press response on cards and primary buttons.
- The Contents drawer and focus card slide/fade via transitions.

> Note: transitions/animations only *play* in a focused browser tab. Screenshot
> tooling freezes the clock — that's why automated captures may look mid-animation —
> but the `settled` fallback guarantees correct final rendering for real users.

---

## Customizing

- **Questions/topics**: edit `qa-prototype/proto-data.js` (`GROUPS`, `CATS`, each
  category's `questions` array with `q`, `answer` HTML, `diff`).
- **Visual style**: toggle the Tweaks panel in-app (Direction: modern / editorial /
  notion; Accent color; Field-notes flavor — only shown for editorial/notion), or
  change defaults in the `TWEAK_DEFAULTS` block in `QA Prep Prototype.html`. The
  `modern` mode is the default: a unified radius/spacing scale, calmer off-white
  surfaces, sans body text with serif retained for long answer prose, full-row
  question hover, and a cooler near-black focus stage.
- **Design tokens**: colors, fonts, and spacing are CSS custom properties at the top
  of `proto-styles.css` (and overridden for the Notion style in
  `proto-styles-notion.css`).
