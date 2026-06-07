# Project Audit — QA Interview Prep

Written from the perspective of someone using this app to actually become a
senior QA, not to maintain it as a side project. Honest, blunt, no PR-speak.

Three Explore agents read every category file end-to-end. This document
synthesises what they found into: **what makes sense, what doesn't, what's
missing.**

---

## 1. TL;DR

The corpus has grown from the original "143 questions / 8 categories" to
**~275 questions across 20 categories**, but the README, OVERVIEW and
TEST_PLAN all still claim the old numbers. Surface area expanded faster than
focus.

Strongest parts: **Playwright + TS** (38 Qs, near best-in-class), **REST API
auth/security** (32 Qs, strong on IDOR/OAuth/JWT), **SQL fundamentals**
(17 Qs, solid on joins/windows/EXPLAIN), and **Real Scenarios + Behavioral**
(28 Qs, useful "soft signal" prep).

Weakest parts: **no dedicated ISTQB path** (terminology is scattered, no
glossary, no formal techniques as a unit), **no dedicated automation-depth
path** (you can name tools but never *design* a framework from scratch in
the corpus), **3-4 categories that overlap or dilute the senior signal**,
and **5 entirely-missing senior domains** (accessibility, mobile, security
beyond auth, perf + observability, chaos/resilience).

If the goal is to study for senior QA roles in the EU / automotive /
regulated space, the gap is real and the user's gut feeling — "too wide,
too bright" — is correct.

---

## 2. The corpus as it actually is

| File | Categories (Qs) | Total |
|---|---|---|
| `categories-1.ts` | Playwright + TS (38), REST API (32) | 70 |
| `categories-2.ts` | SQL (17), Framework Architecture (12) | 29 |
| `categories-3.ts` | CI/CD & Flakiness (15), Testing Theory (22) | 37 |
| `categories-4.ts` | TS Programming (11), GraphQL & Contracts (8), Project Structure (8), Visual Regression (7), Feature Flags (6), Tricky Assertions (11), Programming Fundamentals (9) | 60 |
| `categories-growth.ts` | Test Management (11), Testing Strategy (10), Automation Frameworks (10), API & DB Testing (10), Driving Improvements (10) | 51 |
| `questions.ts` | Real Scenarios (15), Behavioral (13) | 28 |
| **Total** | **20 categories** | **~275** |

Difficulty mix (sampled): roughly 10% easy, 50% mid, 40% hard. That's
appropriate for senior prep but means there are very few low-friction
"warm-up" passes.

---

## 3. What makes sense — keep

### 3.1 Playwright + TS (cat-1, 38 Qs) — keep, light pruning

Best category in the corpus. Clear progression from locators → fixtures →
auto-waiting → fixtures composition → parallelism → CI patterns. Includes
real anti-patterns. The hard Qs (data isolation across 8 workers, sharding
40→10min, custom matchers) genuinely distinguish senior from mid.

What's missing here, ranked by impact:

1. **Component testing** (Playwright's CT mode). Increasingly asked for
   in interviews.
2. **Accessibility queries deep dive** — `getByRole` exists but
   no question on WCAG / ARIA / screen-reader-driven assertions.
3. **Mobile / responsive testing.** One mention of `devices['iPhone 13']`,
   nothing on touch events, orientation, viewport-specific bugs.

### 3.2 REST API (cat-1, 32 Qs) — keep, deepen auth

Strong on status code semantics, IDOR, OAuth 2.0 + PKCE, JWT, rate
limiting, webhooks. The "race condition: seat booking" Q (Q13) is excellent.

Gaps that hurt for senior roles:

- **OIDC** (vs OAuth) — interviewer differentiator, not covered.
- **mTLS, API keys, SAML** — enterprise auth, not covered.
- **ETags / conditional requests** — caching + optimistic locking, not
  covered.
- **Problem+JSON (RFC 7807) / error envelopes** — not covered.
- **Multipart file upload, bulk operations** — not covered.

### 3.3 SQL (cat-2, 17 Qs) — keep, add 2-3

Solid coverage of joins, indexes, EXPLAIN, window functions (RANK,
ROW_NUMBER, running totals), N+1, ACID. The "find data drift between
order totals and line items" Q is a great senior-grade scenario.

Gaps:

- **LAG / LEAD / FIRST_VALUE** — common in interviews, not covered.
- **Deadlock detection + isolation level differences** — ACID is named
  but the four isolation levels aren't worked through.
- **Recursive CTEs** for hierarchical data — not covered.
- **JSON column queries** (jsonb in Postgres) — every modern schema has
  these, not covered.

### 3.4 CI/CD & Flakiness (cat-3, 15 Qs) — keep, broaden CI provider

Strong on flake taxonomy, retry anti-patterns, smoke vs nightly gating.
GitHub Actions-only is a defensible scope but worth one Q on GitLab /
Jenkins for candidates targeting non-GitHub shops.

### 3.5 Testing Theory (cat-3, 22 Qs) — keep, but see §5 on ISTQB path

Good *applied* coverage of CTFL concepts: V&V, the 7 principles, test
levels/types, BVA, decision tables, mutation testing, shift-left. The
problem is structure, not content — see §5.

### 3.6 Real Scenarios (15 Qs) + Behavioral (13 Qs) — keep as-is

Easy to dismiss; don't. These are the questions that separate "can write
tests" from "can survive a P0 at 16:45 on a Friday". The Knight Capital +
CrowdStrike references are real teaching moments. STAR-format prompts are
well-shaped.

### 3.7 Visual Regression (cat-4, 7 Qs) — keep, tight

Right size, right depth. Covers tool choice, baseline management, flake
sources. Add one Q on color-contrast/a11y visuals and it's complete.

### 3.8 Feature Flags (cat-4, 6 Qs) — keep, fix one Q

Good focus. One quality issue: the "three states (off/on/10% rollout)" Q
says "never depend on sampling logic", which makes the 10% test
identical to the on-state test. The senior answer needs to explicitly
address *testing the bucketing logic itself*.

### 3.9 GraphQL & Contracts (cat-4, 8 Qs) — keep, deepen GraphQL half

Pact + OpenAPI half is strong. GraphQL half is shallow:

- **No subscriptions** (WebSocket, ordering, backpressure)
- **No N+1 / DataLoader** testing
- **No federation** (Apollo)
- **No persisted queries**

Currently three of eight Qs are truly GraphQL-native; the rest are
REST-shaped. Mis-titled given the actual content.

### 3.10 TypeScript Programming (cat-4, 11 Qs) — keep, sharpen

Covers generics, utility types, type guards, discriminated unions,
Promise patterns, async-safe assertions. Solid for a junior-to-senior
upgrade. For senior-specific depth, missing: conditional types, mapped
types, `infer`, exhaustiveness with `never`.

### 3.11 Growth: Test Management + Testing Strategy + Driving Improvements — keep

These are the "growth" categories that earn their name. Driving
Improvements in particular has no overlap with other categories and
covers the change-management muscle a senior actually needs.

Light additions worth making:

- IEEE 829 + RACI in Test Management (currently implied)
- Shift-left / shift-right framework in Testing Strategy
- OKRs / metrics-that-lie in Driving Improvements

---

## 4. What doesn't make sense — cut or merge

This is the "too wide, too bright" diagnosis made concrete.

### 4.1 Programming Fundamentals (cat-4, 9 Qs) — CUT

Closures, event loop, `this` binding, debounce vs throttle, deep-clone,
group-by, find-duplicates, currying.

Why it doesn't make sense here:

- These are **generic JS interview Qs**, not QA-specific.
- Most are difficulty "easy" or "mid" — they dilute the senior signal.
- The category title says "framed for QA" but the framing is thin
  (e.g. the currying answer's "where is this useful in QA" section is
  hand-waved).

**Recommendation:** delete the category. Move the **two** Qs with genuine
QA value (event loop / microtask vs macrotask, retry-with-backoff) into
the **TypeScript Programming** category. Lose the other seven.

### 4.2 Growth: Automation Frameworks (10 Qs) — MERGE

This restates what **Framework & Architecture** (cat-2) already covers,
just in a "Growth: " wrapper. Both files compare Playwright/Cypress/Sel,
both discuss when to migrate, both cover stack design.

**Recommendation:** merge the best 2-3 Qs (the framework selection
rubric, the stack-design quiz) into `frameworkArch`; delete the rest.
Anything truly senior here belongs in the **new Deep Automation
Engineering path** (§5.2), not in a parallel Growth category.

### 4.3 Growth: API & DB Testing (10 Qs) — MERGE

Same issue: restates **REST API** (cat-1) + **SQL** (cat-2) at slightly
higher level. The Pact end-to-end Q is good but duplicates the contract
testing Qs already in cat-1 and in GraphQL & Contracts (cat-4).

**Recommendation:** keep the migration/parity SQL Q (it's genuinely
distinct) and fold it into SQL. Delete the rest.

### 4.4 Tricky Assertions (cat-4, 11 Qs) — FOLD

These are **Playwright pitfalls**: sorted columns, transient toasts,
timezone dates, CSV downloads, drag-and-drop persistence. They aren't
their own discipline; they're "advanced Playwright". Splitting them out
makes the Playwright category look thinner than it is and hides these
Qs from anyone studying Playwright linearly.

**Recommendation:** append all 11 into the Playwright category under a
`tag: "pitfall"` and delete the standalone block.

### 4.5 Project Structure (cat-4, 8 Qs) — KEEP but narrow

Currently a mix of file naming, tsconfig, env-var validation, and
monorepo layout. The monorepo + shared utilities Qs are the senior
parts; the rest is junior tutorial material.

**Recommendation:** keep, but downscope answers on tsconfig/barrel
files (they're not senior-level differentiators) and emphasise the
monorepo / shared-framework Qs.

---

## 5. What's missing — the two paths the user already named

The user said it directly: "ISTQB things, automation things — there is a
lock, we're not covering enough." Confirmed.

### 5.1 Path: ISTQB Fundamentals — MISSING, must add

Today CTFL coverage is ~70%, but **scattered across Testing Theory and
two Growth categories** with no glossary, no formal-techniques unit, no
ISO 29119 mention, no V-model in regulated context. CTAL-TA is at ~20%,
CTAL-TAE at ~5%, CT-AuT at 0%.

For Romanian / EU / automotive employers (ISO 26262, ISTQB-aligned
hiring funnels) this is a real cost.

Suggested 12-Q path:

1. ISTQB test process end-to-end, gates per phase
2. Verification vs validation, one concrete example each
3. The ISTQB test levels mapped to the pyramid
4. Decision table for a promo-code eligibility rule (hard)
5. BVA on a price field (0.00 / 0.01 / 999,999.99 / 1,000,000.00)
6. State-transition test for Order: New → Pending → Shipped → Delivered
7. Equivalence partitioning on a quantity field
8. Glossary: test basis / test oracle / traceability
9. Coverage types (code / requirement / risk / path) — when each lies
10. ISO 29119 vs ISTQB Test Management — what the extra rigor buys
11. V-model in automotive / regulated domains
12. Confidence vs pass-rate — residual risk reporting

### 5.2 Path: Deep Automation Engineering — MISSING, must add

Today the corpus is excellent at *using* Playwright and *naming*
Pact/k6/Allure, but thin on *designing the system around them*.
CTAL-TAE / SDET interviews probe exactly this. The current
"Framework & Architecture" category has 12 Qs but mostly at the
"folder structure / POM anti-pattern" level — not "design a 5000-test
framework from scratch".

Suggested 12-Q path:

1. Design a test framework for 5k+ E2E tests from scratch — architecture,
   layers, artefacts
2. Flakiness detection pipeline at scale — per-test history, quarantine,
   alerting, ownership
3. Builder vs Fixture vs API-seeded test data — which scales past 1k tests
4. Metadata schema for a test-run record that feeds a dashboard
5. Custom reporter for Datadog / Allure — interface + retry handling
6. Test isolation in a parallel suite sharing one Postgres
7. BDD/Gherkin at scale — anti-patterns past 1k scenarios
8. Contract testing for 20 microservices without matrix explosion
9. Observability of a test run — correlation IDs from test → app → APM
10. Visual regression flakiness engineering — fonts, OS parity, thresholds
11. Flaky vs brittle — fix patterns for each
12. New-engineer onboarding into your framework — DX matters

---

## 6. What's also missing — but not in scope for this audit's fixes

The user said: "more testing stuff will come later." So these are
flagged, not planned-for now:

| Domain | Why it matters for senior QA | Today |
|---|---|---|
| **Accessibility** | WCAG 2.1 AA is now a hard requirement in EU public sector and most enterprise contracts. | 0 dedicated Qs. |
| **Mobile** | Most consumer products are mobile-first; Appium/Maestro/Espresso surface in interviews. | 1 passing mention. |
| **Security beyond auth** | OWASP Top 10 — XSS, SSRF, CSRF, deserialisation, supply chain. | Auth-only. |
| **Performance + observability** | Core Web Vitals, APM, distributed tracing, k6 at scale. | Single k6 example. |
| **Chaos / resilience** | "What if DB is slow? What if the third party is down?" — table stakes for staff+ roles. | 0 Qs. |

A follow-up audit can scope these once the ISTQB + automation paths are in.

---

## 7. Quality issues to fix in-place (top ~10)

These are individual answers the agents flagged as thin / below
senior bar. Worth a 30-min pass to upgrade.

1. **Playwright Q: Visual regression flake prevention** — names masks +
   animation disable but skips OS/font parity strategy and baseline
   review process.
2. **Playwright Q: page.evaluate use cases** — answer is one example;
   missing the perf cost (serialisation) and the "when *not* to use
   it" guidance.
3. **REST API Q: Response validation layers** — lists six layers but the
   example only validates three.
4. **REST API Q: Webhooks** — mentions HMAC comparison without
   constant-time compare (timing-attack risk).
5. **REST API Q: Contract testing intro** — high-level only; no minimal
   Pact code example, no consumer-overly-permissive failure mode.
6. **SQL Q: ACID explained** — diagram + bullets without an executable
   transfer-money example; isolation levels named but not worked through.
7. **SQL Q: N+1 queries** — concept clear, detection strategy
   ("count queries") vague; no APM/logging recipe.
8. **Framework Q: Preventing test rot** — checklist of practices but no
   implementation playbook (lint rules to enable, review checklist).
9. **Feature flags Q: three-state (off/on/10%)** — the 10% test is
   identical to the on-state test; doesn't address *testing the
   bucketing logic*.
10. **Testing theory Q: Shift-left** — aspirational ("write Gherkin
    before code") without friction-point guidance (how to enforce,
    what to do when devs push back).

---

## 8. Stale documentation — quick fixes

- `README.md` — table says "143 questions / 8 categories", reality is
  ~275 / 20.
- `OVERVIEW.md` — same numbers, same lag.
- `TEST_PLAN.md` §4 — the requirement traceability table (R-01 … R-10)
  mentions none of the 12 newer categories. Either extend or note
  explicitly that R-IDs cover the original 8 only.
- `FRAMEWORKS.md` — still talks about Vitest 4 / Iteration 4d as the
  current state; check whether that matches what's actually in the
  repo today.

These should be patched as soon as anything else lands, otherwise the
"143 / 8" number gets re-introduced into LinkedIn posts and CV bullets.

---

## 9. Recommendation in one paragraph

Cut three categories (Programming Fundamentals, Growth: Automation
Frameworks, Growth: API & DB Testing) and fold one (Tricky Assertions
into Playwright). Add two new dedicated learning paths (ISTQB
Fundamentals ~12 Qs, Deep Automation Engineering ~12 Qs). Patch
~10 thin answers in-place. Fix the stale "143/8" numbers in README +
OVERVIEW + TEST_PLAN. Net result: ~250 Qs (down from ~275), 18
categories (down from 20), two clear paths a learner can follow
linearly, and CTFL + CTAL-TAE coverage that's actually defensible
in an interview.

Accessibility, mobile, security-beyond-auth, perf/observability and
chaos/resilience are real gaps too, but per the user's call they
belong in a follow-up audit, not this one.
