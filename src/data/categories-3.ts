import type { Category } from "../types";

const ciFlakiness: Category = {
  id: "ci-flakiness",
  label: "CI/CD & flakiness",
  desc: "GitHub Actions, sharding, parallelism, ruthless flakiness reduction",
  questions: [
    {
      id: "5ccf56b5-112d-4b1a-8049-93a0a5cc1f67",
      q: "Set up GitHub Actions to run Playwright tests with sharding.",
      diff: "mid",
      tags: ["ci", "github-actions"],
      answer: `<pre class="code"><code>jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=\${{ matrix.shard }}
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-\${{ strategy.job-index }}
          path: playwright-report/
          retention-days: 7</code></pre>
<p><strong>Senior touches:</strong> <code>fail-fast: false</code> so one failed shard doesn't kill others, <code>--with-deps</code> installs system deps, <code>if: always()</code> uploads reports on failure (you need them most then).</p>`
    },
    {
      id: "780f5907-0b42-4297-82bb-b7c518a9cd1c",
      q: "Sharding vs. parallelism in Playwright?",
      diff: "mid",
      tags: ["ci"],
      diagram: `graph TB
  subgraph PAR["Parallelism (vertical)"]
    M1["1 machine<br/>workers: 4"] --> P1[w1] & P2[w2] & P3[w3] & P4[w4]
  end
  subgraph SHARD["Sharding (horizontal)"]
    SUITE["test suite"] --> S1[shard 1/4] & S2[shard 2/4] & S3[shard 3/4] & S4[shard 4/4]
    S1 --> MA[machine A]
    S2 --> MB[machine B]
    S3 --> MC[machine C]
    S4 --> MD[machine D]
  end
  PAR --- COMBINE["Combine: 4 machines × 4 workers = 16×"] --- SHARD`,
      answer: `<ul>
<li><strong>Parallelism</strong> — workers within one machine. <code>workers: 4</code>. Limited by machine resources.</li>
<li><strong>Sharding</strong> — split suite across machines. <code>--shard=2/4</code>. Limited by CI budget.</li>
</ul>
<p><strong>Combine:</strong> 4 machines × 4 workers = 16x parallelism. Sharding scales horizontally; parallelism scales vertically.</p>
<p>Backend capacity caps combined parallelism. 16 workers hammering staging DB → saturation, parallelism stops helping and starts causing flakes.</p>`
    },
    {
      id: "32c22f5b-55dc-4674-89fb-4707d194e40e",
      q: "Walk through your investigation process for a flaky test.",
      diff: "hard",
      tags: ["flakiness", "debugging"],
      diagram: `flowchart TD
  R["Reproduce<br/>(--repeat-each=20)"] --> T["Trace viewer<br/>inspect failure"]
  T --> CAT{"Categorize"}
  CAT --> AW[Auto-wait gap]
  CAT --> RC[Race condition]
  CAT --> ISO[Test isolation]
  CAT --> ANIM[Animation]
  CAT --> NET[Network / 3rd party]
  CAT --> SEL[Selector ambiguity]
  AW & RC & ISO & ANIM & NET & SEL --> FIX["Fix root cause<br/>(never just sleep)"]
  FIX --> V["Verify<br/>(--repeat-each=50, 100%)"]
  V --> Q{"Still flaky?"}
  Q -->|yes| QUAR["Quarantine + ticket"]
  Q -->|no| DONE[Ship]`,
      answer: `<ol>
<li><strong>Reproduce</strong> — <code>--repeat-each=20</code> locally and in CI. Confirm flake rate.</li>
<li><strong>Trace viewer</strong> — capture <code>trace: 'on'</code>, run until fail, inspect.</li>
<li><strong>Categorize:</strong>
<ul>
<li>Auto-wait gap — Playwright clicked before API completed.</li>
<li>Race condition — restructure or serialize.</li>
<li>Test isolation — prior test polluted state.</li>
<li>Animation — element moves during click.</li>
<li>Network — third-party slow, mock it.</li>
<li>Selector — matches multiple elements.</li>
</ul>
</li>
<li><strong>Fix root cause</strong> — never just <code>waitForTimeout</code>.</li>
<li><strong>Verify</strong> — <code>--repeat-each=50</code>. 100% pass rate.</li>
<li><strong>Quarantine if needed</strong> — tag (<code>@flaky</code>), exclude from PR runs, track in nightly.</li>
</ol>`
    },
    {
      id: "d1da3154-f534-4e9c-9881-49c6cd6880e1",
      q: "Why is 'just add retries' the wrong default fix for flakiness?",
      diff: "hard",
      tags: ["flakiness"],
      answer: `<p>Retries hide problems instead of fixing them:</p>
<ul>
<li><strong>Hidden race conditions</strong> — your test catches a real bug 1% of the time. Retries make it invisible. Bug ships.</li>
<li><strong>CI cost</strong> — every retry doubles affected test runtime.</li>
<li><strong>Trust erosion</strong> — green builds with hidden flakes train teams to ignore failures.</li>
<li><strong>Architecture decay</strong> — without flake metric, brittle patterns proliferate.</li>
</ul>
<p>Right approach: retries as CI safety net (1–2 max), not permanent solution. Track flakiness rate. Tests that flake repeatedly get fixed or quarantined.</p>`
    },
    {
      id: "e9727e5a-065b-450a-876c-ff52c72ab9b5",
      q: "Top 5 causes of flakiness in Playwright tests.",
      diff: "mid",
      tags: ["flakiness"],
      answer: `<ol>
<li><strong>Hard waits (<code>waitForTimeout</code>)</strong> — magic numbers, work locally, fail in CI.</li>
<li><strong>Brittle selectors</strong> — CSS/XPath that change with UI tweaks. Fix: <code>getByRole</code>, <code>getByTestId</code>.</li>
<li><strong>Test isolation failures</strong> — shared DB rows, leftover state, hardcoded user IDs.</li>
<li><strong>Async race conditions</strong> — clicking before API completes. Auto-waiting waits for element, not API.</li>
<li><strong>External dependencies</strong> — third-party APIs, slow network, eventually consistent backends.</li>
</ol>
<p>Honorable mention: random test data without fixed seed. <code>faker.name.first()</code> producing 'O\\'Brien' once a month and breaking your CSV export test.</p>`
    },
    {
      id: "1a6418dd-f015-4c78-94bc-0d293a62d641",
      q: "How do you handle secrets in CI without leaking them in traces?",
      diff: "hard",
      tags: ["security", "ci"],
      answer: `<ul>
<li><strong>Inject via CI secret store</strong> — GH Secrets, Vault, Doppler.</li>
<li><strong>Mask in logs</strong> — auto-masks literal values; computed values leak.</li>
<li><strong>Disable trace recording on auth</strong> — traces capture form fields. Login records the password. Use <code>tracing.start()</code>/<code>stop()</code> around sensitive sections.</li>
<li><strong>Scrub artifacts before sharing</strong> — check what's in trace files before forwarding.</li>
<li><strong>Dedicated test accounts</strong> — never personal/production credentials. Rotate quarterly.</li>
<li><strong>Scope minimally</strong> — read-only where possible.</li>
</ul>`
    },
    {
      id: "d3956ef3-b676-4cef-a0e4-2bafdd3f671d",
      q: "Set up auth once and reuse across all tests in CI.",
      diff: "mid",
      tags: ["ci", "auth"],
      answer: `<pre class="code"><code>// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
  },
]

// auth.setup.ts
import { test as setup } from '@playwright/test';
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) =&gt; {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile });
});</code></pre>
<p>For multiple roles: separate state files per role. Faster: skip UI login, hit auth API directly to mint a token.</p>`
    },
    {
      id: "9dfdd721-4fa7-4412-86f7-e719f0c363ad",
      q: "Design a CI strategy: PR vs. nightly vs. on-demand.",
      diff: "mid",
      tags: ["ci", "strategy"],
      diagram: `flowchart LR
  PR["PR opened"] --> Q1["Lint + unit<br/>+ smoke E2E<br/><10 min"]
  Q1 -->|"pass"| MERGE["Merge to main"]
  MERGE --> Q2["Affected tests<br/>+ integration"]
  Q2 -->|"pass"| ART["Build artifact"]
  ART --> PRED["Pre-deploy smoke"]
  PRED -->|"green"| DEPLOY["Deploy"]
  NIGHT["Nightly cron"] --> FULL["Full regression<br/>against staging"]
  ONDEM["On-demand"] --> PERF["Performance / load<br/>exploratory"]`,
      answer: `<table style="width:100%; font-size:13px; border-collapse: collapse;">
<tr><th style="text-align:left; padding:6px;">Trigger</th><th style="text-align:left; padding:6px;">Runs</th><th style="text-align:left; padding:6px;">Goal</th></tr>
<tr><td style="padding:6px;">PR</td><td>Lint + unit + smoke E2E</td><td>&lt;10 min</td></tr>
<tr><td style="padding:6px;">Merge to main</td><td>Affected tests + integration</td><td>Catch what slipped</td></tr>
<tr><td style="padding:6px;">Nightly</td><td>Full regression on staging</td><td>Comprehensive</td></tr>
<tr><td style="padding:6px;">On-demand</td><td>Performance, load, exploratory</td><td>Pre-release</td></tr>
<tr><td style="padding:6px;">Pre-deploy</td><td>Smoke vs. deploy artifact</td><td>Final gate</td></tr>
</table>
<p>Each gate guards different risk at different cost. PR gate &gt; 30min gets bypassed. Nightly &lt; 10min is too thin.</p>`
    },
    {
      id: "41d19a7f-bb74-4148-85be-3a656fb731bb",
      q: "What metrics do you track for test suite health?",
      diff: "hard",
      tags: ["metrics"],
      answer: `<ul>
<li><strong>Flakiness rate</strong> — % flaking per run. Target &lt; 1%.</li>
<li><strong>Pass rate trend</strong> — over weeks. Sudden drops = regressions or rot.</li>
<li><strong>Mean test duration</strong> — slow tests are rot signal. P95 matters more.</li>
<li><strong>Defect escape rate</strong> — bugs in prod / total bugs. Direct effectiveness measure.</li>
<li><strong>Mean time to detect</strong> — defect introduction to suite catching it.</li>
<li><strong>CI runtime P50/P95</strong> — slow CI = slow team. PR &lt; 10min, nightly &lt; 60min.</li>
<li><strong>Mutation score</strong> — assertion quality, if you have the budget.</li>
</ul>
<p>Pick one: <strong>flakiness rate</strong>. Captures suite reliability — foundation for everything else.</p>`
    },
    {
      id: "4b0efaba-9e6f-4d09-97aa-4a6d36722f24",
      q: "How do you cache dependencies efficiently in GitHub Actions?",
      diff: "mid",
      tags: ["ci", "performance"],
      answer: `<pre class="code"><code>- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # caches based on package-lock.json

# Playwright browser cache
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: \${{ runner.os }}-playwright-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-playwright-

- run: npx playwright install --with-deps</code></pre>
<p>Saves 1–2 minutes per run. Cache key includes lock file hash so cache invalidates when deps change. <code>restore-keys</code> falls back to partial matches.</p>`
    },
    {
      id: "2fb38f36-1e2d-4ddf-9cd1-346ceeb3bb1d",
      q: "How do you reduce CI cost without sacrificing coverage?",
      diff: "hard",
      tags: ["ci", "performance"],
      answer: `<ul>
<li><strong>Run only affected tests on PR</strong> — git diff + test mapping or Nx.</li>
<li><strong>Tag tests by criticality</strong> — <code>@smoke</code>, <code>@regression</code>. Run smoke on PR, full nightly.</li>
<li><strong>Parallelize aggressively</strong> — wall-clock time matters more than CPU minutes.</li>
<li><strong>Cache everything</strong> — node_modules, browsers, builds.</li>
<li><strong>Use spot/preemptible runners</strong> — 60–80% cheaper for batch jobs.</li>
<li><strong>Drop redundant E2E</strong> — anything covered by unit/integration tests.</li>
<li><strong>Tighten retention</strong> — 7 days for artifacts, not 90.</li>
</ul>
<p>Measure first. Top 5 slowest tests usually consume 40%+ of runtime — fix or split them.</p>`
    },
    {
      id: "791b007d-9f2d-4cf3-845c-1e5e69cbe941",
      q: "What's the difference between a smoke test suite and a critical-path suite?",
      diff: "mid",
      tags: ["strategy"],
      answer: `<ul>
<li><strong>Smoke</strong> — proves the build is alive. Login works, homepage loads, can navigate. Fast (5min). Run on every commit. Failure = revert or block.</li>
<li><strong>Critical-path</strong> — proves the most important user journeys complete end-to-end. Login → checkout → confirmation. Slower (15–30min). Run on merge to main or pre-release. Failure = release blocker.</li>
</ul>
<p>Smoke is "the lights are on". Critical-path is "the business runs". Both gate releases at different stages.</p>`
    },
    {
      id: "aa08276f-2174-4285-93c9-ab07acf20a0d",
      q: "Your CI has 30% failure rate from environment instability. What do you do?",
      diff: "hard",
      tags: ["ci", "incident"],
      answer: `<p>Treat it as an incident, not a test problem.</p>
<ol>
<li><strong>Quantify</strong> — flake rate by failure type. Network errors? Container startup? Shared DB? Each has different fix.</li>
<li><strong>Stabilize the env</strong> — health check loops before tests run. Pinned versions. Docker compose with <code>healthcheck</code> + <code>depends_on</code>.</li>
<li><strong>Isolate per worker</strong> — if 30% of failures are state collisions, give each worker its own tenant.</li>
<li><strong>Add observability</strong> — log every failure with context. Correlate with infra metrics.</li>
<li><strong>Quarantine + fix incrementally</strong> — don't try to fix 100 failures at once. Fix the top cause, measure improvement, repeat.</li>
<li><strong>Communicate</strong> — daily updates to the team. Show the trend line going down.</li>
</ol>
<p>The wrong move: "just add retries". You'll never recover trust.</p>`
    },
    {
      id: "0e4f6ce4-2fb3-47bc-8724-79b12f8dc146",
      q: "How do you generate and publish test reports?",
      diff: "mid",
      tags: ["ci", "reporting"],
      answer: `<pre class="code"><code>// Playwright config
reporter: [
  ['html', { open: 'never' }],         // local HTML
  ['junit', { outputFile: 'results.xml' }],  // CI integration
  ['github'],                           // GitHub annotations
  ['list'],                             // console
],

// GitHub Actions: publish HTML report
- if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/

// Optional: deploy to GitHub Pages or Allure dashboard
- name: Deploy report
  uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: ./playwright-report</code></pre>
<p>For long-term trend analysis: ship results to Allure TestOps, ReportPortal, or a custom Grafana dashboard. Without trend data, you can't measure improvement.</p>`
    },
    {
      id: "617070e3-b47f-4a90-b459-aa74e9c1cda7",
      q: "Your team complains the CI pipeline is too slow. They want you to skip QA gates. What's your response?",
      diff: "hard",
      tags: ["ci", "soft-skills"],
      answer: `<p>Address the pain, not the symptom. The team is right that slow CI is a real cost. Wrong solution would be skipping gates.</p>
<p><strong>Sequence:</strong></p>
<ol>
<li><strong>Validate the complaint</strong> — measure actual P95 runtime. Show the data.</li>
<li><strong>Acknowledge the cost</strong> — "you're right, 25min PR cycle is too long".</li>
<li><strong>Identify wins</strong> — top 5 slowest tests, missing parallelism, build cache opportunities.</li>
<li><strong>Propose timeline</strong> — "I can get this to 8min in 2 sprints. Can you live with current pain that long?"</li>
<li><strong>Quick win first</strong> — sharding, caching. Visible improvement in 1 week.</li>
<li><strong>Track the metric publicly</strong> — Slack post weekly with the trend line.</li>
</ol>
<p>Don't accept "skip QA". Don't dismiss the complaint. The right response is "yes, that's a real problem; here's the fix that doesn't sacrifice quality".</p>`
    },
    {
      id: "f00b6a7d-b754-4ac3-9f18-e74f8a817747",
      q: "How do you set up Docker for Playwright tests in CI?",
      diff: "mid",
      tags: ["ci", "docker"],
      answer: `<p>Use Microsoft's official Playwright Docker image — guarantees identical browser versions across local and CI.</p>
<pre class="code"><code># Dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test"]

# GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.49.0-jammy
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test</code></pre>
<p>Pin the image version — <code>:latest</code> creates "works yesterday, breaks today" surprises. Image versions match Playwright versions exactly. Update both together.</p>`
    },
    {
      id: "9842280d-aa2f-4688-8eb5-c49414d0630b",
      q: "How do you implement test result trending across runs?",
      diff: "hard",
      tags: ["ci", "metrics"],
      answer: `<p>Three options by sophistication:</p>
<ul>
<li><strong>Allure TestOps / ReportPortal</strong> — SaaS or self-hosted. Ingest test results, get dashboards out of the box. Best ROI for medium-large teams.</li>
<li><strong>Custom dashboard</strong> — push test results to PostgreSQL or InfluxDB after each CI run. Visualize in Grafana. Total control, more maintenance.</li>
<li><strong>GitHub Pages</strong> — generate HTML report per run, publish to a branch. Free, but no aggregation across runs.</li>
</ul>
<pre class="code"><code>// Custom: push results after each run
- name: Push results to dashboard
  if: always()
  run: |
    curl -X POST $METRICS_URL \\
      -H "Content-Type: application/json" \\
      -d '{
        "branch": "\${{ github.ref_name }}",
        "commit": "\${{ github.sha }}",
        "passed": $(jq .stats.expected results.json),
        "failed": $(jq .stats.unexpected results.json),
        "flaky": $(jq .stats.flaky results.json),
        "duration": $(jq .stats.duration results.json)
      }'</code></pre>
<p>Without trends you can't measure improvement. Pick the simplest option that gives you that.</p>`
    },
  ]
};

const testingTheory: Category = {
  id: "testing-theory",
  label: "Testing theory",
  desc: "ISTQB foundations applied to senior decisions, not memorized definitions",
  questions: [
    {
      id: "57364365-abc8-4bed-af03-f68df6a4be0b",
      q: "Verification vs. validation — give a concrete example.",
      diff: "easy",
      tags: ["fundamentals"],
      answer: `<ul>
<li><strong>Verification</strong> — "are we building the product right?" Static checks: code review, requirement review.</li>
<li><strong>Validation</strong> — "are we building the right product?" Dynamic checks: UAT, exploratory testing, beta.</li>
</ul>
<p>Real example: spec says "users can reset password". Verification confirms code matches spec — form submits, email sends. Validation confirms spec was right — does the user understand? Does email reach inbox? Does flow recover from edge cases?</p>
<p>A feature can pass verification and fail validation. Most expensive class of bug.</p>`
    },
    {
      id: "02deedc0-643b-4dd8-8aa0-feec4ed0d118",
      q: "What is shift-left testing? Apply it to a real sprint.",
      diff: "mid",
      tags: ["process"],
      diagram: `graph LR
  REF["Refinement<br/>review AC, ask 'how to verify?'"]
  KICK["Story kickoff<br/>Gherkin before code"]
  PAIR["Pair on testability<br/>test-ids, debug hooks"]
  CONTRACT["API contract<br/>schema first"]
  PARALLEL["Parallel test dev<br/>tests while dev codes"]
  E2E["Traditional E2E<br/>after dev complete"]
  REF --> KICK --> PAIR --> CONTRACT --> PARALLEL --> E2E
  COST["Bug cost: $1"] -.- REF
  COST2["Bug cost: $100+"] -.- E2E`,
      answer: `<p>Move quality activities earlier. Sprint application:</p>
<ul>
<li><strong>Refinement</strong> — review AC, ask "how will I verify?", flag ambiguity.</li>
<li><strong>Story kickoff</strong> — write Gherkin with the dev before they code.</li>
<li><strong>Pair on testability</strong> — request <code>data-testid</code>, debug hooks, deterministic feature flags.</li>
<li><strong>API contract first</strong> — agree on schema before implementation.</li>
<li><strong>Parallel test development</strong> — write API/component tests as dev codes, not after.</li>
</ul>
<p>Bugs caught at refinement cost minutes. Bugs caught in production cost hours and trust.</p>`
    },
    {
      id: "8d20b5db-1b92-4f60-a20a-8c8acc44248b",
      q: "Boundary value analysis and equivalence partitioning — concrete example.",
      diff: "easy",
      tags: ["technique"],
      answer: `<p>For a price field 0.01 to 9999.99:</p>
<p><strong>Equivalence classes:</strong></p>
<ul>
<li>Valid: 0.01 ≤ x ≤ 9999.99</li>
<li>Invalid: x &lt; 0.01, x &gt; 9999.99, non-numeric, null, &gt; 2 decimals</li>
</ul>
<p><strong>Boundaries:</strong> 0, 0.001, -0.01, 0.01, 0.02, 9999.98, 9999.99, 10000.00.</p>
<p>Bugs cluster at boundaries. One value per class + boundaries gives high coverage with minimal cases.</p>`
    },
    {
      id: "7d1b5ec9-6ba4-4a8d-9358-ab8d18640c58",
      q: "When use decision tables instead of equivalence partitioning?",
      diff: "mid",
      tags: ["technique"],
      answer: `<p>Decision tables shine when <strong>multiple inputs interact</strong>. Equivalence partitioning treats inputs independently, missing combination bugs.</p>
<p>Example: discount engine depending on:</p>
<ul>
<li>Member status (Yes/No)</li>
<li>Order value (&gt; €100 / ≤ €100)</li>
<li>Promo code (Valid/Invalid)</li>
</ul>
<p>2 × 2 × 2 = 8 combinations. Decision table forces all 8 explicitly. EP would test 6 cases and miss "non-member, high value, valid promo".</p>
<p>Decision tables for branching business rules. EP for single-input validation.</p>`
    },
    {
      id: "2e2baba4-1232-43f3-8f4e-87b89d98df5b",
      q: "Risk-based testing when time is limited?",
      diff: "mid",
      tags: ["strategy"],
      answer: `<p>Score by <strong>likelihood × impact</strong>:</p>
<ul>
<li><strong>Likelihood</strong> — frequently executed? Recently changed? Historically buggy?</li>
<li><strong>Impact</strong> — what breaks? Revenue? Data integrity? Few users or all?</li>
</ul>
<p><strong>Tier 1:</strong> high × high. Login, payment, data writes.<br>
<strong>Tier 2:</strong> high one, medium other.<br>
<strong>Tier 3:</strong> low × low. Skip if needed.</p>
<p>Document what you skipped. "We skipped X because impact is cosmetic and deadline is tight" is defensible. "We forgot to test X" is not.</p>`
    },
    {
      id: "0bae1aa8-94f8-4e31-a167-d580fb73a764",
      q: "Smoke vs. sanity vs. regression vs. exploratory.",
      diff: "easy",
      tags: ["fundamentals"],
      answer: `<ul>
<li><strong>Smoke</strong> — does the build start? Critical paths E2E. Every PR. 5 min.</li>
<li><strong>Sanity</strong> — narrow check after specific fix. "Did my fix work without breaking adjacent things?"</li>
<li><strong>Regression</strong> — comprehensive check that previously-working still works. Nightly or pre-release. Hours.</li>
<li><strong>Exploratory</strong> — unscripted, human-driven discovery. Time-boxed sessions with charter.</li>
</ul>
<p>Different goals, different gates. Smoke gates fast feedback. Regression gates releases. Exploratory gates UX.</p>`
    },
    {
      id: "4339f939-b7d9-4108-898d-ea183f1b3969",
      q: "What is test coverage and why isn't 100% the goal?",
      diff: "mid",
      tags: ["metrics"],
      answer: `<p>Coverage measures what code your tests <em>execute</em>:</p>
<ul>
<li><strong>Line</strong> — % lines hit. Misleading.</li>
<li><strong>Branch</strong> — % if/else taken.</li>
<li><strong>Path</strong> — combinations. Combinatorial explosion.</li>
<li><strong>Mutation</strong> — assertion quality. Gold standard, expensive.</li>
</ul>
<p><strong>Why 100% isn't the goal:</strong></p>
<ul>
<li>100% line coverage with zero assertions — code runs, nothing verified.</li>
<li>Last 10% costs as much as first 90%, often by testing trivial code.</li>
<li>False confidence — coverage doesn't measure correctness.</li>
</ul>
<p>Track as leading indicator. Real goal: defect escape rate.</p>`
    },
    {
      id: "7b5790b8-e797-4f1c-a3ef-f8f2dfc807b3",
      q: "Design tests for a feature with no written requirements.",
      diff: "hard",
      tags: ["strategy"],
      answer: `<ol>
<li><strong>Stop.</strong> Don't proceed without something written. "No requirements" is a process bug.</li>
<li><strong>Interview</strong> — dev, PM, designer. Capture each view. Note disagreements.</li>
<li><strong>Reference similar features</strong> — steal precedent.</li>
<li><strong>Charter exploration</strong> — 60–90 min. "Discover actual behavior of [feature]." Document everything.</li>
<li><strong>Draft AC retroactively</strong> — write what you observed as if it were the spec. Get sign-off.</li>
<li><strong>Flag the gap</strong> — bring to retrospective. "We can't do this again. Here's the cost."</li>
</ol>
<p>Senior signal: framing as a process problem, not just a personal task.</p>`
    },
    {
      id: "f7109e4e-fe83-4bf3-8ac2-1b78a186405b",
      q: "Mutation testing — why is it more meaningful than line coverage?",
      diff: "hard",
      tags: ["technique", "metrics"],
      answer: `<p>Mutation testing introduces small code changes (mutate <code>==</code> to <code>!=</code>, <code>true</code> to <code>false</code>, remove <code>+1</code>). Re-runs your tests. If they still pass, your assertions are weak.</p>
<pre class="code"><code>function calculateTotal(items: Item[]) {
  return items.reduce((sum, i) =&gt; sum + i.price * i.quantity, 0);
}

// Weak — passes line coverage, doesn't verify math
test('returns a number', () =&gt; {
  expect(calculateTotal([{ price: 10, quantity: 2 }])).toBeTypeOf('number');
});
// Stryker mutates "+ i.price * i.quantity" to "- i.price * i.quantity"
// Test still passes. Mutation survived = weak coverage.</code></pre>
<p>Tools: <strong>Stryker</strong> (JS/TS), Pitest (Java). Run periodically — expensive. Score = % mutations killed.</p>`
    },
    {
      id: "466de566-50c4-49fc-8909-1e7a87558c77",
      q: "How do you handle 'that's not a bug, it's a feature'?",
      diff: "hard",
      tags: ["soft-skills"],
      answer: `<p>Don't argue about the label. Reframe to <strong>user impact and intent</strong>:</p>
<ol>
<li><strong>Reference AC</strong> — does behavior match agreement? If yes, AC is wrong. If no, it's a bug.</li>
<li><strong>Quantify impact</strong> — "8% of users hit this. Last incident X cost Y."</li>
<li><strong>Ask the PM</strong> — "What did you intend?" Often resolves disagreement.</li>
<li><strong>Document decision</strong> — write it down so it doesn't recur.</li>
</ol>
<p>Wrong move: escalate emotionally or treat as personal. Right move: make conversation about the user, not who's right.</p>`
    },
    {
      id: "f578727e-637f-4697-90ec-0f07f42dcc60",
      q: "What is exploratory testing and how is it different from ad-hoc testing?",
      diff: "mid",
      tags: ["technique"],
      answer: `<p><strong>Ad-hoc:</strong> "let me click around and see what breaks." No plan, no documentation. Often miss systematic coverage.</p>
<p><strong>Exploratory:</strong> structured improvisation. Time-boxed sessions with a charter. The tester learns the product, designs tests, executes them, and adapts in real-time.</p>
<pre class="code"><code>Charter: Explore the checkout flow with invalid payment data
Time-box: 60 minutes
Areas: Card validation, error messaging, retry logic
Output: Notes, defects, questions for PM

Notes: ...
Defects: ...
Coverage: card field, CVV, expiry, postal code (skipped: gift cards)
Open questions: behavior when 3DS times out?</code></pre>
<p>Exploratory testing finds bugs no script would. It's a skill, not a fallback. Ad-hoc is what you do when you don't know how to do exploratory.</p>`
    },
    {
      id: "33e4f814-2609-4f66-8798-0c2e4d1f5bcf",
      q: "What's the difference between a defect, a fault, and a failure?",
      diff: "easy",
      tags: ["fundamentals"],
      answer: `<ul>
<li><strong>Defect</strong> — anything that should be different. Used loosely; sometimes synonymous with fault.</li>
<li><strong>Fault</strong> — the static problem in the code. The wrong logic, the missing null check. Lives in the source.</li>
<li><strong>Failure</strong> — the runtime symptom. The crash, the wrong result, the user-visible bug.</li>
</ul>
<p>One fault can cause many failures. One failure can have multiple faults as root causes. ISTQB makes this distinction; in practice teams use "bug" and "defect" interchangeably for both.</p>`
    },
    {
      id: "4654e566-17b8-427e-919e-5b248ac38f40",
      q: "What is the testing pyramid? When does it not apply?",
      diff: "mid",
      tags: ["strategy", "pyramid"],
      diagram: `graph TD
  E2E["E2E&nbsp;tests<br/>(slow, brittle, few)"]:::top
  INT["Integration / API<br/>(medium speed, some)"]:::mid
  UNIT["Unit tests<br/>(fast, isolated, many)"]:::base
  E2E --> INT --> UNIT
  classDef top fill:#f4a261,stroke:#333,color:#222
  classDef mid fill:#e9c46a,stroke:#333,color:#222
  classDef base fill:#2a9d8f,stroke:#333,color:#fff`,
      answer: `<p>Pyramid: many unit tests at the base, fewer integration in the middle, fewest E2E at the top. Optimizes for speed and reliability.</p>
<p><strong>When it doesn't fit:</strong></p>
<ul>
<li><strong>Frontend-heavy SPAs</strong> — most logic is UI behavior. The "trophy" model (Kent C. Dodds) inverts: many integration/component tests, fewer unit/E2E.</li>
<li><strong>Microservices</strong> — contract tests replace some integration coverage.</li>
<li><strong>Data pipelines</strong> — fewer "units"; mostly integration over real data.</li>
<li><strong>Legacy without unit testability</strong> — start at the top with E2E, work down as you refactor.</li>
</ul>
<p>The pyramid is a heuristic, not a law. The principle — favor cheaper tests when they give equivalent confidence — is universal. The exact shape varies by context.</p>`
    },
    {
      id: "85ac43de-19d5-425c-9faa-9b5bf90c0e70",
      q: "What is a test charter and how do you write one?",
      diff: "mid",
      tags: ["technique"],
      answer: `<p>A charter is a one-paragraph mission statement for an exploratory testing session. Time-boxed. Outputs: notes, not pass/fail.</p>
<p><strong>Format:</strong></p>
<pre class="code"><code>Explore [target]
With [resources]
To discover [information]

Time: 90 min
</code></pre>
<p><strong>Example:</strong></p>
<pre class="code"><code>Explore the checkout flow
With invalid payment data and various network conditions
To discover edge cases in error handling and retry logic

Time: 90 min
Notes:
- Card declined: shows generic error, doesn't say which field
- Network timeout: button stays disabled forever
- Double-submit: creates two pending orders (bug?)</code></pre>
<p>Charters keep exploratory testing focused without scripting it. Sessions chain: each charter informs the next.</p>`
    },
    {
      id: "0c60cb00-d87b-4d27-9c8e-c7baea7852ee",
      q: "Name the seven ISTQB testing principles. Which one trips most teams up?",
      diff: "easy",
      tags: ["istqb", "fundamentals"],
      answer: `<ol>
<li><strong>Testing shows the presence of defects, not their absence.</strong> Passing tests ≠ bug-free.</li>
<li><strong>Exhaustive testing is impossible.</strong> Use risk + technique, not "test everything".</li>
<li><strong>Early testing saves time and money.</strong> Shift-left.</li>
<li><strong>Defects cluster.</strong> A few modules contain most bugs — focus your effort there.</li>
<li><strong>Tests wear out (the pesticide paradox).</strong> Same tests stop finding new bugs. Refresh suites periodically.</li>
<li><strong>Testing is context-dependent.</strong> Banking app ≠ social app. Different risk, different rigor.</li>
<li><strong>Absence-of-errors fallacy.</strong> A "perfectly working" product that doesn't meet user needs is still a failure.</li>
</ol>
<p><strong>The one that trips teams up:</strong> #7. Teams obsess over zero-bug releases of products users don't actually want. Coverage and pass rate are inputs; user value is the outcome. The mature QA voice asks "is this the right thing to ship?", not just "does it work?".</p>`,
    },
    {
      id: "0d8db530-39b1-48b5-95cf-0b22cdb7c1a1",
      q: "Walk through the four test levels. What belongs at each — and what doesn't?",
      diff: "mid",
      tags: ["istqb", "test-levels"],
      diagram: `graph TB
  L4["Acceptance<br/>Product + users — does it meet needs?"]
  L3["System<br/>QA — end-to-end behaviour"]
  L2["Integration<br/>Devs + QA — interfaces, contracts"]
  L1["Component / Unit<br/>Developers — logic in isolation"]
  L4 --> L3 --> L2 --> L1
  classDef accept fill:#2a9d8f,color:#fff
  classDef system fill:#e9c46a,color:#222
  classDef integ fill:#f4a261,color:#222
  classDef unit fill:#264653,color:#fff
  class L4 accept
  class L3 system
  class L2 integ
  class L1 unit`,
      answer: `<table>
<thead><tr><th>Level</th><th>Tests</th><th>Owned by</th><th>Belongs</th></tr></thead>
<tbody>
<tr><td><strong>Component / unit</strong></td><td>Smallest testable piece in isolation</td><td>Developers</td><td>Logic, edge cases, error paths</td></tr>
<tr><td><strong>Integration</strong></td><td>Interfaces between components or services</td><td>Devs + QA</td><td>Contract validation, data flow, message formats</td></tr>
<tr><td><strong>System</strong></td><td>End-to-end behavior of the assembled product</td><td>QA</td><td>User journeys, cross-feature interactions, non-functional checks</td></tr>
<tr><td><strong>Acceptance</strong></td><td>Does it meet business needs?</td><td>Product + users</td><td>UAT, alpha/beta, contractual / regulatory checks</td></tr>
</tbody>
</table>
<p><strong>What does NOT belong:</strong></p>
<ul>
<li>Business-logic edge cases at the system level — they belong in unit tests where they're fast and deterministic.</li>
<li>Visual smoke checks at the unit level — wrong tool for the job.</li>
<li>Cross-service integration mocked at the integration level — you've replaced the thing you're trying to test.</li>
</ul>
<p><strong>Senior signal:</strong> the levels are a guide, not a ceremony. Some teams collapse integration into system; some split system into "user-facing" and "API". What matters is: each level adds unique confidence; nothing is tested redundantly across levels.</p>`,
    },
    {
      id: "b5e07f27-6331-47a9-946b-ef574e2c4999",
      q: "Functional, non-functional, white-box, change-related — explain test types and where they overlap.",
      diff: "mid",
      tags: ["istqb", "test-types"],
      answer: `<ul>
<li><strong>Functional</strong> — <em>what</em> the system does. "Login accepts valid credentials." Black-box, behavior-driven.</li>
<li><strong>Non-functional</strong> — <em>how well</em> it does it. Performance, security, usability, reliability, scalability, compatibility. The "-ilities".</li>
<li><strong>White-box (structural)</strong> — <em>how</em> it's built. Code coverage, control-flow, data-flow, decision coverage. Tests informed by reading the implementation.</li>
<li><strong>Change-related</strong> — <em>did our change break anything or fix the right thing</em>? Confirmation (it's fixed) and regression (nothing else broke).</li>
</ul>
<p><strong>They overlap.</strong> A performance test for the search endpoint:</p>
<ul>
<li>Functional: search returns the right results.</li>
<li>Non-functional: returns them in &lt; 200ms p95.</li>
<li>White-box: hits the cached path on the second call.</li>
<li>Change-related: after the new index, regression on 50 query patterns.</li>
</ul>
<p>A single physical test can carry multiple labels. The labels exist to make sure you've thought about each angle — not to file each test into one box.</p>`,
    },
    {
      id: "17fc6161-4a53-4398-8b8b-13f75ef3273a",
      q: "What is static testing? Compare reviews, walkthroughs, and inspections.",
      diff: "mid",
      tags: ["istqb", "static-testing"],
      answer: `<p><strong>Static testing</strong> = examining work products without executing them: requirements, user stories, designs, code, test cases. The cheapest defect-removal activity that exists.</p>
<table>
<thead><tr><th>Type</th><th>Formality</th><th>Goal</th><th>Roles</th></tr></thead>
<tbody>
<tr><td><strong>Informal review</strong></td><td>None</td><td>Quick sanity check</td><td>Author + any colleague</td></tr>
<tr><td><strong>Walkthrough</strong></td><td>Low</td><td>Author leads peers through the work to gather feedback / educate</td><td>Author drives; peers comment</td></tr>
<tr><td><strong>Technical review</strong></td><td>Medium</td><td>Subject-matter assessment</td><td>Trained reviewers, often documented</td></tr>
<tr><td><strong>Inspection</strong></td><td>Highest</td><td>Find defects systematically against a checklist</td><td>Moderator, reader, author, recorder; defined entry/exit criteria</td></tr>
</tbody>
</table>
<p><strong>Why static testing wins:</strong> defects found in requirements cost 10–100× less than the same defects caught in production. Static testing also finds bugs that dynamic testing literally cannot — missing requirements, contradictory specs, untestable acceptance criteria.</p>
<p><strong>Modern equivalents:</strong> PR review = walkthrough. Linting/type-checking = automated inspection. ADR review = technical review. The ISTQB labels look dated, but the activities are alive and well in any decent engineering team.</p>`,
    },
    {
      id: "a9387bb9-0b00-4084-90d4-0e5a6308440e",
      q: "Walk through the ISTQB test process. What does each phase actually produce?",
      diff: "mid",
      tags: ["istqb", "process"],
      diagram: `flowchart TD
  PLAN["1. Planning<br/>→ test plan"] --> ANA["3. Analysis<br/>→ test conditions"]
  ANA --> DES["4. Design<br/>→ test cases + data"]
  DES --> IMP["5. Implementation<br/>→ scripts + env"]
  IMP --> EXE["6. Execution<br/>→ results + defects"]
  EXE --> CLO["7. Completion<br/>→ summary + lessons"]
  MON["2. Monitoring &amp; control<br/>(continuous)"]
  MON -.-> PLAN
  MON -.-> ANA
  MON -.-> DES
  MON -.-> IMP
  MON -.-> EXE
  MON -.-> CLO`,
      answer: `<ol>
<li><strong>Test planning</strong> — scope, risk assessment, approach, schedule, resources, exit criteria. <em>Output: test plan.</em></li>
<li><strong>Test monitoring &amp; control</strong> — ongoing comparison of progress to plan; adjust scope/effort. <em>Output: status reports, control decisions.</em></li>
<li><strong>Test analysis</strong> — read requirements; identify what to test; define test conditions and coverage criteria. <em>Output: prioritized test conditions, testability defects.</em></li>
<li><strong>Test design</strong> — turn conditions into concrete test cases using techniques (EP, BVA, decision tables…). <em>Output: test cases, test data design, environment requirements.</em></li>
<li><strong>Test implementation</strong> — build the testware: scripts, fixtures, data, environments. <em>Output: executable suite + test data + environment.</em></li>
<li><strong>Test execution</strong> — run, log results, investigate failures, retest fixes. <em>Output: results, defect reports, retest results.</em></li>
<li><strong>Test completion</strong> — archive, lessons learned, summary report, hand-off. <em>Output: test summary, postmortem, retrospective items.</em></li>
</ol>
<p><strong>In Agile</strong>: these phases compress into a sprint cycle, but they don't disappear. Story refinement = analysis. Definition of Done = exit criteria. Demo + retro = completion. A senior QA knows which phase they're in even when no one calls it that.</p>`,
    },
    {
      id: "b1c4f7e7-dca2-4202-b686-6975715da104",
      q: "Confirmation testing vs regression testing — what's the difference and why does it matter?",
      diff: "easy",
      tags: ["istqb", "change-related"],
      answer: `<ul>
<li><strong>Confirmation testing</strong>: re-run the test that failed, after the fix, to confirm the defect is resolved. Targeted, narrow.</li>
<li><strong>Regression testing</strong>: re-run a broader suite to confirm the fix didn't break anything else. Broad, defensive.</li>
</ul>
<p><strong>Why this matters:</strong> teams routinely conflate the two and skip the regression half. The bug ticket gets closed because confirmation passed — but the fix introduced a side-effect that won't surface until production.</p>
<p><strong>Practical pattern after a fix:</strong></p>
<ol>
<li>Confirmation: re-run the original failing test. Must pass.</li>
<li>Confirmation+: write a new automated test that reproduces the bug. It must fail before the fix and pass after — that's how you know your fix actually fixes the right thing.</li>
<li>Regression: run the suite that exercises the affected area. Critical-path always; full suite for high-risk changes.</li>
</ol>
<p>Skipping any of the three is how regressions ship.</p>`,
    },
    {
      id: "5c418f00-0c3a-491f-95a6-64e28b7b21ce",
      q: "Walk through the defect lifecycle. Who owns each state?",
      diff: "mid",
      tags: ["istqb", "defects"],
      diagram: `stateDiagram-v2
  [*] --> New: tester files
  New --> Triaged: triage / PM
  New --> Rejected: not a bug
  New --> Duplicate
  Triaged --> InProgress: dev assigned
  Triaged --> Deferred
  InProgress --> Fixed: code merged
  Fixed --> Verified: tester confirms
  Fixed --> Reopened: still broken
  Reopened --> InProgress
  Verified --> [*]
  Rejected --> [*]
  Duplicate --> [*]
  Deferred --> [*]`,
      answer: `<ol>
<li><strong>New</strong> — tester filed it. Owner: <em>tester</em> (until triaged).</li>
<li><strong>Triaged / Open</strong> — confirmed, prioritized, assigned. Owner: <em>triage lead / PM</em>.</li>
<li><strong>In progress</strong> — developer working on it. Owner: <em>developer</em>.</li>
<li><strong>Fixed / Ready for test</strong> — code change merged. Owner: <em>tester</em> for verification.</li>
<li><strong>Verified / Closed</strong> — confirmation + regression passed. Owner: <em>tester</em> closes.</li>
<li><strong>Rejected / Won't fix / Duplicate / Deferred</strong> — alternate terminal states.</li>
<li><strong>Reopened</strong> — bug came back or fix was incomplete. Owner: <em>developer</em> again.</li>
</ol>
<p><strong>Good defect reports include:</strong> reproduction steps, expected vs actual, environment, severity (impact), priority (urgency), evidence (screenshot/log/trace), and a hypothesis if you have one.</p>
<p><strong>Senior signal:</strong> a good bug report shortens the developer's investigation. A trace file or a Playwright report cuts triage time by 10×. A bug with no repro steps is a discussion, not a defect.</p>
<p><strong>Anti-pattern</strong>: severity and priority used as synonyms. A typo in the homepage banner can be low severity (won't crash) but high priority (CEO sees it daily).</p>`,
    },
    {
      id: "18ae46fd-d117-4755-8def-3923977a066e",
      q: "Design state transition tests for a session-token system.",
      diff: "hard",
      tags: ["istqb", "technique"],
      diagram: `stateDiagram-v2
  [*] --> anonymous
  anonymous --> authenticated: login(valid)
  anonymous --> locked: login invalid x5
  authenticated --> anonymous: logout
  authenticated --> expired: tick > ttl
  authenticated --> revoked: admin-revoke
  expired --> authenticated: refresh(valid)
  expired --> anonymous: refresh(invalid)
  locked --> anonymous: tick > lockout
  revoked --> [*]`,
      answer: `<p>State transition testing models the system as states + transitions + events, then designs tests to cover them.</p>
<p><strong>States</strong>: <code>anonymous</code>, <code>authenticated</code>, <code>expired</code>, <code>revoked</code>, <code>locked</code>.</p>
<p><strong>Events</strong>: <code>login</code>, <code>logout</code>, <code>tick</code> (time passes), <code>admin-revoke</code>, <code>5 failed logins</code>.</p>
<pre class="code"><code>FROM            EVENT              TO
anonymous       login(valid)       authenticated
anonymous       login(invalid x5)  locked
authenticated   logout             anonymous
authenticated   tick(&gt; ttl)        expired
authenticated   admin-revoke       revoked
expired         refresh(valid)     authenticated
expired         refresh(invalid)   anonymous
locked          tick(&gt; lockout)    anonymous</code></pre>
<p><strong>Coverage levels:</strong></p>
<ul>
<li><strong>0-switch</strong>: every transition fired at least once. Minimum bar.</li>
<li><strong>1-switch</strong>: every pair of consecutive transitions. Catches state-dependent bugs.</li>
<li><strong>Sneak path testing</strong>: try transitions that <em>shouldn't</em> exist — e.g., <code>locked + login(valid)</code> must NOT go to authenticated.</li>
</ul>
<p><strong>Senior signal:</strong> the bugs live in invalid transitions, not the happy path. A test that asserts "after revoke, any request must return 401" catches a whole class of security bugs that flow-based testing misses.</p>`,
    },
    {
      id: "9e0ba83f-7922-4640-a8c1-c67385de148a",
      q: "What is pairwise (combinatorial) testing? When is it worth using?",
      diff: "mid",
      tags: ["istqb", "technique"],
      answer: `<p>For a feature with N inputs that each have multiple values, testing every combination is exponential. Pairwise testing covers every <em>pair</em> of values across all inputs — empirically catches 60–90% of multi-parameter bugs with a fraction of the cases.</p>
<p><strong>Example:</strong> a checkout with 4 parameters, 3 values each → 81 full combinations, but only ~9 cases for pairwise coverage:</p>
<table>
<thead><tr><th>OS</th><th>Browser</th><th>Payment</th><th>Currency</th></tr></thead>
<tbody>
<tr><td>Mac</td><td>Chrome</td><td>Card</td><td>USD</td></tr>
<tr><td>Mac</td><td>Safari</td><td>PayPal</td><td>EUR</td></tr>
<tr><td>Mac</td><td>Firefox</td><td>Apple Pay</td><td>GBP</td></tr>
<tr><td>Win</td><td>Chrome</td><td>PayPal</td><td>GBP</td></tr>
<tr><td>Win</td><td>Safari</td><td>Apple Pay</td><td>USD</td></tr>
<tr><td>...</td><td></td><td></td><td></td></tr>
</tbody>
</table>
<p><strong>Tools:</strong> Microsoft PICT (free), <code>pairwise</code> npm, ACTS.</p>
<p><strong>When to use:</strong></p>
<ul>
<li>Cross-browser / cross-platform matrices.</li>
<li>Feature-flag combinations.</li>
<li>Form fields with many independent dropdowns.</li>
</ul>
<p><strong>When NOT:</strong> when interactions matter beyond pairs (3-way bugs), or when most combinations are nonsense (Apple Pay on Windows). Pin domain-impossible combinations and let pairwise handle the rest.</p>`,
    },
    {
      id: "0bb3e356-d078-443b-8513-71e5a08b664c",
      q: "Error guessing — is it a real technique or just intuition?",
      diff: "easy",
      tags: ["istqb", "technique"],
      answer: `<p>Both. It's a recognized ISTQB technique, but its effectiveness depends entirely on the tester's experience pattern-matching against bugs they've seen before.</p>
<p><strong>What makes someone good at error guessing:</strong></p>
<ul>
<li>Memory of past bugs (your own, your team's, the industry's).</li>
<li>Knowledge of common implementation pitfalls (off-by-one, null defaults, race conditions, locale assumptions).</li>
<li>Healthy paranoia about edge cases: empty, very long, zero, negative, Unicode, leap year, midnight UTC, weekend.</li>
</ul>
<p><strong>Classic error-guessing targets:</strong></p>
<ul>
<li>Empty inputs (string "", array [], null, undefined, 0).</li>
<li>Boundaries (off-by-one, fence-post).</li>
<li>Duplicates / re-submissions.</li>
<li>Concurrency (two users hit "buy" on the last item).</li>
<li>Bizarre locales (Turkish dotless i, RTL, 24-character month names).</li>
<li>Network partial-failures (request sent but response lost).</li>
</ul>
<p><strong>How to systematize it:</strong> keep a <em>bug taxonomy</em> — categories of bugs your product has shipped before. Each new feature gets a quick pass against the taxonomy. Error guessing becomes institutional memory, not personal voodoo.</p>`,
    },
    {
      id: "89f99078-b5db-47f7-a7a5-e23095ef1ad9",
      q: "Name the ISO 25010 quality characteristics. Which do most teams under-test?",
      diff: "mid",
      tags: ["istqb", "non-functional"],
      answer: `<p>Eight top-level characteristics, each with sub-characteristics:</p>
<ol>
<li><strong>Functional suitability</strong> — completeness, correctness, appropriateness.</li>
<li><strong>Performance efficiency</strong> — time behavior, resource use, capacity.</li>
<li><strong>Compatibility</strong> — co-existence, interoperability.</li>
<li><strong>Usability</strong> — learnability, operability, accessibility, error protection, UI aesthetics.</li>
<li><strong>Reliability</strong> — maturity, availability, fault tolerance, recoverability.</li>
<li><strong>Security</strong> — confidentiality, integrity, non-repudiation, authenticity, accountability.</li>
<li><strong>Maintainability</strong> — modularity, reusability, analyzability, modifiability, testability.</li>
<li><strong>Portability</strong> — adaptability, installability, replaceability.</li>
</ol>
<p><strong>Under-tested in most teams:</strong></p>
<ul>
<li><strong>Reliability under failure</strong> — chaos testing, dependency failure, slow networks. Most teams test happy paths under perfect conditions.</li>
<li><strong>Accessibility</strong> — screen readers, keyboard nav, color contrast. Often added under regulatory pressure, rarely owned by QA.</li>
<li><strong>Security</strong> — beyond auth basics, things like CSRF, SSRF, injection, IDOR. Outsourced to pen tests once a year instead of continuous.</li>
<li><strong>Maintainability</strong> — testability of code, not just tests of code. A codebase that's hard to test is itself a quality defect.</li>
</ul>`,
    },
    {
      id: "2a747904-f5df-4a17-8617-40893e4f3535",
      q: "What are entry and exit criteria? Why does no one actually follow them?",
      diff: "mid",
      tags: ["istqb", "process"],
      answer: `<p><strong>Entry criteria</strong>: what must be true to start a test activity. Examples: code is merged to integration branch, smoke tests pass, test environment is available, test data is loaded.</p>
<p><strong>Exit criteria</strong>: what must be true to declare testing done. Examples: all P0/P1 defects closed, critical-path automation green, coverage ≥ X% on modified files, regression suite passed.</p>
<p><strong>Why teams skip them:</strong></p>
<ul>
<li>Written as ceremony in a test plan no one reads.</li>
<li>Defined too vaguely to enforce ("adequate coverage", "no major issues").</li>
<li>Aspirational instead of achievable, so the team learns to ignore them.</li>
</ul>
<p><strong>How to make them useful:</strong></p>
<ul>
<li>Encode them as automated gates in CI, not as a document. A PR can't merge unless tests pass = enforced entry/exit criteria.</li>
<li>Make them measurable. "All critical-path tests green" not "looks good".</li>
<li>Keep them few and ruthless. 3 criteria everyone respects beat 15 nobody checks.</li>
<li>Tie release exit criteria to risk, not to coverage. "Authentication regression suite passes" matters; "85% line coverage" rarely does.</li>
</ul>
<p>The senior signal: turning entry/exit criteria from a checklist into infrastructure. A green pipeline IS the exit criterion.</p>`,
    },
    {
      id: "438dc650-a8cc-4e73-ae90-58679719c324",
      q: "How do you estimate test effort for a new feature?",
      diff: "mid",
      tags: ["istqb", "estimation"],
      answer: `<p>Multiple techniques, used together:</p>
<ol>
<li><strong>Expert judgment</strong> — ask experienced testers; faster than analytical methods, biased toward optimism.</li>
<li><strong>Analogy</strong> — "this feature is like the checkout we shipped last quarter; that took 5 days of QA."</li>
<li><strong>Three-point estimation</strong> — best (a) + 4×most-likely (m) + worst (b), divided by 6. Smoothes optimism.</li>
<li><strong>Wideband Delphi</strong> — multiple experts estimate independently, discuss outliers, re-estimate. Best for novel work.</li>
<li><strong>Test point analysis</strong> — count test conditions × complexity × productivity factor. Formal but slow.</li>
</ol>
<p><strong>What seniors include that juniors miss:</strong></p>
<ul>
<li><strong>Setup cost</strong>: test environments, data, mocks. Often 30–50% of total effort.</li>
<li><strong>Failure investigation</strong>: when tests fail, you spend time triaging. Budget for it.</li>
<li><strong>Cross-team dependencies</strong>: waiting on backend deploys, infra changes, third-party sandboxes.</li>
<li><strong>Re-test cycles</strong>: never assume one fix → one retest. Plan for 2–3 rounds.</li>
<li><strong>Documentation + handoff</strong>: written summary, runbook updates, knowledge transfer.</li>
</ul>
<p><strong>Anti-pattern:</strong> estimating only "happy-path test writing time" and getting blindsided by everything else. Estimate the activity, not the typing.</p>`,
    },
  ]
};

export const PART_3_CATEGORIES: Category[] = [ciFlakiness, testingTheory];
