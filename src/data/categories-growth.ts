import type { Category } from "../types";

/* ============================================================================
   GROWTH AREAS — categories built from the post-feedback improvement plan.
   One category per area, each with focused prep questions + answers.
   ========================================================================= */

const testManagement: Category = {
  id: "growth-test-management",
  label: "Growth: Test Management",
  desc: "Fundamentals of test planning, traceability, defect lifecycle, and reporting",
  questions: [
    {
      id: "db40cbd8-1962-4aef-95f6-5510baaa8eb0",
      q: "What belongs in a good test plan and why?",
      diff: "mid",
      tags: ["test-management", "planning"],
      answer: `<p>A test plan answers <em>what</em> we're testing, <em>why</em>, <em>how</em>, and <em>when we're done</em>. Minimum sections:</p>
<ul>
<li><strong>Scope</strong> — features in / out. Stops scope creep mid-cycle.</li>
<li><strong>Risk-based priorities</strong> — what hurts most if it breaks. Drives coverage depth.</li>
<li><strong>Approach by level</strong> — unit / API / UI / exploratory / manual. Maps to the pyramid.</li>
<li><strong>Entry &amp; exit criteria</strong> — what must be true to start and to ship.</li>
<li><strong>Environments &amp; data</strong> — where it runs, which fixtures, which accounts.</li>
<li><strong>Roles &amp; ownership</strong> — who runs what, who signs off.</li>
<li><strong>Schedule &amp; deliverables</strong> — what gets produced, by when.</li>
<li><strong>Risks &amp; mitigations</strong> — known unknowns, fallback plans.</li>
</ul>
<p>Senior signal: the plan reads like a decision-support doc, not a checklist. PMs and devs can use it without translation.</p>`
    },
    {
      id: "fdc9bf23-1745-4da7-8919-e3972b600940",
      q: "How do you design a clear, atomic test case?",
      diff: "easy",
      tags: ["test-management", "test-design"],
      answer: `<p>One behavior per case. Explicit preconditions, steps, and expected result. Example:</p>
<pre class="code"><code>ID:         TC-CHK-014
Title:      Apply 10% promo code at checkout reduces total
Linked to:  REQ-CHK-007, US-432
Priority:   High        Type: Functional
Preconditions:
  - User signed in (account: qa+promo@test)
  - Cart contains 1× SKU-1001 (€100.00)
  - Promo code SAVE10 active in admin
Steps:
  1. Open /checkout
  2. Enter "SAVE10" in promo field, click Apply
Expected:
  - Discount line "Promo SAVE10  -€10.00" shown
  - Order total updates to €90.00
  - Audit log row created with promo_code=SAVE10</code></pre>
<p>Anti-patterns: 30-step mega-cases (split them), vague expecteds ("works correctly"), no linkage back to a requirement.</p>`
    },
    {
      id: "1bb0089f-1f92-47e1-8d0d-d319f3c1aebe",
      q: "What is requirements traceability and why does it matter?",
      diff: "mid",
      tags: ["test-management", "traceability"],
      answer: `<p>Every requirement maps to one or more tests; every test traces back to a requirement (or an explicit risk). A traceability matrix typically links: requirement → test case → automation script → defect.</p>
<p><strong>Why it matters:</strong></p>
<ul>
<li>Coverage gaps surface immediately — requirements without tests are visible.</li>
<li>Change impact is scoped — when REQ-42 changes, you know which tests to update.</li>
<li>Audits / regulated industries demand it (medical, automotive, finance).</li>
<li>Defect triage is faster — bug → failing test → original requirement.</li>
</ul>
<p>Tools: TestRail, Xray, Zephyr, qTest all generate this matrix automatically when cases reference requirement IDs.</p>`
    },
    {
      id: "3c152b2c-8ece-4467-8af0-c8d7324e4d10",
      q: "Walk me through a defect's lifecycle and what QA owns at each stage.",
      diff: "mid",
      tags: ["test-management", "defects"],
      answer: `<ol>
<li><strong>New</strong> — QA files: title, steps, expected vs actual, environment, severity, attachments (log/trace/video).</li>
<li><strong>Triaged</strong> — severity + priority agreed with PM/eng lead. QA defends severity with evidence.</li>
<li><strong>Assigned</strong> — dev owns the fix. QA stays available for questions.</li>
<li><strong>In progress / fixed</strong> — dev links the PR. QA reviews the fix scope.</li>
<li><strong>Ready for verification</strong> — QA verifies on a build that contains the fix, in a clean environment.</li>
<li><strong>Verified / closed</strong> — fix confirmed; QA adds a regression test so it cannot return.</li>
<li><strong>Reopened</strong> — if it recurs, attach new evidence; never silently re-file.</li>
</ol>
<p>Senior signal: every closed bug has a regression test. Without it, you're trusting human memory.</p>`
    },
    {
      id: "b86fc6e0-2f4c-4441-bf9c-165d017c766d",
      q: "What metrics should a test report contain, and which to avoid?",
      diff: "mid",
      tags: ["test-management", "metrics", "reporting"],
      answer: `<p><strong>Useful (decision-driving):</strong></p>
<ul>
<li><strong>Defect escape rate</strong> — bugs found in prod / total bugs found. Best single-number quality signal.</li>
<li><strong>Mean time to detect / restore</strong> — how fast we catch and recover.</li>
<li><strong>Flakiness rate per suite</strong> — trustworthiness of automation.</li>
<li><strong>Coverage by risk area</strong> — not raw %, but "critical paths covered: 12 / 12".</li>
<li><strong>Test execution time &amp; trend</strong> — feedback latency for devs.</li>
</ul>
<p><strong>Vanity metrics to avoid:</strong> raw test count ("we have 5,000 tests"), pass % without context ("99% pass" while skipping 200 cases), code coverage % alone, number of bugs filed by tester (incentivizes noise).</p>
<p>A report is a recommendation, not a dump. Lead with: <em>what works, what's at risk, what we recommend.</em></p>`
    },
  ]
};

const testingStrategy: Category = {
  id: "growth-testing-strategy",
  label: "Growth: Testing Strategy",
  desc: "Confidence beyond automation — pyramid, risk-based, exploratory, acceptance",
  questions: [
    {
      id: "71fc4ddf-4cb7-4187-8875-d276388d6d8e",
      q: "How do you decide the right mix of unit, integration, and E2E tests?",
      diff: "mid",
      tags: ["strategy", "pyramid"],
      answer: `<p>Anchor on the <strong>testing pyramid</strong> (or trophy for frontends), then adjust to product risk.</p>
<ul>
<li><strong>Unit (broad base)</strong> — pure logic, edge cases, fast feedback. Cheap, deterministic.</li>
<li><strong>Integration / API</strong> — module boundaries, contracts, DB interaction. Medium speed, high value.</li>
<li><strong>E2E (narrow tip)</strong> — critical user journeys only. Slow, flaky if overused.</li>
</ul>
<p><strong>Adjust for risk:</strong> a payment flow may warrant a thicker E2E layer; a stateless utility may need almost none. Microservices push more weight to contract tests. Static UIs lean on visual regression.</p>
<p>Heuristic: if you'd write the same assertion at multiple levels, prefer the lowest level it can run honestly. Push tests <em>down</em>, not up.</p>`
    },
    {
      id: "4953a149-eae0-493a-b543-5e8fb2568704",
      q: "What is risk-based testing and how do you apply it?",
      diff: "mid",
      tags: ["strategy", "risk"],
      answer: `<p>Coverage matched to <strong>impact × likelihood</strong> of failure, not uniform across features.</p>
<ol>
<li><strong>List features &amp; flows</strong> from the requirements.</li>
<li><strong>Score impact</strong> — revenue, safety, compliance, brand. (1–5)</li>
<li><strong>Score likelihood</strong> — recent changes, complexity, third-party deps, historic bug density. (1–5)</li>
<li><strong>Multiply → priority matrix</strong> — top quadrant gets deep automation + exploratory; bottom gets smoke only.</li>
<li><strong>Review per release</strong> — risk shifts when code shifts.</li>
</ol>
<p>Senior signal: you can defend why a feature has only a smoke test ("low impact, stable for 18 months") and why another has six layers ("payment failures escalate to support and refunds").</p>`
    },
    {
      id: "3016e5e2-f8b7-469f-8bee-a853898912b9",
      q: "When is exploratory testing more valuable than automation?",
      diff: "mid",
      tags: ["strategy", "exploratory"],
      answer: `<p>Automation finds <em>known</em> bugs (regressions of behavior you specified). Exploratory finds <em>unknown</em> bugs (behavior nobody specified). They complement each other.</p>
<p><strong>Lean exploratory when:</strong></p>
<ul>
<li>A feature is new and the spec is fuzzy — automation hardens after the design stabilizes.</li>
<li>UX-heavy flows where "feel" matters as much as correctness.</li>
<li>Post-incident — look for sibling defects the automation can't see.</li>
<li>Charter-driven sessions (e.g. "abuse the cart for 60 minutes with focus on quantity edge cases").</li>
</ul>
<p>Output isn't pass/fail — it's <strong>findings, questions, new test ideas</strong>. The best findings become permanent automated cases.</p>`
    },
    {
      id: "4fb14f8a-8a0f-4d51-a489-dabafbf205b4",
      q: "How do you explain a testing strategy to non-QA stakeholders?",
      diff: "mid",
      tags: ["strategy", "communication"],
      answer: `<p>Translate testing concepts into the language of business risk.</p>
<ul>
<li><strong>Frame as risk coverage</strong>, not test count. "We protect checkout, login, and refunds at three layers because failures here cost money directly."</li>
<li><strong>Show the trade-offs</strong> — "Doubling E2E coverage adds 15 min to every PR; the same risk reduction at the API level adds 2 min."</li>
<li><strong>Use one chart, not ten</strong> — risk-quadrant or pyramid, annotated with feature names.</li>
<li><strong>Tie to metrics they care about</strong> — escape rate, MTTR, customer-reported incidents, NPS impact.</li>
</ul>
<p>If the room can't restate your strategy in their own words afterwards, you haven't explained it yet.</p>`
    },
    {
      id: "6393d97c-7ac9-4c92-8a85-260f43ec3e23",
      q: "What is acceptance testing and where does it sit in the strategy?",
      diff: "easy",
      tags: ["strategy", "acceptance"],
      answer: `<p>Acceptance tests answer "does the system meet the user's / business's need?" — pass means we can ship; fail means we cannot. Distinct from unit (does this function work) and integration (do these modules talk correctly).</p>
<ul>
<li><strong>UAT</strong> — real or proxy users validate flows against acceptance criteria, usually in a staging environment.</li>
<li><strong>BDD-style acceptance</strong> — Given / When / Then scenarios in Cucumber, SpecFlow, or similar. Co-authored with PM/BA so the spec is the test.</li>
<li><strong>Contract acceptance</strong> — for regulated domains, traceable evidence that each acceptance criterion was met before release sign-off.</li>
</ul>
<p>Position: late in the cycle, gated by the lower layers passing. They confirm intent, not implementation.</p>`
    },
  ]
};

const automationFrameworks: Category = {
  id: "growth-automation-frameworks",
  label: "Growth: Automation Frameworks",
  desc: "Survey of frameworks/libraries at each validation level and how to choose",
  questions: [
    {
      id: "4c563812-5ac4-45ae-947d-112ddf68be58",
      q: "Compare Playwright, Cypress, and Selenium / WebdriverIO for browser E2E.",
      diff: "mid",
      tags: ["automation", "e2e"],
      answer: `<ul>
<li><strong>Playwright</strong> — multi-browser (Chromium, Firefox, WebKit), great async/await ergonomics, built-in tracing, parallelism, auto-wait. Strong default in 2025+.</li>
<li><strong>Cypress</strong> — exceptional DX, time-travel debugger, in-browser runner. Historically limited to single-tab Chromium; cross-origin and parallel-by-default are weaker.</li>
<li><strong>Selenium / WebdriverIO</strong> — widest language and grid ecosystem, mature, slower feedback loop. Pick when you need exotic browsers/devices or already have Grid infra.</li>
</ul>
<p>Decision drivers: cross-browser need, language preference, CI parallelism, debugging UX, team experience. Pilot two of them on the same flow before standardizing.</p>`
    },
    {
      id: "403673c6-9a2f-4afe-aafb-05be1afe1c5f",
      q: "What unit / component test frameworks would you survey for a modern web stack?",
      diff: "easy",
      tags: ["automation", "unit"],
      answer: `<ul>
<li><strong>Vitest</strong> — Vite-native, Jest-compatible API, very fast in modern frontends.</li>
<li><strong>Jest</strong> — long-time default; biggest ecosystem of matchers/plugins. Slower than Vitest in Vite projects.</li>
<li><strong>@testing-library</strong> — user-centric component queries. Pairs with Vitest or Jest.</li>
<li><strong>Storybook test runner / interaction tests</strong> — exercise component stories as tests; great for design-system coverage.</li>
<li><strong>Mocha + Chai</strong> — flexible but assembly-required; still common in Node libs.</li>
</ul>
<p>Backend equivalents to know: JUnit 5 (Java), pytest (Python), Go test, RSpec / Minitest (Ruby), xUnit / NUnit (.NET).</p>`
    },
    {
      id: "f2df1962-77f1-455b-af9d-394fa0153554",
      q: "Which tools cover API and load testing, and when do you reach for each?",
      diff: "mid",
      tags: ["automation", "api", "performance"],
      answer: `<p><strong>Functional API:</strong></p>
<ul>
<li><strong>Postman / Newman</strong> — fast iteration, CI-runnable via Newman. Good for collections + docs.</li>
<li><strong>REST Assured</strong> (Java), <strong>Supertest</strong> (Node), <strong>HTTPx + pytest</strong> (Python) — code-first, fits CI naturally.</li>
<li><strong>Karate</strong> — DSL-style, mixes functional + perf, lower-code.</li>
</ul>
<p><strong>Contract:</strong></p>
<ul>
<li><strong>Pact</strong> — consumer-driven contracts; great for microservice fleets.</li>
<li><strong>Spring Cloud Contract</strong> — JVM-centric alternative.</li>
</ul>
<p><strong>Load / performance:</strong></p>
<ul>
<li><strong>k6</strong> — JS scripts, modern, cloud-friendly.</li>
<li><strong>JMeter</strong> — GUI + plugins, mature.</li>
<li><strong>Gatling</strong> — Scala DSL, excellent reports.</li>
<li><strong>Locust</strong> — Python, easy to ramp.</li>
</ul>
<p>Mobile: Appium (cross-platform), Maestro (declarative flows), Espresso (Android), XCUITest (iOS). Match tool to platform, team language, and CI fit.</p>`
    },
    {
      id: "1bfec75b-382a-48e0-9e31-2e7767b72078",
      q: "How do you evaluate and select a new automation framework?",
      diff: "mid",
      tags: ["automation", "selection"],
      answer: `<ol>
<li><strong>Define decision criteria up front</strong> — language fit, learning curve, CI integration, parallelism, debugging UX, community size, license, vendor lock-in, cost.</li>
<li><strong>Time-boxed POC</strong> — implement 2–3 representative flows in each candidate. Same scope, side-by-side.</li>
<li><strong>Measure, don't guess</strong> — speed, flake rate, lines of test code, time for a new engineer to add a case.</li>
<li><strong>Involve the team</strong> — they'll live with the choice; their friction is data.</li>
<li><strong>Plan migration</strong> — even the right tool fails if you big-bang the rewrite. Strangler pattern: new tests in new framework, port high-value old tests opportunistically.</li>
</ol>
<p>Anti-pattern: picking the framework because it's trending. Pick it because it scores best on <em>your</em> criteria.</p>`
    },
    {
      id: "6bbf34e1-e21f-4607-8177-997146409627",
      q: "How do you keep up with new frameworks without chasing every trend?",
      diff: "easy",
      tags: ["automation", "learning"],
      answer: `<ul>
<li><strong>Set a steady cadence</strong> — one focused topic per month beats sporadic binges.</li>
<li><strong>Curated inputs</strong> — release notes of tools you use, Testing in the Pub / Ministry of Testing, State of Testing report, a couple of trusted blogs (e.g. Kent Dodds, Michael Bolton, Maaret Pyhäjärvi).</li>
<li><strong>Build a tiny demo</strong> per new framework — reading is not learning; using it is.</li>
<li><strong>Compare on real criteria</strong> against the incumbent. If it doesn't beat what you have on a measurable axis, park it.</li>
<li><strong>Share back</strong> — a 10-minute team demo cements the learning and earns mindshare.</li>
</ul>
<p>The goal isn't to know every tool — it's to recognize which class of tool to reach for, and to evaluate it on merits.</p>`
    },
  ]
};

const apiDatabaseTesting: Category = {
  id: "growth-api-db-testing",
  label: "Growth: API & DB Testing",
  desc: "API contracts, auth, schema validation, plus SQL & NoSQL data verification",
  questions: [
    {
      id: "df6a5cc8-45b3-4705-a0b7-3d21d42cd388",
      q: "What does a thorough API test for a single endpoint cover?",
      diff: "mid",
      tags: ["api", "coverage"],
      answer: `<ul>
<li><strong>Happy path</strong> — valid request, correct status, payload, headers, side effects in the DB.</li>
<li><strong>Schema validation</strong> — assert response shape against JSON Schema / OpenAPI; catches silent contract drift.</li>
<li><strong>Auth &amp; authz</strong> — missing token → 401, wrong role → 403, valid → 200. Test token expiry &amp; refresh.</li>
<li><strong>Input validation</strong> — boundary values, wrong types, missing required fields, oversize payloads, injection attempts.</li>
<li><strong>Error paths</strong> — 4xx for client errors, 5xx for server errors, consistent error envelope.</li>
<li><strong>Idempotency &amp; concurrency</strong> — replay POST with same idempotency key; concurrent writes.</li>
<li><strong>Side effects</strong> — DB rows created/updated, events emitted, downstream services called.</li>
<li><strong>Performance baseline</strong> — p50/p95/p99 latency, payload size; alarm on regressions.</li>
</ul>
<p>Layer this: contract tests at module boundary, end-to-end checks for the integrated path, smoke checks in production.</p>`
    },
    {
      id: "cc815d1b-4401-4eb2-be89-de221ae401a7",
      q: "Show a query you'd use to verify data integrity after a migration.",
      diff: "mid",
      tags: ["sql", "data-integrity"],
      answer: `<p>Validate row counts, referential integrity, value distributions, and nullability — before and after.</p>
<pre class="code"><code>-- Row count parity
SELECT (SELECT count(*) FROM orders_v2)
     - (SELECT count(*) FROM orders_v1) AS row_delta;

-- Orphans (FK integrity)
SELECT count(*) AS orphan_items
FROM order_items oi
LEFT JOIN orders_v2 o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Distribution / spot drift (status enum)
SELECT status, count(*) AS n
FROM orders_v2
GROUP BY status
ORDER BY n DESC;

-- Nullability invariants
SELECT count(*) AS missing_user
FROM orders_v2
WHERE user_id IS NULL;

-- Per-row hash to detect silent value drift
SELECT id, md5(concat_ws('|', status, total::text, currency)) AS h
FROM orders_v2
EXCEPT
SELECT id, md5(concat_ws('|', status, total::text, currency))
FROM orders_v1;</code></pre>
<p>Senior habit: capture these as a <em>migration verification script</em> committed alongside the migration, runnable in any environment.</p>`
    },
    {
      id: "cf7d8cf7-2777-4d3c-a8ec-fb28d08a063f",
      q: "Explain JOINs, GROUP BY, and window functions with a QA-flavored example.",
      diff: "mid",
      tags: ["sql", "fundamentals"],
      answer: `<pre class="code"><code>-- INNER JOIN — orders + their customer name
SELECT o.id, u.email, o.total
FROM orders o
JOIN users u ON u.id = o.user_id;

-- LEFT JOIN — find users with no orders (regression suspects)
SELECT u.id, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- GROUP BY — revenue per day
SELECT date_trunc('day', created_at) AS d,
       sum(total) AS revenue,
       count(*)   AS n
FROM orders
GROUP BY 1
ORDER BY 1;

-- Window function — rank latest orders per user
SELECT id, user_id, total, created_at,
       row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM orders;
-- WHERE rn = 1  → most recent order per user</code></pre>
<p>QA use cases: spot orphans (LEFT JOIN ... IS NULL), validate aggregate KPIs (GROUP BY), detect duplicate-most-recent rows (window functions). These are the workhorses of data verification.</p>`
    },
    {
      id: "7e3ee435-5721-47a8-b37d-6bc320649713",
      q: "How is testing a NoSQL store (MongoDB, DynamoDB, Redis) different from SQL?",
      diff: "hard",
      tags: ["nosql", "data"],
      answer: `<ul>
<li><strong>Schema drift</strong> — schema is implicit. Run a probe that samples N documents per collection and asserts a baseline shape; alert on new/missing fields.</li>
<li><strong>Eventual consistency</strong> — reads may not see the latest write. Tests must retry-with-timeout or use consistent-read flags where available. Don't assume read-after-write.</li>
<li><strong>Index coverage</strong> — verify queries hit indexes (<code>explain()</code> in Mongo, CloudWatch metrics for DynamoDB). Missing indexes silently degrade prod, not tests.</li>
<li><strong>Partition / hot-key patterns</strong> — generate load that exercises multiple partition keys, not a single one.</li>
<li><strong>TTL &amp; eviction</strong> — Redis keys vanish on TTL; tests need clock control or fixed TTLs.</li>
<li><strong>Aggregation pipelines / map-reduce</strong> — golden-data tests: known input → expected aggregated output. Pin the pipeline definition.</li>
<li><strong>Schema validation hooks</strong> — Mongo $jsonSchema validators, Dynamo conditional expressions; assert these are enforced.</li>
</ul>
<p>Mental model: SQL guarantees you've forgotten exist in NoSQL must become explicit tests.</p>`
    },
    {
      id: "48b683e8-7d4b-49ad-92d9-ae1c45a5af47",
      q: "End-to-end: call an API, then verify state in the database. How do you structure it?",
      diff: "mid",
      tags: ["api", "db", "integration"],
      answer: `<ol>
<li><strong>Seed</strong> — fixture inserts the minimum prerequisite rows, or use a builder.</li>
<li><strong>Act</strong> — call the API; capture status, body, and any returned IDs.</li>
<li><strong>Assert API response</strong> — schema + business rules.</li>
<li><strong>Assert DB state</strong> — query the specific row(s) and verify mutated fields, audit log, soft-deletes.</li>
<li><strong>Assert side effects</strong> — events on the bus, files in storage, third-party callbacks (use a stub recorder).</li>
<li><strong>Teardown</strong> — clean up by ID, or wrap in a transaction that rolls back.</li>
</ol>
<pre class="code"><code>// Sketch — Node + Supertest + pg
const userId = await seedUser({ email: 'qa+chk@test' });
const res = await request(app)
  .post('/orders')
  .set('Authorization', \`Bearer \${await tokenFor(userId)}\`)
  .send({ sku: 'SKU-1001', qty: 2 });

expect(res.status).toBe(201);
expect(res.body).toMatchSchema(orderResponseSchema);

const { rows } = await db.query(
  'SELECT status, total FROM orders WHERE id = $1', [res.body.id]
);
expect(rows[0]).toEqual({ status: 'pending', total: '200.00' });</code></pre>
<p>Senior signal: API + DB asserted in the same test, with deterministic seed and cleanup. No reliance on prior test state.</p>`
    },
  ]
};

const drivingImprovements: Category = {
  id: "growth-driving-improvements",
  label: "Growth: Driving Improvements",
  desc: "Confidence to propose change beyond the team's current process",
  questions: [
    {
      id: "858b32dd-28f3-4726-9b1e-186bb35a103c",
      q: "How do you propose a process change without alienating the team?",
      diff: "mid",
      tags: ["improvement", "soft-skills"],
      answer: `<ol>
<li><strong>Name the pain together</strong> — surface the problem with shared data (incidents, metrics, retro themes). Earn agreement on the diagnosis first.</li>
<li><strong>Propose a small, reversible experiment</strong> — "Let's try X for 2 sprints and review."</li>
<li><strong>Define success up front</strong> — what metric moves, by how much, in what time. Pre-commit so you can't move the goalposts later.</li>
<li><strong>Involve skeptics in the design</strong> — they catch flaws and become co-owners.</li>
<li><strong>Run, measure, share</strong> — short readout: data, what worked, what didn't, next step (keep / tweak / drop).</li>
</ol>
<p>Anti-pattern: bringing a polished mandate to a team that didn't co-create the problem. People defend processes they weren't asked about.</p>`
    },
    {
      id: "495428f0-829b-48c8-a078-db94dd2b00e8",
      q: "Write a one-page proposal template you would use for a change.",
      diff: "easy",
      tags: ["improvement", "communication"],
      answer: `<pre class="code"><code>TITLE: &lt;short, action-oriented — "Move smoke tests to PR gate"&gt;
OWNER: &lt;name&gt;        DATE: &lt;yyyy-mm-dd&gt;       STATUS: Proposed | Trial | Adopted | Dropped

1. CURRENT STATE
   What we do today and why it falls short. Include data
   (escape rate, MTTR, flake %, dev wait time).

2. PROBLEM
   One sentence. The cost of doing nothing.

3. PROPOSED CHANGE
   Specific, scoped, reversible. What changes, what stays the same.

4. EXPECTED IMPACT
   Which metric moves, by how much, by when.

5. RISKS &amp; MITIGATIONS
   What could go wrong; how we'd detect and roll back.

6. MEASUREMENT PLAN
   Baseline (today), target, cadence of review, decision criteria
   to keep / tweak / drop.

7. ASK
   What do you need? People, time, tools, a yes.</code></pre>
<p>One page forces clarity. If it can't fit, the proposal isn't ready.</p>`
    },
    {
      id: "dee71b5f-b6d2-49f9-88a7-b352d57764a8",
      q: "How do you anchor a proposal in external benchmarks (without being pretentious)?",
      diff: "mid",
      tags: ["improvement", "research"],
      answer: `<ul>
<li><strong>Quote sources, don't lean on them</strong> — "DORA shows elite teams have lead time &lt; 1 day; we're at 6 days." One number, one source.</li>
<li><strong>Prefer benchmarks the audience trusts</strong> — DORA / State of DevOps, State of Testing, ISTQB body of knowledge, well-known engineering blogs in your domain.</li>
<li><strong>Adapt, don't import</strong> — "Spotify squads" verbatim almost always fails. Take the principle, fit the context.</li>
<li><strong>Show that you considered alternatives</strong> — "We could do A, B, or C; B fits because…" Demonstrates rigor.</li>
<li><strong>Acknowledge limits</strong> — "This benchmark is from B2C SaaS; we're B2B regulated. Here's what still applies."</li>
</ul>
<p>External evidence supports judgment — it doesn't replace it. Bring the data and own the recommendation.</p>`
    },
    {
      id: "666d3507-3437-4180-b4c0-6c9074bee8c9",
      q: "How do you measure whether a process improvement actually worked?",
      diff: "mid",
      tags: ["improvement", "metrics"],
      answer: `<ol>
<li><strong>Baseline before changing anything</strong> — at minimum 2–4 weeks of the metric you intend to move.</li>
<li><strong>Pick a primary &amp; a guardrail metric</strong> — primary (escape rate ↓) plus a guardrail to catch unintended harm (PR cycle time should not go up).</li>
<li><strong>Pre-commit to the decision rule</strong> — "If escape rate drops ≥30% over 8 weeks without guardrail regression, we adopt."</li>
<li><strong>Watch for confounders</strong> — release cadence change, team size, holiday week. Annotate the chart.</li>
<li><strong>Be willing to drop it</strong> — a failed experiment is a successful learning. The org earns trust to try the next one.</li>
</ol>
<p>Anti-pattern: declaring victory on vibes. "Feels faster" is not a result; it's a hypothesis.</p>`
    },
    {
      id: "166e492c-a3d1-46f3-8fc6-a07548ef9235",
      q: "How do you spot improvement opportunities the team has stopped noticing?",
      diff: "hard",
      tags: ["improvement", "observation"],
      answer: `<ul>
<li><strong>New-hire questions are gold</strong> — "Why do we do X?" without a good answer is a signal. Capture them in the first 30 days before normalization sets in.</li>
<li><strong>Look at the friction logs</strong> — Slack threads with repeated "ugh again" reactions, retro themes that recur quarter over quarter, the same Confluence page edited every release.</li>
<li><strong>Time the small annoyances</strong> — a 15-min ritual × 5 people × weekly is 65h/year. Quantifying makes the case.</li>
<li><strong>Compare to a peer team or external benchmark</strong> — sometimes you only see the smell when standing outside.</li>
<li><strong>Pair with someone different</strong> — a dev, a designer, a support engineer. Fresh eyes catch what veterans filter out.</li>
</ul>
<p>The senior move: turn a vague complaint into a measured proposal. Anyone can complain; few can move it to action.</p>`
    },
  ]
};

export const GROWTH_CATEGORIES: Category[] = [
  testManagement,
  testingStrategy,
  automationFrameworks,
  apiDatabaseTesting,
  drivingImprovements,
];
