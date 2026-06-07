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
      diagram: `flowchart LR
  PR["PR pushed"] --> M["matrix.shard:<br/>[1/4, 2/4, 3/4, 4/4]"]
  M --> J1["job 1 (1/4)<br/>runner ubuntu-latest"]
  M --> J2["job 2 (2/4)"]
  M --> J3["job 3 (3/4)"]
  M --> J4["job 4 (4/4)"]
  J1 --> R1["playwright-report-1"]
  J2 --> R2["playwright-report-2"]
  J3 --> R3["playwright-report-3"]
  J4 --> R4["playwright-report-4"]
  R1 --> MERGE["merge-reports job<br/>(needs: [test])"]
  R2 --> MERGE
  R3 --> MERGE
  R4 --> MERGE
  classDef job fill:#0a3d6e,color:#fff
  class J1,J2,J3,J4 job`,
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
      diagram: `flowchart TD
  T["test runs"] --> R1{"pass?"}
  R1 -- yes --> GREEN["✓ green"]
  R1 -- no --> R2{"retries: 2"}
  R2 --> T2["retry 1"]
  T2 --> R3{"pass?"}
  R3 -- yes --> HIDE["✓ green (flake-masked)<br/>real bug hides here"]
  R3 -- no --> T3["retry 2"]
  T3 --> R4{"pass?"}
  R4 -- yes --> HIDE
  R4 -- no --> FAIL["fail"]
  HIDE -.->|"weeks later"| PROD["bug reaches prod<br/>real cost: hours + trust"]
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  classDef warn fill:#e9c46a,color:#222
  class GREEN good
  class HIDE warn
  class FAIL,PROD bad`,
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
      answer: `<div class="illus">
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top 5 flakiness causes">
  <style>
    .ti { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); text-anchor: middle; }
    .icon { font: 700 28px ui-sans-serif, system-ui; text-anchor: middle; fill: #fff; }
    .b1 { fill: #e76f51; }
    .b2 { fill: #f4a261; }
    .b3 { fill: #e9c46a; }
    .b4 { fill: #2a9d8f; }
    .b5 { fill: #264653; }
    .lbl { font: 600 10.5px ui-sans-serif, system-ui; text-anchor: middle; fill: currentColor; }
  </style>
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="90" height="90" rx="8" class="b1"/>
    <text x="45" y="48" class="icon">⏲</text>
    <text x="45" y="106" class="lbl">Hard waits</text>
    <text x="45" y="120" class="sub" fill="var(--fg-dim)">waitForTimeout(2000)</text>
  </g>
  <g transform="translate(120, 20)">
    <rect x="0" y="0" width="90" height="90" rx="8" class="b2"/>
    <text x="45" y="48" class="icon">⌖</text>
    <text x="45" y="106" class="lbl">Brittle selectors</text>
    <text x="45" y="120" class="sub" fill="var(--fg-dim)">CSS / XPath drift</text>
  </g>
  <g transform="translate(220, 20)">
    <rect x="0" y="0" width="90" height="90" rx="8" class="b3"/>
    <text x="45" y="48" class="icon" fill="#222">⚙</text>
    <text x="45" y="106" class="lbl">State leakage</text>
    <text x="45" y="120" class="sub" fill="var(--fg-dim)">shared DB / users</text>
  </g>
  <g transform="translate(320, 20)">
    <rect x="0" y="0" width="90" height="90" rx="8" class="b4"/>
    <text x="45" y="48" class="icon">↻</text>
    <text x="45" y="106" class="lbl">Async races</text>
    <text x="45" y="120" class="sub" fill="var(--fg-dim)">click → API not done</text>
  </g>
  <g transform="translate(420, 20)">
    <rect x="0" y="0" width="90" height="90" rx="8" class="b5"/>
    <text x="45" y="48" class="icon">⌧</text>
    <text x="45" y="106" class="lbl">3rd-party I/O</text>
    <text x="45" y="120" class="sub" fill="var(--fg-dim)">slow nets, eventually-consistent</text>
  </g>
  <text x="260" y="160" class="sub">Honorable mention: unseeded faker producing "O'Brien" once a month and breaking CSV export.</text>
</svg>
</div>
<ol>
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
      diagram: `flowchart TD
  CI["CI run starts"] --> SETUP["setup project<br/>(auth.setup.ts)"]
  SETUP --> LOGIN["login UI or API<br/>(once)"]
  LOGIN --> SAVE["context.storageState({<br/>  path: 'user.json' })"]
  SAVE --> FILE[(user.json<br/>cookies + localStorage)]
  FILE --> P["chromium project<br/>use: { storageState: 'user.json' }"]
  P --> T1["test 1<br/>starts authed"]
  P --> T2["test 2"]
  P --> TN["test N"]
  classDef setup fill:#0a3d6e,color:#fff
  classDef test fill:#2a9d8f,color:#fff
  class SETUP,LOGIN,SAVE setup
  class T1,T2,TN test`,
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
      answer: `<div class="illus">
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="V-model verification vs validation">
  <style>
    .ti { font: 600 11.5px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .left { fill: #0a3d6e; }
    .right { fill: #2a9d8f; }
    .center { fill: #e9c46a; }
    .line { stroke: currentColor; stroke-width: 1; fill: none; opacity: 0.5; }
    .ver { stroke: #0a3d6e; stroke-width: 1.2; stroke-dasharray: 4 3; fill: none; }
    .val { stroke: #2a9d8f; stroke-width: 1.2; stroke-dasharray: 4 3; fill: none; }
  </style>
  <g>
    <rect x="20"  y="20"  width="140" height="22" rx="3" class="left"/>
    <text x="90"  y="35" text-anchor="middle" class="ti" fill="#fff">User requirements</text>
    <rect x="50"  y="55"  width="130" height="22" rx="3" class="left" opacity="0.85"/>
    <text x="115" y="70" text-anchor="middle" class="ti" fill="#fff">System spec</text>
    <rect x="80"  y="90"  width="130" height="22" rx="3" class="left" opacity="0.7"/>
    <text x="145" y="105" text-anchor="middle" class="ti" fill="#fff">Component design</text>
  </g>
  <rect x="210" y="125" width="100" height="22" rx="3" class="center"/>
  <text x="260" y="140" text-anchor="middle" class="ti" fill="#222">Implementation</text>
  <g>
    <rect x="340" y="90"  width="130" height="22" rx="3" class="right" opacity="0.7"/>
    <text x="405" y="105" text-anchor="middle" class="ti" fill="#fff">Component test</text>
    <rect x="370" y="55"  width="130" height="22" rx="3" class="right" opacity="0.85"/>
    <text x="435" y="70" text-anchor="middle" class="ti" fill="#fff">System test</text>
    <rect x="400" y="20"  width="100" height="22" rx="3" class="right"/>
    <text x="450" y="35" text-anchor="middle" class="ti" fill="#fff">Acceptance / UAT</text>
  </g>
  <path d="M 90 42 L 260 125 L 450 42" class="line"/>
  <path d="M 115 77 L 260 125 L 435 77" class="line"/>
  <path d="M 145 112 L 260 125 L 405 112" class="line"/>
  <path d="M 145 112 L 405 112" class="ver"/>
  <path d="M 90 42 L 450 42" class="val"/>
  <text x="270" y="105" class="sub" fill="#0a3d6e">verification — built it right</text>
  <text x="270" y="14" class="sub" fill="#2a9d8f">validation — built the right thing</text>
  <text x="10" y="175" class="sub">Example: password reset feature</text>
  <text x="10" y="190" class="sub">▸ Verification: code matches spec — form submits, email sends.</text>
  <text x="10" y="204" class="sub">▸ Validation: spec was right — user understands, email reaches inbox, flow recovers from edge cases.</text>
</svg>
</div>
<ul>
<li><strong>Verification</strong> — "are we building the product right?" Static checks: code review, requirement review.</li>
<li><strong>Validation</strong> — "are we building the right product?" Dynamic checks: UAT, exploratory testing, beta.</li>
</ul>
<p>Real example: spec says "users can reset password". Verification confirms code matches spec — form submits, email sends. Validation confirms spec was right — does the user understand? Does email reach inbox? Does flow recover from edge cases?</p>
<p>A feature can pass verification and fail validation. Most expensive class of bug.</p>`
    },
    {
      id: "8d20b5db-1b92-4f60-a20a-8c8acc44248b",
      q: "Boundary value analysis and equivalence partitioning — concrete example.",
      diff: "easy",
      tags: ["technique"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boundary value analysis on a number line">
  <style>
    .ti { font: 600 11.5px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .invalid { fill: #e76f51; opacity: 0.5; }
    .valid { fill: #2a9d8f; opacity: 0.5; }
    .axis { stroke: currentColor; stroke-width: 1.2; fill: none; }
    .marker { fill: currentColor; }
    .bad { fill: #e76f51; }
    .ok { fill: #2a9d8f; }
    .tk { stroke: currentColor; stroke-width: 1; }
  </style>
  <text x="260" y="20" text-anchor="middle" class="ti">Price field: 0.01 to 9999.99</text>
  <rect x="20" y="60" width="100" height="40" class="invalid"/>
  <rect x="120" y="60" width="300" height="40" class="valid"/>
  <rect x="420" y="60" width="80" height="40" class="invalid"/>
  <text x="70" y="84" text-anchor="middle" class="ti" fill="#fff">INVALID</text>
  <text x="270" y="84" text-anchor="middle" class="ti" fill="#fff">VALID partition</text>
  <text x="460" y="84" text-anchor="middle" class="ti" fill="#fff">INVALID</text>
  <line x1="20" y1="120" x2="500" y2="120" class="axis"/>
  <g><line x1="120" y1="115" x2="120" y2="125" class="tk"/><text x="120" y="140" text-anchor="middle" class="sub">0.01</text></g>
  <g><line x1="420" y1="115" x2="420" y2="125" class="tk"/><text x="420" y="140" text-anchor="middle" class="sub">9999.99</text></g>
  <circle cx="100" cy="120" r="5" class="bad"/>
  <text x="100" y="160" text-anchor="middle" class="sub">0.00</text>
  <circle cx="118" cy="120" r="5" class="bad"/>
  <text x="118" y="175" text-anchor="middle" class="sub">just below</text>
  <circle cx="122" cy="120" r="5" class="ok"/>
  <text x="122" y="160" text-anchor="middle" class="sub">on edge</text>
  <circle cx="270" cy="120" r="5" class="ok"/>
  <text x="270" y="160" text-anchor="middle" class="sub">typical</text>
  <circle cx="418" cy="120" r="5" class="ok"/>
  <text x="418" y="175" text-anchor="middle" class="sub">on edge</text>
  <circle cx="422" cy="120" r="5" class="bad"/>
  <text x="422" y="160" text-anchor="middle" class="sub">just above</text>
  <circle cx="455" cy="120" r="5" class="bad"/>
  <text x="455" y="175" text-anchor="middle" class="sub">far above</text>
  <text x="20" y="195" class="sub">Bugs cluster at boundaries. One value per class + boundaries = high coverage, minimal cases.</text>
</svg>
</div>
<p>For a price field 0.01 to 9999.99:</p>
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
      diagram: `flowchart TD
  TYPE["Testing types by intent"] --> S["Smoke<br/>build is alive?<br/>5 min · every PR"]
  TYPE --> SAN["Sanity<br/>did my fix work?<br/>narrow, focused"]
  TYPE --> REG["Regression<br/>still works?<br/>hours · nightly / pre-release"]
  TYPE --> EXP["Exploratory<br/>what haven't we tested?<br/>charter, time-boxed"]
  classDef smk fill:#e76f51,color:#fff
  classDef san fill:#e9c46a,color:#222
  classDef reg fill:#2a9d8f,color:#fff
  classDef exp fill:#0a3d6e,color:#fff
  class S smk
  class SAN san
  class REG reg
  class EXP exp`,
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
      diagram: `flowchart LR
  CODE["100 lines of code"] --> COV["100% line coverage"]
  COV --> A["assertions weak?"]
  A -- yes --> FALSE["coverage 100%<br/>escape rate 30% 🔥"]
  A -- no --> REAL["coverage 100%<br/>escape rate 1% ✓"]
  CODE --> MUT["mutation testing"]
  MUT --> KILLED["% mutants killed<br/>= real assertion strength"]
  classDef bad fill:#e76f51,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  classDef star fill:#0a3d6e,color:#fff
  class FALSE bad
  class REAL good
  class KILLED star`,
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
      id: "f7109e4e-fe83-4bf3-8ac2-1b78a186405b",
      q: "Mutation testing — why is it more meaningful than line coverage?",
      diff: "hard",
      tags: ["technique", "metrics"],
      diagram: `flowchart LR
  SRC["original code<br/>sum + i.price * i.quantity"] --> MUT["mutate operator<br/>+ → -, * → /, true → false"]
  MUT --> M1["mutant A:<br/>sum - i.price * i.quantity"]
  MUT --> M2["mutant B:<br/>sum + i.price / i.quantity"]
  MUT --> M3["mutant C:<br/>baseline removed"]
  M1 --> TST["run test suite"]
  M2 --> TST
  M3 --> TST
  TST --> R{"any test fails?"}
  R -- yes --> KILL["✓ mutant KILLED<br/>(your assertions caught it)"]
  R -- no --> SUR["✗ mutant SURVIVED<br/>(weak/missing assertion)"]
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class KILL good
  class SUR bad`,
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
      id: "89f99078-b5db-47f7-a7a5-e23095ef1ad9",
      q: "Name the ISO 25010 quality characteristics. Which do most teams under-test?",
      diff: "mid",
      tags: ["istqb", "non-functional"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ISO 25010 quality characteristics wheel">
  <style>
    .ti { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .lbl { font: 600 10.5px ui-sans-serif, system-ui; text-anchor: middle; fill: #fff; }
    .ctr { font: 600 12px ui-sans-serif, system-ui; text-anchor: middle; fill: currentColor; }
    .ok { fill: #2a9d8f; opacity: 0.85; }
    .warn { fill: #e9c46a; opacity: 0.85; }
    .gap { fill: #e76f51; opacity: 0.85; }
  </style>
  <g transform="translate(160, 130)">
    <circle cx="0" cy="0" r="50" fill="var(--bg-soft)" stroke="currentColor"/>
    <text x="0" y="-3" class="ctr">ISO</text>
    <text x="0" y="14" class="ctr">25010</text>
    <g transform="rotate(-90)">
      <g transform="rotate(0)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="ok"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl">Functional</text>
      </g>
      <g transform="rotate(45)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="ok"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl">Performance</text>
      </g>
      <g transform="rotate(90)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="warn"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl" fill="#222">Compatibility</text>
      </g>
      <g transform="rotate(135)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="gap"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl">Usability</text>
      </g>
      <g transform="rotate(180)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="gap"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl">Reliability</text>
      </g>
      <g transform="rotate(225)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="gap"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl">Security</text>
      </g>
      <g transform="rotate(270)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="warn"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl" fill="#222">Maintainability</text>
      </g>
      <g transform="rotate(315)">
        <path d="M 0 -55 L 0 -100 A 100 100 0 0 1 70.7 -70.7 L 38.9 -38.9 A 55 55 0 0 0 0 -55 Z" class="warn"/>
        <text transform="rotate(22.5) translate(0,-78)" class="lbl" fill="#222">Portability</text>
      </g>
    </g>
  </g>
  <g transform="translate(330, 60)">
    <rect x="0" y="0" width="14" height="14" class="ok"/>
    <text x="22" y="11" class="sub">Usually tested well</text>
    <rect x="0" y="22" width="14" height="14" class="warn"/>
    <text x="22" y="33" class="sub">Partially tested</text>
    <rect x="0" y="44" width="14" height="14" class="gap"/>
    <text x="22" y="55" class="sub">Under-tested in most teams</text>
  </g>
  <text x="330" y="100" class="ti">Most-skipped corners:</text>
  <text x="330" y="118" class="sub">▸ Reliability — chaos, dep failure, slow nets</text>
  <text x="330" y="134" class="sub">▸ Usability — a11y, contrast, keyboard nav</text>
  <text x="330" y="150" class="sub">▸ Security — IDOR, CSRF, SSRF beyond auth</text>
  <text x="330" y="166" class="sub">▸ Maintainability — testability of the code</text>
  <text x="260" y="248" text-anchor="middle" class="sub">Treat each segment as a question, not a check-box.</text>
</svg>
</div>
<p>Eight top-level characteristics, each with sub-characteristics:</p>
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
  ]
};

export const PART_3_CATEGORIES: Category[] = [ciFlakiness, testingTheory];
