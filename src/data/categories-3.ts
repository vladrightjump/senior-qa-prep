import type { Category } from "../types";

const ciFlakiness: Category = {
  id: "ci-flakiness",
  label: "CI/CD & flakiness",
  desc: "GitHub Actions, sharding, parallelism, ruthless flakiness reduction",
  questions: [
    {
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
      q: "Sharding vs. parallelism in Playwright?",
      diff: "mid",
      tags: ["ci"],
      answer: `<ul>
<li><strong>Parallelism</strong> — workers within one machine. <code>workers: 4</code>. Limited by machine resources.</li>
<li><strong>Sharding</strong> — split suite across machines. <code>--shard=2/4</code>. Limited by CI budget.</li>
</ul>
<p><strong>Combine:</strong> 4 machines × 4 workers = 16x parallelism. Sharding scales horizontally; parallelism scales vertically.</p>
<p>Backend capacity caps combined parallelism. 16 workers hammering staging DB → saturation, parallelism stops helping and starts causing flakes.</p>`
    },
    {
      q: "Walk through your investigation process for a flaky test.",
      diff: "hard",
      tags: ["flakiness", "debugging"],
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
      q: "Design a CI strategy: PR vs. nightly vs. on-demand.",
      diff: "mid",
      tags: ["ci", "strategy"],
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
      q: "What is shift-left testing? Apply it to a real sprint.",
      diff: "mid",
      tags: ["process"],
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
      q: "What is the testing pyramid? When does it not apply?",
      diff: "mid",
      tags: ["strategy", "pyramid"],
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
  ]
};

export const PART_3_CATEGORIES: Category[] = [ciFlakiness, testingTheory];
