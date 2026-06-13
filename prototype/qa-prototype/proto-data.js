// PROTO DATA — categories, groups, questions for the QA Prep prototype.
// Question texts for Playwright, REST API, and Scenarios are taken verbatim
// from the real qa-app data files; answers are condensed for the prototype.

(function () {
  const A = (html) => html; // readability marker

  const CATS = [
    // ── I · Code & Frameworks ─────────────────────────────────────────────
    {
      id: "playwright-ts", group: "code", label: "Playwright + TS",
      desc: "Locators, fixtures, auto-waiting, sharding — the real framework code a senior is expected to write from memory.",
      questions: [
        { id: "pw1", q: "What is the difference between page.locator() and page.$()? Which should you use in a senior framework?", diff: "easy",
          answer: A(`<p><code>page.locator()</code> is <strong>lazy and re-resolved on every action</strong> — it survives re-renders and gets auto-waiting + retries. <code>page.$()</code> grabs a one-time ElementHandle snapshot that goes stale when the DOM changes.</p><p>Senior frameworks use locators exclusively; handles are legacy API kept for edge cases like evaluating against a specific node.</p>`) },
        { id: "pw2", q: "Walk through Playwright's auto-waiting mechanism. What does it actually wait for, and where does it fall short?", diff: "mid",
          answer: A(`<p>Before acting, Playwright runs actionability checks — the element must be <strong>attached</strong>, <strong>visible</strong>, <strong>stable</strong> (not animating), <strong>enabled</strong>, and able to <strong>receive events</strong> (not obscured at the action point).</p><pre>// Blocks until actionable — no manual waits
await page.getByRole("button", { name: "Submit" }).click();</pre><p>It falls short on <em>application-level</em> readiness: data behind a visible skeleton, debounced inputs, state settling after render. That's where <code>expect.poll()</code> and web-first assertions take over.</p>`) },
        { id: "pw3", q: "Implement a TypeScript Page Object for a checkout page with proper encapsulation.", diff: "mid",
          answer: A(`<p>Private readonly locators in the constructor, public <em>intent-level</em> methods, no assertions inside the page object:</p><pre>export class CheckoutPage {
  private readonly cardField = this.page.getByLabel("Card number");
  private readonly payBtn = this.page.getByRole("button", { name: "Pay" });
  constructor(private readonly page: Page) {}

  async payWith(card: CardDetails): Promise&lt;void&gt; {
    await this.cardField.fill(card.number);
    await this.payBtn.click();
  }
}</pre><p>Tests own the assertions; page objects own the <em>how</em>.</p>`) },
        { id: "pw4", q: "Explain Playwright fixtures. Why are they superior to beforeEach hooks for a senior framework?", diff: "mid",
          answer: A(`<p>Fixtures are <strong>composable, lazy, and typed</strong>. A test declares what it needs (<code>{ loggedInPage, apiClient }</code>) and Playwright builds only that dependency graph — beforeEach runs everything for every test, needed or not.</p><p>They carry teardown with setup in one place, scope to test or worker, and compose across files via <code>mergeTests</code> — the backbone of a scalable framework.</p>`) },
        { id: "pw5", q: "How do you reuse authentication state without logging in for every test?", diff: "mid",
          answer: A(`<p>Log in once in a <strong>setup project</strong>, save <code>storageState</code> (cookies + localStorage) to disk, and point the main project's <code>use.storageState</code> at the file. Every test starts authenticated in a fresh context.</p><p>For multi-role suites, save one state file per role and select via fixture.</p>`) },
        { id: "pw6", q: "How do you intercept and mock a network request? When is it correct vs. wrong?", diff: "mid",
          answer: A(`<p><code>page.route()</code> with <code>route.fulfill()</code> for canned responses or <code>route.continue()</code> to pass through with edits.</p><p><strong>Correct:</strong> forcing error states, third-party APIs you don't own, deterministic edge data. <strong>Wrong:</strong> mocking your own backend in E2E smoke tests — you'd be testing a fiction. The closer to release, the less you mock.</p>`) },
        { id: "pw7", q: "What is expect.poll() and when do you use it instead of standard assertions?", diff: "easy",
          answer: A(`<p><code>expect.poll()</code> re-runs an <em>arbitrary function</em> until the matcher passes or times out — for things that aren't locators: API status, queue depth, DB rows.</p><pre>await expect.poll(() => api.getOrderStatus(id), {
  timeout: 10_000,
}).toBe("confirmed");</pre>`) },
        { id: "pw8", q: "Write a TypeScript retry wrapper with exponential backoff that only retries on network errors, not 4xx.", diff: "hard",
          answer: A(`<pre>async function withRetry&lt;T&gt;(fn: () => Promise&lt;T&gt;, max = 3): Promise&lt;T&gt; {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      const retriable = e instanceof NetworkError; // never 4xx
      if (!retriable || i === max - 1) throw e;
      await sleep(2 ** i * 250 + Math.random() * 100); // jitter
    }
  }
}</pre><p>Senior signals: typed generic, jitter to avoid thundering herd, and a hard rule that client errors (4xx) are bugs, not flakes — retrying them hides defects.</p>`) },
        { id: "pw9", q: "How do you parameterize a test to run with multiple data sets?", diff: "easy",
          answer: A(`<p>Loop over a typed array of cases and generate tests — each gets its own name, report line, and retry budget:</p><pre>for (const { role, canDelete } of cases) {
  test(\`\${role} delete permission\`, async ({ pageAs }) => { … });
}</pre>`) },
        { id: "pw10", q: "How do you debug a Playwright test that fails only in CI?", diff: "hard",
          answer: A(`<p>In order: <strong>pull the trace</strong> (<code>trace: "on-first-retry"</code>) and walk the timeline; compare env — viewport, timezone, locale, headless; check for <strong>resource contention</strong> (parallel workers sharing data); reproduce locally with <code>--repeat-each=20</code> and CPU throttling.</p><p>The answer is almost never "add a sleep" — it's a real race that CI's slower machines expose.</p>`) },
        { id: "pw11", q: "Your suite has 800 tests at 40 minutes. How do you bring it under 10?", diff: "hard",
          answer: A(`<p>Measure first — find the slow 10%. Then: <strong>shard across machines</strong> (4 shards ≈ 4× cut), full parallelism inside each (<code>fullyParallel: true</code>), kill serial bottlenecks (login via API/storageState, not UI), demote E2E tests that are really API tests, and cache builds so the suite isn't waiting on webpack.</p><p>40 min → 10 is usually sharding + auth shortcuts alone.</p>`) },
      ],
    },
    {
      id: "ts-programming", group: "code", label: "TypeScript programming",
      desc: "The language questions that separate script-writers from engineers.",
      questions: [
        { id: "ts1", q: "Explain TypeScript unknown vs. any. When do you use each?", diff: "easy",
          answer: A(`<p><code>any</code> opts out of the type system entirely; <code>unknown</code> is the type-safe top type — you must narrow it before use. Use <code>unknown</code> for external input (API responses, JSON.parse); <code>any</code> almost never, except quarantined migration code.</p>`) },
        { id: "ts2", q: "What are generics constraints and why do test helpers need them?", diff: "mid",
          answer: A(`<p><code>&lt;T extends HasId&gt;</code> lets a helper accept any entity while still guaranteeing the fields it touches. Test data builders without constraints degenerate into <code>any</code>-soup and stop catching schema drift at compile time.</p>`) },
        { id: "ts3", q: "Show a user-defined type guard and where it earns its keep in a test framework.", diff: "mid",
          answer: A(`<pre>function isApiError(r: unknown): r is ApiError {
  return typeof r === "object" && r !== null && "code" in r;
}</pre><p>Guards turn runtime checks into compile-time narrowing — response handling code stops needing casts, and bad assumptions fail in review instead of production.</p>`) },
        { id: "ts4", q: "Which utility types do you actually use in test code, and for what?", diff: "easy",
          answer: A(`<p><code>Partial&lt;T&gt;</code> for data-builder overrides, <code>Pick/Omit</code> for request payload shaping, <code>ReturnType&lt;typeof fn&gt;</code> to stay in sync with factories, <code>Record&lt;Role, Creds&gt;</code> for credential maps.</p>`) },
      ],
    },
    {
      id: "framework-arch", group: "code", label: "Framework & architecture",
      desc: "POM, fixture composition, and scaling test code past one team.",
      questions: [
        { id: "fa1", q: "What makes a Page Object Model good versus a god-object mess?", diff: "mid",
          answer: A(`<p>Good: one page/component per class, intent-level methods, locators private, no assertions, no test data baked in. Mess: 600-line objects, methods returning raw locators, sleeps, and conditional logic that belongs in tests.</p><p>Heuristic: if a method name contains "and", split it.</p>`) },
        { id: "fa2", q: "How do you compose fixtures across multiple teams' test packages?", diff: "hard",
          answer: A(`<p>Each domain ships its own fixture file (<code>authFixtures</code>, <code>cartFixtures</code>); a root <code>mergeTests()</code> combines them. Teams extend without touching shared code — the test framework equivalent of dependency injection.</p>`) },
        { id: "fa3", q: "Test data builders vs fixtures vs factories — how do you decide?", diff: "mid",
          answer: A(`<p><strong>Builders</strong> for in-memory payloads with overridable defaults. <strong>Factories</strong> when creation hits an API/DB. <strong>Fixtures</strong> when the data's lifecycle should match the test's (auto-cleanup). Most suites need all three, layered in that order.</p>`) },
        { id: "fa4", q: "When is it wrong to add an abstraction to test code?", diff: "mid",
          answer: A(`<p>When it hides what the test asserts. Tests are documentation — a reader should see the user journey. Abstract setup and navigation, never the act-and-assert core. Rule of three before extracting a helper.</p>`) },
      ],
    },
    {
      id: "project-structure", group: "code", label: "Project structure",
      desc: "Repo layout decisions that age well.",
      questions: [
        { id: "ps1", q: "Walk through your ideal Playwright repo layout for a 5-team org.", diff: "mid",
          answer: A(`<p><code>tests/</code> by domain (not by page), <code>fixtures/</code>, <code>pages/</code>, <code>api/</code> clients, <code>data/</code> builders, one <code>playwright.config.ts</code> with projects per app + env. Shared code in an internal package once two repos need it — not before.</p>`) },
        { id: "ps2", q: "Tests live with app code or in a separate repo — defend a position.", diff: "mid",
          answer: A(`<p>Default: <strong>same repo</strong>. Tests version with features, PRs gate atomically, refactors update selectors in the same diff. Separate repo only when one suite covers many services — and then contract tests guard the seams.</p>`) },
        { id: "ps3", q: "How do you stop helper/util folders becoming a junk drawer?", diff: "easy",
          answer: A(`<p>Ban <code>utils.ts</code>. Every helper lives in a named domain module (<code>date-format.ts</code>, <code>order-builders.ts</code>) with an owner. A quarterly dead-code sweep (<code>knip</code>, <code>ts-prune</code>) keeps it honest.</p>`) },
      ],
    },

    // ── II · APIs & Data ──────────────────────────────────────────────────
    {
      id: "api-rest", group: "apis", label: "REST API testing",
      desc: "HTTP semantics, idempotency, schema validation, security.",
      questions: [
        { id: "api1", q: "Explain the difference between PUT, PATCH, and POST. Which are idempotent?", diff: "easy",
          answer: A(`<p><strong>POST</strong> creates (not idempotent — repeat = duplicate). <strong>PUT</strong> replaces the whole resource (idempotent). <strong>PATCH</strong> partial update (not guaranteed idempotent — depends on the patch semantics).</p><p>Test angle: fire each twice and assert state — that's how you catch retry bugs.</p>`) },
        { id: "api2", q: "What's the difference between 401 and 403? If you get 500 instead, what does that mean?", diff: "easy",
          answer: A(`<p><strong>401</strong>: who are you? (missing/invalid auth). <strong>403</strong>: I know you, and no (authenticated but not authorized). A <strong>500</strong> on an auth path means the server crashed instead of rejecting cleanly — an unhandled error path, often a security finding in itself.</p>`) },
        { id: "api3", q: "How do you validate a REST API response beyond status code?", diff: "mid",
          answer: A(`<p>Schema validation (JSON Schema / zod) for shape, then business assertions on values, headers (<code>content-type</code>, cache, security), response time budget, and side effects — did the DB row actually change?</p>`) },
        { id: "api4", q: "Test authorization on a multi-tenant API: user A must not access user B's data.", diff: "hard",
          answer: A(`<p>The IDOR matrix: for every endpoint, call with A's token and B's resource IDs — expect 403/404, never 200 and never a <em>different error shape</em> that leaks existence. Automate it as a parameterized sweep over the route table, not hand-picked endpoints.</p>`) },
        { id: "api5", q: "What is idempotency in HTTP and how do you implement it for a payment endpoint?", diff: "hard",
          answer: A(`<p>Client sends an <code>Idempotency-Key</code>; server stores key → response and replays the stored response on retry instead of charging twice.</p><p>Tests: same key twice → one charge, two identical responses. Same key, different payload → 422. Key expiry honored.</p>`) },
        { id: "api6", q: "How do you test pagination on a REST API? List 5 bugs to look for.", diff: "mid",
          answer: A(`<ul><li>Overlap or gaps between pages (unstable sort)</li><li>Last page off-by-one / empty page 200 vs 404</li><li>Items created mid-pagination appearing twice or never</li><li><code>total</code> count drifting from reality</li><li>Out-of-range / negative / huge <code>page</code> params → 500</li></ul>`) },
        { id: "api7", q: "How do you test rate limiting without hammering production?", diff: "mid",
          answer: A(`<p>In a test env with limits lowered via config (e.g. 5/min), assert: the 6th call → 429, <code>Retry-After</code> header present and honored, limit is per-key not global, and a burst after the window succeeds. In prod, only verify headers exist on normal traffic.</p>`) },
        { id: "api8", q: "What is contract testing? When do you introduce it?", diff: "mid",
          answer: A(`<p>Consumer publishes the exact requests/fields it relies on (Pact, or OpenAPI-diff in CI); provider verifies against them on every change. Introduce when two teams deploy independently and an integration env bug has burned you — usually around service #3.</p>`) },
        { id: "api9", q: "How do you test a race condition like two users buying the last seat?", diff: "hard",
          answer: A(`<p>Fire both purchase calls concurrently (<code>Promise.all</code>), assert exactly one 200 and one 409, then assert the invariant in the DB: seats_sold ≤ capacity. Run it in a loop — races are probabilistic. The DB-level invariant is the real test; the status codes are garnish.</p>`) },
        { id: "api10", q: "Walk through testing a webhook: signature, retries, idempotency.", diff: "hard",
          answer: A(`<p><strong>Signature:</strong> valid HMAC accepted, tampered payload rejected, replayed timestamp rejected. <strong>Retries:</strong> return 500 once — does the sender retry with backoff? <strong>Idempotency:</strong> same event ID delivered twice → one side effect. Use a capture endpoint (or ngrok-style tunnel) you control.</p>`) },
        { id: "api11", q: "What is JSON Schema validation and why is it more reliable than spot-checking fields?", diff: "easy",
          answer: A(`<p>One schema asserts the <em>whole shape</em> — required fields, types, enums, no unexpected nulls — on every call. Spot-checks rot: they pass while the API quietly adds, renames, or nulls fields your consumers depend on.</p>`) },
        { id: "api12", q: "How do you test an API for SQL injection?", diff: "mid",
          answer: A(`<p>Inject canaries (<code>' OR 1=1--</code>, <code>'; SELECT pg_sleep(5)--</code>) into every string param and assert: clean 4xx, no 500s, no timing change, no error text leaking SQL. Automate as a fuzz sweep; escalate anything suspicious to the security team — don't exploit further.</p>`) },
        { id: "api13", q: "What is OAuth 2.0 and how do you test an OAuth flow?", diff: "hard",
          answer: A(`<p>Delegated authorization — user grants a client scoped access via an auth server. Test: happy path (code → token → API), <strong>expired token → 401 + clean refresh</strong>, scope enforcement (read token can't write), state param blocks CSRF, and redirect_uri whitelist can't be bent.</p>`) },
      ],
    },
    {
      id: "graphql", group: "apis", label: "GraphQL & contracts",
      desc: "Where REST instincts mislead you.",
      questions: [
        { id: "gq1", q: "GraphQL returns 200 even on errors. How does that change your assertions?", diff: "mid",
          answer: A(`<p>Status codes are useless — every assertion must check the <code>errors</code> array AND that <code>data</code> isn't partially null. Partial success is the GraphQL trap: one resolver fails, the rest succeeds, and a 200-only check passes a broken response.</p>`) },
        { id: "gq2", q: "How do you contract-test a GraphQL API?", diff: "hard",
          answer: A(`<p>Schema is the contract: run schema-diff in CI and fail on breaking changes (removed fields, narrowed types). Persisted queries from real consumers become the verification suite — replay them against every candidate schema.</p>`) },
        { id: "gq3", q: "What GraphQL-specific failure modes do you test that REST doesn't have?", diff: "mid",
          answer: A(`<p>Query-depth/complexity bombs (nested 20-deep → rejected, not OOM), N+1 resolver explosions under list queries, field-level authorization (same query, different viewer → different fields), and introspection disabled in prod.</p>`) },
      ],
    },
    {
      id: "sql", group: "apis", label: "SQL fundamentals",
      desc: "Joins, indexes, window functions, data-integrity queries.",
      questions: [
        { id: "sq1", q: "INNER vs LEFT JOIN — and which bugs does each one hide?", diff: "easy",
          answer: A(`<p>INNER drops unmatched rows — silently hiding orphans; LEFT keeps them with NULLs — and a careless <code>WHERE right.col = x</code> turns it back into an INNER. Verification queries for orphaned records should always be LEFT JOIN … WHERE right.id IS NULL.</p>`) },
        { id: "sq2", q: "Write a query to find duplicate emails in a users table.", diff: "easy",
          answer: A(`<pre>SELECT email, COUNT(*) AS n
FROM users
GROUP BY email
HAVING COUNT(*) > 1;</pre><p>Follow-up senior point: prevent it with a unique index, not a cleanup script — and mind case/whitespace normalization first.</p>`) },
        { id: "sq3", q: "What is a window function? Show one real QA use.", diff: "mid",
          answer: A(`<p>Aggregates over a partition without collapsing rows. QA use — find the latest status per order and catch stuck ones:</p><pre>SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (
    PARTITION BY order_id ORDER BY updated_at DESC) rn
  FROM order_events o
) t WHERE rn = 1 AND status = 'PROCESSING'
  AND updated_at < now() - interval '1 hour';</pre>`) },
        { id: "sq4", q: "When does an index NOT help a query?", diff: "mid",
          answer: A(`<p>Leading-wildcard LIKE, functions on the column (<code>LOWER(email)</code> without a functional index), low-cardinality columns, OR across different columns, and tiny tables where a scan is cheaper. Read the EXPLAIN, don't guess.</p>`) },
        { id: "sq5", q: "Write a data-integrity check: orders whose line-item totals don't match the order total.", diff: "hard",
          answer: A(`<pre>SELECT o.id, o.total, SUM(li.price * li.qty) AS computed
FROM orders o JOIN line_items li ON li.order_id = o.id
GROUP BY o.id, o.total
HAVING o.total &lt;&gt; SUM(li.price * li.qty);</pre><p>Run as a nightly canary — this class of drift never comes from one obvious bug.</p>`) },
      ],
    },
    {
      id: "api-db", group: "apis", label: "API & DB integration",
      desc: "Testing through the full write path.",
      questions: [
        { id: "ad1", q: "An API returns 201 — how much DB verification belongs in the test?", diff: "mid",
          answer: A(`<p>Assert the row exists with the business-critical fields correct (state, foreign keys, money amounts) — not byte-for-byte equality with the payload. Over-assertion couples tests to schema churn; under-assertion passes 201s that wrote garbage.</p>`) },
        { id: "ad2", q: "How do you keep test data isolated when suites share one database?", diff: "hard",
          answer: A(`<p>Namespace everything per run (worker-id prefixes, dedicated tenants), create data through the API not raw INSERTs, and clean up by tenant teardown rather than TRUNCATE. Never assert on counts you don't own.</p>`) },
        { id: "ad3", q: "How do you test eventual consistency — API write, async projection, read model?", diff: "hard",
          answer: A(`<p>Poll the read side with a deadline (<code>expect.poll</code>, 10–30s budget) rather than sleeping; assert intermediate state is <em>valid</em> (stale-but-consistent, never half-written); and have one test that measures actual convergence time so regressions in lag get caught.</p>`) },
      ],
    },

    // ── III · Quality Engineering ─────────────────────────────────────────
    {
      id: "ci-flakiness", group: "quality", label: "CI/CD & flakiness",
      desc: "GitHub Actions, sharding, flake reduction, metrics.",
      questions: [
        { id: "ci1", q: "Name the top 5 root causes of flaky tests, in order of how often you actually see them.", diff: "mid",
          answer: A(`<ol><li>Race conditions — asserting before async work settles</li><li>Shared mutable test data across parallel workers</li><li>Time — clocks, timezones, "tomorrow" bugs</li><li>Real third-party dependencies in the loop</li><li>Animation / rendering instability</li></ol><p>Selector fragility is the famous one but it's #6 — and it causes consistent failures, not flakes.</p>`) },
        { id: "ci2", q: "Design a flaky-test quarantine process that doesn't become a graveyard.", diff: "hard",
          answer: A(`<p>Auto-detect (fail→pass on retry), auto-ticket with the trace attached, move to a quarantine project that still runs nightly, and enforce an SLA: 2 weeks to fix or the test is deleted. The graveyard prevention is the deletion deadline — quarantine without expiry is just hiding.</p>`) },
        { id: "ci3", q: "Set up sharding for a Playwright suite in GitHub Actions.", diff: "mid",
          answer: A(`<pre>strategy:
  matrix: { shard: [1, 2, 3, 4] }
steps:
  - run: npx playwright test --shard=\${{ matrix.shard }}/4</pre><p>Then merge blob reports for one unified HTML report. Balance shards by timing file, not test count.</p>`) },
        { id: "ci4", q: "What's your retry policy — and why is 'retries: 3' an anti-pattern?", diff: "mid",
          answer: A(`<p>One retry in CI, zero locally, and <strong>every pass-on-retry is logged as a flake</strong> and trended. <code>retries: 3</code> turns real races into green builds — you're not fixing flakiness, you're buying a slower suite that lies.</p>`) },
        { id: "ci5", q: "Which CI quality metrics do you actually track, and which are vanity?", diff: "mid",
          answer: A(`<p>Track: flake rate (pass-on-retry %), P95 pipeline duration, escape rate (prod bugs that had test coverage gaps), time-to-green after red. Vanity: total test count, raw coverage %, tests-added-per-sprint.</p>`) },
      ],
    },
    {
      id: "testing-theory", group: "quality", label: "Testing theory",
      desc: "Verification vs validation, coverage, mutation testing, ISTQB principles.",
      questions: [
        { id: "tt1", q: "Verification vs validation — explain with a concrete example.", diff: "easy",
          answer: A(`<p><strong>Verification:</strong> did we build it right? (the discount calculates 10% as spec'd). <strong>Validation:</strong> did we build the right thing? (users expected 10% off the total, spec said per-item — verified code, failed product).</p>`) },
        { id: "tt2", q: "Is the test pyramid still right? Defend or attack it.", diff: "mid",
          answer: A(`<p>The shape survives; the dogma doesn't. The real principle is <em>push tests to the cheapest layer that can catch the bug</em>. Modern stacks add a fat contract/API middle and Playwright makes E2E cheaper than 2015's pyramid assumed — but inverted pyramids (all E2E) still drown teams in flakes and 40-minute feedback.</p>`) },
        { id: "tt3", q: "What is mutation testing and what does it tell you that coverage can't?", diff: "mid",
          answer: A(`<p>It mutates your code (flip a <code>&gt;</code> to <code>&gt;=</code>) and checks whether any test fails. Surviving mutants = code that's <em>executed</em> by tests but not <em>asserted on</em> — exactly the shallow-assertion problem 85% line coverage hides.</p>`) },
        { id: "tt4", q: "Exhaustive testing is impossible — so how do you choose what to test?", diff: "easy",
          answer: A(`<p>Risk × usage: equivalence partitions and boundary values to collapse the input space, then weight by traffic and blast radius. The pesticide paradox says rotate techniques — yesterday's suite finds yesterday's bugs.</p>`) },
      ],
    },
    {
      id: "visual-regression", group: "quality", label: "Visual regression",
      desc: "Screenshot testing that doesn't cry wolf.",
      questions: [
        { id: "vr1", q: "Visual regression testing in Playwright — how do you implement it without flakes?", diff: "hard",
          answer: A(`<p>Deterministic rendering first: frozen clock, seeded data, fonts loaded (<code>document.fonts.ready</code>), animations disabled, fixed viewport + DPR, same browser/OS in CI via container. Then <code>toHaveScreenshot()</code> with masks over genuinely dynamic regions and a small <code>maxDiffPixelRatio</code>.</p>`) },
        { id: "vr2", q: "Per-pixel thresholds vs masking vs ignoring regions — when do you use which?", diff: "mid",
          answer: A(`<p>Mask what's <em>legitimately</em> dynamic (avatars, timestamps). Threshold only for antialiasing noise — keep it tiny or it eats real bugs. If you're masking half the page, the page isn't ready for visual testing; test components instead.</p>`) },
        { id: "vr3", q: "Where does visual testing earn its cost, and where is it a trap?", diff: "easy",
          answer: A(`<p>Earns it: design systems, marketing pages, PDF/email rendering, theming. Trap: data-heavy app screens where every release legitimately changes pixels — you'll train the team to click "approve all".</p>`) },
      ],
    },
    {
      id: "feature-flags", group: "quality", label: "Feature flags",
      desc: "Testing software that ships in two states at once.",
      questions: [
        { id: "ff1", q: "Test a feature behind a 10% feature flag.", diff: "hard",
          answer: A(`<ul><li><strong>Force-enable in test env</strong> — override header or admin API, never rollout sampling</li><li><strong>Test both states</strong> — ON verifies new behavior, OFF verifies legacy intact</li><li><strong>Test the toggle</strong> — flipping mid-session shouldn't break or leak</li><li><strong>Test rollback</strong> — flag killed at peak traffic, OFF-state suite still green</li></ul>`) },
        { id: "ff2", q: "How do you keep flag-state test matrices from exploding combinatorially?", diff: "hard",
          answer: A(`<p>You don't test 2ⁿ. Full suite on default-prod state, new-flag-ON suite for the feature under rollout, plus pairwise only for flags that <em>interact</em> (shared surface or data). Flag interaction should be rare by design — if it isn't, that's the finding.</p>`) },
        { id: "ff3", q: "What's your policy for stale flags?", diff: "easy",
          answer: A(`<p>Every flag gets an owner and a removal date at creation. CI warns at expiry, then fails the build. A flag at 100% for a quarter is dead code wearing a costume.</p>`) },
      ],
    },
    {
      id: "frameworks-survey", group: "quality", label: "Automation frameworks",
      desc: "The landscape, and how to choose with a straight face.",
      questions: [
        { id: "fs1", q: "Playwright vs Cypress vs Selenium in 2026 — give the honest comparison.", diff: "mid",
          answer: A(`<p><strong>Playwright:</strong> fastest, true parallelism, multi-tab/origin, best trace tooling — default choice. <strong>Cypress:</strong> lovely DX, but single-tab architecture and paid parallelism push teams out at scale. <strong>Selenium:</strong> the standard where grid infrastructure and exotic browser matrices already exist; you choose it for the ecosystem, not the API.</p>`) },
        { id: "fs2", q: "When would you still pick Selenium for a new project?", diff: "easy",
          answer: A(`<p>Regulated environments standardized on Grid, genuinely exotic browser/device matrices, or a large existing engineer base in Java/C# where retraining costs more than tooling gains. Otherwise: you wouldn't.</p>`) },
        { id: "fs3", q: "How do you evaluate a new testing tool without betting the team on hype?", diff: "mid",
          answer: A(`<p>A two-week timeboxed spike on your three nastiest real flows — not the demo app. Score: flake rate, debugging story, CI fit, hiring pool. Write the decision down so the next person knows <em>why</em>, not just <em>what</em>.</p>`) },
      ],
    },

    // ── IV · Strategy & Leadership ────────────────────────────────────────
    {
      id: "test-mgmt", group: "strategy", label: "Test management",
      desc: "Plans, priorities, and reporting that leadership reads.",
      questions: [
        { id: "tm1", q: "What goes in a test plan that people actually use?", diff: "easy",
          answer: A(`<p>One page: scope and explicit non-scope, risk ranking, environments + data needs, entry/exit criteria, and who decides ship/no-ship. The 30-page IEEE template is where plans go to be unread.</p>`) },
        { id: "tm2", q: "Regression window cut from 5 days to 1. How do you choose what runs?", diff: "hard",
          answer: A(`<p>Risk-ranked: changed-code impact map first (what did this release touch?), then revenue-critical journeys, then historical bug clusters. Publish what's <em>excluded</em> and the residual risk — making the cut visible is the senior move.</p>`) },
        { id: "tm3", q: "How do you report quality to execs without drowning them in test counts?", diff: "mid",
          answer: A(`<p>Three numbers, trended: escape rate, time-to-detect, release confidence (red/amber/green per area with the why). One slide. The moment you show "14,238 tests passed", you've taught them to ignore you.</p>`) },
      ],
    },
    {
      id: "test-strategy", group: "strategy", label: "Testing strategy",
      desc: "Risk-based thinking and the order of operations.",
      questions: [
        { id: "st1", q: "What does risk-based testing mean in practice — not as a slogan?", diff: "mid",
          answer: A(`<p>A living matrix of feature × (likelihood of failure × impact), driven by churn data, incident history, and money flow. High cell = automated + exploratory + monitored. Low cell = smoke only. The matrix is reviewed when architecture changes, not annually.</p>`) },
        { id: "st2", q: "Greenfield product, zero tests. What do you automate first and why?", diff: "easy",
          answer: A(`<p>The money path: signup → core action → payment. 10–20 E2E smoke tests on the journeys whose breakage pages someone at 3am, API tests underneath them, CI gate from day one. Breadth before depth.</p>`) },
        { id: "st3", q: "Define escape rate and explain how you'd actually instrument it.", diff: "mid",
          answer: A(`<p>Prod bugs ÷ (prod bugs + pre-release catches), per release. Instrument by tagging every prod incident with "was this coverable?" in the postmortem — the trend matters more than the number, and the 'coverable' tag tells you where to invest.</p>`) },
        { id: "st4", q: "What does shift-left mean beyond the buzzword — what do you concretely change?", diff: "mid",
          answer: A(`<p>QA reviews designs and API contracts before code; testability (test IDs, seams, feature-flag overrides) becomes acceptance criteria; devs own unit + integration with QA pairing on the strategy. The shift is of <em>thinking</em>, not of test files.</p>`) },
      ],
    },
    {
      id: "improvements", group: "strategy", label: "Driving improvements",
      desc: "Changing how an org does quality, without the authority to mandate it.",
      questions: [
        { id: "di1", q: "Flakiness is endemic across 6 teams. You have influence, not authority. Go.", diff: "hard",
          answer: A(`<p>Make it visible first: a flake-rate dashboard per team, published weekly. Fix one team's suite as a flagship (pick the friendliest team, not the worst suite), document the playbook, then let the dashboard's social pressure do the rollout. Mandates without proof get malicious compliance.</p>`) },
        { id: "di2", q: "How do you introduce contract testing to teams that say they don't have time?", diff: "mid",
          answer: A(`<p>Wait for (or find) the integration outage, quantify its cost, then pilot on that exact seam — one consumer, one provider, two weeks. Sell the time saved in integration-env debugging, not the methodology.</p>`) },
        { id: "di3", q: "What's your playbook for raising quality culture beyond the QA team?", diff: "mid",
          answer: A(`<p>Make the right thing the easy thing: PR templates with test checklists, golden-path test examples in every repo, bug bash hours that devs enjoy, and postmortems that assign learning, not blame. Culture follows tooling friction.</p>`) },
      ],
    },

    // ── V · Interview Prep ────────────────────────────────────────────────
    {
      id: "scenarios", group: "interview", label: "Real scenarios",
      desc: "Production-grade situations a senior QA must handle without flinching.",
      questions: [
        { id: "sc1", q: "P0 bug found 1 hour before release demo. What do you do?", diff: "hard",
          answer: A(`<ol><li><strong>Reproduce + capture</strong> — clear steps, screenshot, trace.</li><li><strong>Assess impact</strong> — how many users? Workaround? Data loss?</li><li><strong>Notify lead and PM immediately</strong> — don't wait for demo.</li><li><strong>Recommend, don't decide</strong> — present options: delay/hotfix/ship with workaround. Leadership picks.</li><li><strong>If demo proceeds</strong> — proactively call out to client. Surprises kill trust; transparency builds it.</li><li><strong>Postmortem after</strong> — how did it slip past automation?</li></ol><p>Senior signal: calm, structured, escalates appropriately, owns analysis but not decision.</p>`) },
        { id: "sc2", q: "Nightly run: 60 flakes, 30 real failures. Triage in 30 min.", diff: "hard",
          answer: A(`<ol><li><strong>Re-run failed only</strong> — separates intermittent from consistent.</li><li><strong>Group by error type</strong> — same stack trace = same root cause. 30 might be 3 bugs.</li><li><strong>Bisect real failures</strong> — last green commit. <code>git bisect</code> if needed.</li><li><strong>Tag flakes</strong> — JIRA tickets, exclude from PR runs, keep in nightly.</li><li><strong>Post summary</strong> — Slack within 1h. "30 real = 3 bugs (X, Y, Z), tickets filed. 60 flakes quarantined."</li></ol><p>Instinct to "fix the suite first" is wrong. Real failures are user-impacting bugs — they trump suite quality.</p>`) },
        { id: "sc3", q: "Join a team with no automation. 90-day plan.", diff: "hard",
          answer: A(`<p><strong>Days 1–14: discover.</strong> Shadow team, read every JIRA from last quarter, map critical journeys, talk to support. Pick stack — default Playwright + TypeScript.</p><p><strong>Days 15–45: smoke + foundations.</strong> 10–20 critical-path E2E tests, CI integration, PR gate, POM from day 1.</p><p><strong>Days 46–90: regression + scale.</strong> 100+ tests, API tests in parallel, sharding, flakiness dashboard, document and train.</p><p><strong>What you don't do:</strong> automate everything in month 1. Depth comes after foundation.</p>`) },
        { id: "sc4", q: "Pressure to skip regression for a deadline. Your response?", diff: "hard",
          answer: A(`<p>Don't say no. Say "here's the trade-off, you decide":</p><blockquote>"I can ship without full regression. Last 3 releases that skipped it had 2 hotfixes within 48h. Here's a 90-min minimum smoke pack covering payment, login, order flow. Remaining regression deferred to nightly post-release. Want me to proceed?"</blockquote><p>Three things: quantifies risk, proposes concrete compromise, transfers decision to the right person. Document it.</p>`) },
        { id: "sc5", q: "Coverage 85% but bugs keep slipping to prod. What's missing?", diff: "hard",
          answer: A(`<ul><li><strong>Shallow assertions</strong> — tests check "doesn't crash" not "produces correct output". Run mutation testing.</li><li><strong>Missing user paths</strong> — coverage hits code, not the way users hit it.</li><li><strong>No error-path coverage</strong> — happy paths dominate.</li><li><strong>No integration coverage</strong> — units pass in isolation, fail composed.</li><li><strong>No exploratory pre-release</strong> — automation finds known bugs; exploratory finds unknown.</li></ul><p>Coverage is a vanity metric without escape rate counterpart.</p>`) },
        { id: "sc6", q: "Regression broke 47 tests overnight. Triage.", diff: "hard",
          answer: A(`<ol><li><strong>Group by stack trace</strong> — 47 with same trace = 1 root cause. Don't chase 47 fixes.</li><li><strong>Find introducing PR</strong> — git bisect or last green commit.</li><li><strong>Decide: revert vs forward fix.</strong> Critical PR? Forward fix. Otherwise revert.</li><li><strong>Add regression test</strong> — at the right level (unit &gt; integration &gt; E2E).</li><li><strong>Communicate</strong> — "Caused by commit X, reverted, root cause Y, regression test in PR Z."</li></ol><p>Anti-pattern: 47 separate tickets. Right answer: 1 root-cause fix + 1 regression test.</p>`) },
        { id: "sc7", q: "Test a feature behind a 10% feature flag.", diff: "hard",
          answer: A(`<ul><li><strong>Force-enable in test env</strong> — header override or admin API. Don't depend on rollout sampling.</li><li><strong>Test both states</strong> — ON verifies new behavior; OFF verifies legacy.</li><li><strong>Test the toggle</strong> — flipping mid-session shouldn't break or leak data.</li><li><strong>Test rollback</strong> — flag killed at peak traffic — tests pass against OFF state.</li><li><strong>Document the flag</strong> — name, owner, planned removal date.</li></ul>`) },
      ],
    },
    {
      id: "behavioral", group: "interview", label: "Behavioral",
      desc: "STAR-format answers with concrete patterns.",
      questions: [
        { id: "bh1", q: "Tell me about a time you disagreed with a developer about a bug's severity.", diff: "mid",
          answer: A(`<p><strong>Pattern:</strong> moved the argument from opinion to data — reproduced at realistic load, quantified affected users from analytics, demoed the user experience to the PM. Outcome: severity raised, fixed before release. <strong>Signal:</strong> you escalate with evidence, not volume, and you let the data lose gracefully when it doesn't support you.</p>`) },
        { id: "bh2", q: "Describe your biggest quality miss. What changed afterwards?", diff: "hard",
          answer: A(`<p>Own a real one, no deflection: the bug, why the suite missed it (e.g. untested error path on a payment retry), the user impact in numbers. Then the systemic fix — error-path coverage became a review checklist item, escape-rate tracking started. <strong>Signal:</strong> blamelessness toward yourself too; systems thinking over heroics.</p>`) },
        { id: "bh3", q: "Tell me about mentoring someone into automation.", diff: "easy",
          answer: A(`<p><strong>Pattern:</strong> paired weekly on real suite work (not toy exercises), code-reviewed every PR with teaching comments, gave them ownership of one growing test area. Outcome with numbers: independent in a quarter, owns X suite today. <strong>Signal:</strong> you scale yourself.</p>`) },
        { id: "bh4", q: "A release shipped over your objection and broke. What did you do?", diff: "hard",
          answer: A(`<p>No "I told you so". Helped triage immediately, then brought the documented risk assessment to the postmortem as process input: the gap wasn't the decision, it was that risk wasn't visible at decision time. Proposed the release-readiness checklist that fixed it. <strong>Signal:</strong> you improve the system, not your standing.</p>`) },
      ],
    },
  ];

  const GROUPS = [
    { id: "code", numeral: "I", label: "Code & Frameworks" },
    { id: "apis", numeral: "II", label: "APIs & Data" },
    { id: "quality", numeral: "III", label: "Quality Engineering" },
    { id: "strategy", numeral: "IV", label: "Strategy & Leadership" },
    { id: "interview", numeral: "V", label: "Interview Prep" },
  ];

  // Seed state for first run — feels lived-in, like the user's real progress.
  const SEED_REVIEWED = [
    "pw1","pw2","pw3","pw5","pw7","pw9","ts1","ts4","fa1","fa3","ps3",
    "api1","api2","api3","api6","api11","sq1","sq2","sq3","ad1",
    "ci1","ci3","tt1","tt4","vr3","ff3","fs2",
    "tm1","st2","sc1","sc2","sc4","bh1","bh3",
  ];
  const SEED_FLAGGED = ["pw4", "pw8", "api4", "api13", "ci2", "sc3"];

  window.PROTO_DATA = { CATS, GROUPS, SEED_REVIEWED, SEED_FLAGGED };
})();
