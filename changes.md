# Changes Log

A summary of the last two iterations on the QA Interview Prep app.

---

## Iteration 1 — Testing suite + CI pipeline

**Goal:** add a layer of confidence with automated unit tests and a CI
pipeline that gates every push / pull request.

### Tooling added

- **Vitest 4** — Vite-native test runner, jest-compatible API
- **@testing-library/react** + **@testing-library/user-event** — component
  and user-interaction testing
- **@testing-library/jest-dom** — fluent DOM matchers (`toBeInTheDocument`,
  `toBeDisabled`, …)
- **jsdom** — browser-like environment for component tests
- **@vitest/coverage-v8** — coverage reporting

### Configuration

- `vite.config.ts` — switched to `defineConfig` from `vitest/config`; added
  a `test` block with jsdom, global setup file, coverage settings, and
  excludes for 3D + data fixtures
- `src/test/setup.ts` — registers jest-dom matchers, polyfills `matchMedia`
  and `scrollIntoView` for jsdom, auto-cleans the DOM and `localStorage`
  between tests
- `package.json` scripts:
  - `npm run typecheck` — `tsc -p tsconfig.json --noEmit`
  - `npm test` — single-shot Vitest run
  - `npm run test:watch` — watch mode
  - `npm run test:coverage` — coverage report

### Test files (7 files, 43 tests)

| File | Tests | Scope |
|---|---|---|
| `src/hooks/__tests__/useLocalStorage.test.ts` | 6 | Initial value, persistence, Set serialization (including nested), corrupt-JSON fallback, functional updates |
| `src/data/__tests__/integrity.test.ts` | 6 | Unique question + category IDs, required fields, valid difficulty enum, well-formed media |
| `src/components/__tests__/MediaBlock.test.tsx` | 7 | Image / video / YouTube rendering, URL parsing (full, short, raw 11-char ID), malformed input handling |
| `src/components/__tests__/HelpModal.test.tsx` | 6 | Open/close, backdrop vs body click isolation, Esc key, CTAs |
| `src/components/__tests__/Sidebar.test.tsx` | 4 | Renders categories + investigation entry, progress counts, selection callbacks |
| `src/components/__tests__/TopBar.test.tsx` | 5 | Counter rendering, % calculation (incl. divide-by-zero), pill toggle state, all callbacks |
| `src/components/__tests__/QuestionCard.test.tsx` | 9 | Expand/collapse, reviewed/flag callbacks (event bubbling isolated), comment submit, disabled state, diagram + media branches |

### Test infrastructure choices

- **R3F mocked at module boundary** — `ProgressOrb` is stubbed in TopBar
  tests because jsdom has no WebGL context. Keeps tests fast and
  deterministic.
- **Mermaid stubbed** — heavy ESM import; replaced with a `data-testid`
  stub in QuestionCard tests.
- **Cleanup between tests** — `cleanup()` and `localStorage.clear()` in
  `afterEach` to prevent cross-test bleed.

### CI pipeline — `.github/workflows/ci.yml`

Runs on push + PR to `main`/`master`, with concurrency cancellation:

1. Checkout
2. Setup Node (**matrix: 20 & 22**), npm cache keyed by lockfile
3. `npm ci`
4. **Typecheck** (hard fail)
5. **Lint** (`continue-on-error: true` — no eslint config yet; flip later)
6. **Tests** (verbose reporter)
7. **Coverage** on Node 20, uploaded as artifact
8. **Production build**, `dist/` uploaded as artifact

### Files changed

```
M  vite.config.ts          # vitest config block
M  package.json            # scripts + devDependencies
M  package-lock.json
M  .gitignore              # coverage/
?? .github/workflows/ci.yml
?? src/test/setup.ts
?? src/hooks/__tests__/useLocalStorage.test.ts
?? src/data/__tests__/integrity.test.ts
?? src/components/__tests__/MediaBlock.test.tsx
?? src/components/__tests__/HelpModal.test.tsx
?? src/components/__tests__/Sidebar.test.tsx
?? src/components/__tests__/TopBar.test.tsx
?? src/components/__tests__/QuestionCard.test.tsx
```

### Verification

- `npm run typecheck` ✓
- `npm test` → **43/43 tests, ~1.3 s**
- `npm run build` ✓

---

## Iteration 2 — Authentication (Supabase email + password)

**Goal:** sign-in/up + password reset using Supabase Auth, following
industry best practices, without breaking the guest (local-only) experience.

### Best practices implemented

| Concern | Implementation |
|---|---|
| Auth flow | **PKCE** (`flowType: 'pkce'` — best practice for browser SPAs) |
| Token storage | `localStorage` via SDK, protected by RLS not by storage choice |
| Token refresh | Automatic (`autoRefreshToken: true`) |
| Session bootstrap | `persistSession: true`, `detectSessionInUrl: true` for email links |
| Password min length | 8 chars enforced client-side + server-side |
| Email enumeration | Generic "Invalid email or password" — never leaks which field is wrong |
| Rate limit messaging | Friendly "Too many attempts" message on 429 |
| Sign-out everywhere | `signOut({ scope: 'global' })` exposed in the user menu |
| Service-role key | **Never** sent to the client (anon key only in `VITE_*`) |
| Row Level Security | Documented SQL migration adds `user_id` + per-user policies on every table |
| CSRF | N/A — JWT bearer auth, not cookie auth |

### Files added

```
src/auth/AuthContext.tsx    # <AuthProvider/>, useAuth() hook, error normalization
src/auth/SignInModal.tsx    # sign-in / sign-up / reset-password modal
src/auth/UserMenu.tsx       # avatar chip + dropdown ("Sign out", "Sign out everywhere")
AUTH.md                     # setup guide: Supabase dashboard config, RLS SQL, hardening checklist
src/auth/__tests__/AuthContext.test.tsx
src/auth/__tests__/SignInModal.test.tsx
```

### Files modified

- `src/lib/supabase.ts` — enabled PKCE, `persistSession`, `autoRefreshToken`,
  `detectSessionInUrl` (was `persistSession: false`)
- `src/main.tsx` — wrapped `<App>` in `<AuthProvider>`
- `src/components/TopBar.tsx` — added `<UserMenu>` and an `onOpenSignIn` prop
- `src/App.tsx` — added `signInOpen` state + `<SignInModal>` mount, threaded
  `onOpenSignIn` through TopBar
- `src/hooks/useQuestionMeta.ts` — keyed off `user.id`; when not signed in,
  returns empty state and skips DB calls (preserves guest mode)
- `src/styles/global.css` — auth UI styles (tabs, form fields, alerts,
  user chip, dropdown)

### `AuthContext` API

```ts
interface AuthContextValue {
  status: "loading" | "authenticated" | "anonymous";
  user: User | null;
  session: Session | null;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string): Promise<AuthResult>;
  signOut(everywhere?: boolean): Promise<void>;
  resetPassword(email: string): Promise<AuthResult>;
}
```

- Bootstraps session from `localStorage` on mount
- Subscribes to `onAuthStateChange` for sign-in / sign-out / token refresh
- Throws if `useAuth()` is called outside `<AuthProvider>`
- All Supabase errors run through `normalizeError()` — generic, non-leaky

### `SignInModal` features

- Tabs for **Sign in** vs **Sign up**
- "Forgot your password?" link switches to reset mode (no password field)
- Inline error and info alerts (`role="alert"` / `role="status"`)
- Auto-closes when `status` flips to `authenticated`
- "Continue as guest (local-only)" link keeps the existing UX intact
- Escape closes the modal

### `useQuestionMeta` changes

- Now reads `user` and `status` from `useAuth()`
- Skips network calls entirely when `status !== 'authenticated'`
- Realtime channel only subscribes for signed-in users
- Effect dependencies updated to re-run on `userId` change (so swapping
  accounts cleanly reloads state)

### Documentation — `AUTH.md`

End-to-end setup guide covering:

1. Supabase dashboard configuration (Email provider, confirm-email, redirect
   URLs, password policy, captcha, rate limits)
2. Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   with a callout about never shipping `service_role`
3. **SQL migration** — adds `user_id uuid` (default `auth.uid()`) and RLS
   policies on `qa_reviewed`, `qa_flags`, `qa_comments`, plus per-user
   unique indexes for upserts
4. Best-practice checklist (what the app already does)
5. Production hardening (captcha, MFA/TOTP, CSP header, anomaly detection,
   GDPR account deletion via Edge Function)

### Tests added (17 new, **60 total**)

**`auth/__tests__/AuthContext.test.tsx`** (8 tests)
- Starts in `loading`, resolves to `anonymous` when no session
- Becomes `authenticated` when a session is emitted
- Returns to `anonymous` on sign-out
- `useAuth()` throws outside `<AuthProvider>`
- "Invalid login credentials" normalized to generic message
- `signUp` rejects short passwords without calling Supabase
- `signUp` reports `needsConfirmation` when Supabase returns no session
- `signOut(true)` passes `scope: 'global'` through to Supabase

**`auth/__tests__/SignInModal.test.tsx`** (9 tests)
- Renders nothing when closed
- Renders sign-in form by default
- Calls `signIn` with entered credentials
- Surfaces signIn errors in the alert region
- Tab switching to sign-up calls `signUp` with new credentials
- Confirmation message shown when `needsConfirmation` is true
- Reset-password mode hides the password field
- Auto-closes when status flips to `authenticated`
- "Continue as guest" closes the modal

Existing TopBar tests updated to stub the new `UserMenu` (which touches
AuthContext) and to provide the new `onOpenSignIn` prop.

### Verification

- `npm run typecheck` ✓
- `npm test` → **60/60 tests, ~1.8 s**
- `npm run build` ✓

### One-time user action required

In the Supabase dashboard:
1. **Auth → Email**: enable provider, turn on "Confirm email"
2. **Auth → URL Configuration**: add prod URL and `http://localhost:5173`
3. Run the SQL from `AUTH.md §3` in the SQL Editor

After that: sign-up → confirm email → sign in, and the existing
reviewed/flag/notes UI automatically syncs per user.
