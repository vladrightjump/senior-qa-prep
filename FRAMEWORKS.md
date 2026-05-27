# Automation Frameworks — Survey and Choices

A grounded look at the framework choices on this project, the
alternatives at each validation level, and the trade-offs that matter
when picking one. The goal is to make choices *justified*, not
*inherited*.

---

## 1. Unit / component

### What's in use

**Vitest 4 + @testing-library/react + jest-dom** — the current stack
(`vite.config.ts`, `src/test/setup.ts`).

### Alternatives considered

| Framework | Speed | DX | Vite fit | Notes |
|---|---|---|---|---|
| **Vitest** ✅ | Fastest start; HMR-aware watch | Excellent — shares Vite config | Native | Jest-compatible API means RTL migrates with zero changes. |
| Jest | Slower cold start | Mature; huge ecosystem | Needs `babel-jest` + ESM shims; painful with Vite | Better choice on Webpack/Next projects. |
| Mocha + Chai | Lean; you assemble it | Flexible but you own the assembly | Possible but bespoke | Reasonable for libraries, overkill for an app. |
| node:test (built-in) | Zero deps | Spartan reporter; weak watch | Works but no DOM helpers | Compelling for backend-only Node code; not for React. |
| Storybook test runner | — | Pairs with stories | Vite-friendly | Complementary, not a replacement. Worth adding once a Storybook exists. |

### Trade-offs that matter here

- **Speed.** Vitest's transform is Vite's transform — there is no second
  pipeline to maintain. The 43-test suite runs in ~1.3s.
- **Flakiness.** Component-level flakiness on this project would come
  from R3F (WebGL) or Mermaid (heavy ESM). Both are mocked at module
  boundary; Vitest's `vi.mock` makes this ergonomic.
- **Debuggability.** Vitest's UI mode + inline source maps are best in
  class for Vite projects.
- **CI fit.** A single `npm test` in the GitHub Actions workflow with no
  babel/ESM config. Jest would need 20+ lines of config to match.

### Recommendation

Stay on Vitest. Add Storybook + the test runner when component variants
multiply (the diagram rendering paths and media types are the first
candidates).

---

## 2. API

### What's in use

Nothing — there is no backend after commit `43e3562`. This section
describes what to reach for when Iteration 4d lands.

### Alternatives

| Framework | Strength | Weakness |
|---|---|---|
| **Supertest** | Tiny; mounts a Node HTTP server in-process | Node-only; no contract testing |
| **Postman / Newman** | GUI-first; nice for hand-off | CLI runs are slower; lockfile is JSON, hard to diff |
| **REST Assured** | Mature; expressive matchers | JVM; mismatched with this TS stack |
| **Karate** | DSL + Gherkin; built-in mocks | DSL learning curve; opinionated |
| **k6** | Load testing primary; smoke as side benefit | Not designed as a correctness tool |
| **Pact** | Contract testing (consumer-driven) | Adds a broker service; only valuable with ≥2 services |

### Trade-offs that matter here

- **Speed.** Supertest is in-process; Postman/Newman shells out per
  request. For a 50-test suite the difference is minutes vs seconds.
- **Flakiness.** Anything that hits a network is flakier than anything
  that doesn't. Prefer in-process where possible; reserve real-network
  tests for the smoke layer.
- **Debuggability.** Postman's GUI wins for one-off exploration; code
  wins for CI. Use Postman to *design* a request, then port to
  Supertest/Vitest for the suite.
- **CI fit.** Supertest reuses the Vitest runner — no second reporter,
  no second config. That alone is a strong tie-breaker.

### Recommendation (for when API work returns)

**Supertest from inside Vitest** for HTTP correctness, **JSON Schema /
Zod** for response shape validation, **k6** only when the team has a
real performance question to answer. Skip Pact until there is more than
one service.

---

## 3. End-to-end

### What's in use

Nothing — see `TEST_STRATEGY.md` §3b.

### Alternatives

| Framework | Strength | Weakness |
|---|---|---|
| **Playwright** ✅ recommended | Multi-browser, parallel by default, traces are excellent | Larger install (~200 MB browsers) |
| Cypress | Best-in-class dev loop; time-travel UI | Single-tab limitation; slower in CI; opinionated assertion model |
| WebdriverIO | Flexible; supports mobile via Appium | More config; smaller community than Playwright today |
| Selenium | Universal | Slowest; flaky; community has moved on |
| TestCafe | No WebDriver, runs anywhere | Smaller community; lags on modern browser features |

### Trade-offs that matter here

- **Speed.** Playwright runs tests in parallel across browser contexts;
  Cypress historically serialised. On a single smoke spec the
  difference is small; on a 50-spec suite it's 3–5×.
- **Flakiness.** Playwright's auto-waiting and `expect()` retry policy
  catch race conditions that Cypress also handles well; Selenium and
  TestCafe are markedly more flaky.
- **Debuggability.** Playwright traces (HTML viewer with DOM snapshots
  per step) are the best in the category. Cypress's time-travel UI is
  more discoverable but harder to share in CI.
- **CI fit.** Playwright ships an official GitHub Action that mirrors
  the local install — no surprises between machines.

### Recommendation (for when E2E lands)

**Playwright**, single smoke spec to start (sidebar → expand → mark
reviewed → reload → state persisted). Run nightly and on release tags,
not on every PR — the marginal value per PR run is low for a
local-storage app.

---

## 4. Contract testing

### Not applicable yet

No second service. When a future API client talks to a future Edge
Function or external service, Pact (consumer-driven) is the lightest
way in. Skip until then; pre-emptive contract testing on a single
service is overhead without payoff.

---

## 5. Load / performance

### Not applicable yet

No backend, no concurrent users. When backend returns, **k6** for
synthetic load + **Lighthouse CI** for frontend budgets. Both integrate
cleanly with GitHub Actions.

---

## 6. Mobile (not on the roadmap)

Listed for completeness so the survey is honest:

- **Appium** — WebDriver-based, works with WDIO; mature.
- **Maestro** — newer, YAML flows, lower ceiling but lower floor.

Neither is relevant today. Re-evaluate if the prep app ever ships as a
React Native or Capacitor target.

---

## 7. Justifying the current stack in one paragraph

Vitest + RTL + jsdom is the right unit/component layer for this Vite
+ React project because the pipeline is shared with the build,
component coverage is the widest band in the strategy (see
`TEST_STRATEGY.md` §2), and the full suite runs in ~1.3s — fast enough
that adding more tests does not erode the watch loop. API, E2E,
contract, and load layers are all deferred today on cost grounds, with
documented framework choices waiting for the trigger that brings them
in.

---

## 8. Decision log

| Date | Decision | Trigger |
|---|---|---|
| 2026-05-15 | Adopt Vitest 4 over Jest | New project, Vite-first; zero ESM friction |
| 2026-05-15 | Use RTL over Enzyme | Enzyme is unmaintained for React 18+ |
| 2026-05-15 | jsdom over happy-dom | jest-dom matchers tested against jsdom; happy-dom diverges on edge cases |
| 2026-05-18 | Defer E2E (Playwright) | No backend, single-user app; cost > value today |
| 2026-05-18 | Defer Pact / load | No second service, no perf SLO |

New decisions append a row. Reversals (e.g. *re-add Playwright when
backend returns*) get their own row with the trigger that flipped the
decision.
