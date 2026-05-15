# Authentication — Setup & Best Practices

The app uses **Supabase Auth** with **email + password** for sign-in/up and
**password reset by email**. Sessions are short-lived JWTs auto-refreshed by
the SDK; tokens are stored in `localStorage` and the SDK uses the **PKCE
flow** to obtain them (best practice for browser SPAs).

## 1. Supabase project setup

In the Supabase dashboard:

1. **Auth → Providers**: enable "Email" provider. Disable any provider you
   don't intend to use.
2. **Auth → Email**: turn **"Confirm email"** ON. This forces email
   verification before the user can sign in.
3. **Auth → URL Configuration**: add your production URL (e.g.
   `https://qa-prep.example.com`) and `http://localhost:5173` to **Site URL**
   and **Redirect URLs**. These are used for the email confirmation and
   password-reset links.
4. **Auth → Policies**:
   - Password minimum length: **12** (matches `PASSWORD_MIN_LENGTH` in
     `src/auth/AuthContext.tsx`). The client also enforces a 3-of-4
     character-class rule via `assessPassword()`.
   - Leak protection: **ON**.
   - Captcha: **enable** for production. The app supports **Cloudflare
     Turnstile** out of the box (see §6).
5. **Auth → Rate limits**: keep the defaults or tighten further. Supabase
   already throttles `/token`, `/signup`, `/recover` endpoints.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...   # anon (public) key — safe to ship
```

> **Never** put the `service_role` key in a `VITE_*` variable. Anything
> prefixed with `VITE_` is bundled into the client JavaScript.

## 3. Database schema + Row Level Security

Run this SQL once in **Supabase → SQL Editor**. It adds a `user_id` column to
every per-user table and locks them down with RLS so a user can only read or
write their own rows.

```sql
-- ---------- qa_reviewed ----------
alter table public.qa_reviewed
  add column if not exists user_id uuid
    references auth.users (id) on delete cascade
    default auth.uid() not null;

create unique index if not exists qa_reviewed_user_question_uq
  on public.qa_reviewed (user_id, question_id);

alter table public.qa_reviewed enable row level security;

create policy "qa_reviewed: read own"
  on public.qa_reviewed for select
  using (auth.uid() = user_id);

create policy "qa_reviewed: insert own"
  on public.qa_reviewed for insert
  with check (auth.uid() = user_id);

create policy "qa_reviewed: delete own"
  on public.qa_reviewed for delete
  using (auth.uid() = user_id);

-- ---------- qa_flags ----------
alter table public.qa_flags
  add column if not exists user_id uuid
    references auth.users (id) on delete cascade
    default auth.uid() not null;

create unique index if not exists qa_flags_user_question_uq
  on public.qa_flags (user_id, question_id);

alter table public.qa_flags enable row level security;

create policy "qa_flags: read own"
  on public.qa_flags for select
  using (auth.uid() = user_id);

create policy "qa_flags: insert own"
  on public.qa_flags for insert
  with check (auth.uid() = user_id);

create policy "qa_flags: delete own"
  on public.qa_flags for delete
  using (auth.uid() = user_id);

-- ---------- qa_comments ----------
alter table public.qa_comments
  add column if not exists user_id uuid
    references auth.users (id) on delete cascade
    default auth.uid() not null;

alter table public.qa_comments enable row level security;

create policy "qa_comments: read own"
  on public.qa_comments for select
  using (auth.uid() = user_id);

create policy "qa_comments: insert own"
  on public.qa_comments for insert
  with check (auth.uid() = user_id);

create policy "qa_comments: update own"
  on public.qa_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "qa_comments: delete own"
  on public.qa_comments for delete
  using (auth.uid() = user_id);

-- ---------- realtime ----------
-- Realtime broadcasts respect RLS automatically; nothing extra to do.
```

If the upsert/onConflict clauses in `useQuestionMeta.ts` need to scope to
`(user_id, question_id)`, the unique indexes above support it.

## 4. Best-practice checklist (what the app does)

| Area | Implementation |
|---|---|
| Flow type | **PKCE** (`flowType: 'pkce'` in `lib/supabase.ts`) |
| Token storage | `localStorage` via SDK (SPA-appropriate; protected by RLS, not by storage location) |
| Token refresh | Automatic (`autoRefreshToken: true`) |
| Session persistence | `persistSession: true` |
| Email/URL exchange | `detectSessionInUrl: true` for confirmation + reset |
| Password min length | **12 chars** + 3-of-4 character-class rule (lowercase, uppercase, digits, symbols) via `assessPassword()`; mirrored server-side in Supabase Auth → Policies |
| Email enumeration | Generic error message ("Invalid email or password.") |
| Rate-limit messaging | Friendly throttle message when Supabase returns 429 |
| Sign-out everywhere | `signOut({ scope: 'global' })` in user menu |
| Service-role key | **Never** sent to the client |
| RLS | Enforced on every per-user table |
| CSRF | N/A — JWT bearer auth, not cookie auth |

## 5. Production hardening (recommended)

- **Captcha** — wired (see §6). Enable the Supabase-side enforcement too.
- **MFA** — Supabase supports TOTP enrollment; surface in a settings page.
- **CSP** — shipped via `vercel.json` `headers`. Restricts `connect-src` to
  `*.supabase.co` (plus `challenges.cloudflare.com` for Turnstile), blocks
  framing, enables HSTS, and adds a strict `Permissions-Policy`.
- **Anomaly detection** — Supabase logs auth events; ship them to a SIEM if
  the app handles sensitive data.
- **Account deletion** — implemented as a Supabase Edge Function at
  `supabase/functions/delete-account` and exposed in the user menu behind a
  typed-confirmation prompt. Deploy with:
  ```bash
  supabase functions deploy delete-account
  ```
  `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are injected automatically;
  set `ALLOWED_ORIGIN` to your production origin to lock down CORS.

## 6. Captcha (Cloudflare Turnstile)

The app ships with Turnstile support that activates only when the
`VITE_TURNSTILE_SITE_KEY` env var is set. Steps:

1. Create a Turnstile site at <https://dash.cloudflare.com/?to=/:account/turnstile>
   and copy the **site key** + **secret key**.
2. Add `VITE_TURNSTILE_SITE_KEY=...` to `.env.local` (and to Vercel project
   settings for production).
3. In Supabase: **Auth → Settings → Bot and Abuse Protection** → enable
   Turnstile and paste the **secret key**.
4. Done. `signUp`, `signInWithPassword`, and `resetPasswordForEmail` now
   include a fresh captcha token on every submit. The widget is rendered
   invisibly via `src/auth/captcha.ts`.

When the env var is unset (local dev) the captcha module is a no-op and
auth flows proceed without a token.
