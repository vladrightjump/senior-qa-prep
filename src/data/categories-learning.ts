import type { Category } from "../types";

/* ============================================================================
   LEARNING — structured courses for the Learning section.
   Each category is one course; each question is one section of the course.
   ========================================================================= */

const communication: Category = {
  id: "learning-communication",
  label: "Effective Communication for QA Engineers",
  desc: "Beginner · 45 min · Master communicating test results, bug reports, and quality concerns to developers, product, and leadership",
  questions: [
    {
      id: "lc-overview",
      q: "Course overview & learning objectives",
      diff: "easy",
      tags: ["learning", "communication", "overview"],
      answer: `<p><strong>Level:</strong> Beginner · <strong>Duration:</strong> 45 minutes · <strong>Points:</strong> +150</p>
<p><strong>Skills covered:</strong> Communication · Agile · Stakeholder Management</p>
<h4>Learning objectives</h4>
<ul>
<li>Write professional, reproducible bug reports using the STAR format</li>
<li>Communicate effectively with developers during bug discussions and code reviews</li>
<li>Create executive-friendly test summary reports with risk assessments</li>
<li>Present QA value in business terms that leadership understands</li>
<li>Structure standup updates, sprint demos, and async status communications</li>
</ul>
<p><strong>Why communication is a QA superpower:</strong> the best bug you ever find is worthless if no one understands your report. QA engineers sit at the intersection of development, product, and business — making communication one of your most valuable skills.</p>`
    },
    {
      id: "lc-bug-reports",
      q: "Writing professional bug reports (STAR format)",
      diff: "easy",
      tags: ["learning", "communication", "bug-reports"],
      answer: `<p>A reproducible bug report saves hours of dev time. The STAR format gives reviewers everything they need in one place.</p>
<pre class="code"><code>## Bug Title: [Component] Brief description of the defect

**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2 / P3
**Environment**: Staging, Chrome 120, macOS 14.2
**Build/Version**: v2.4.1 (commit abc1234)

### Steps to Reproduce
1. Navigate to https://staging.example.com/checkout
2. Add item "Widget X" to cart
3. Enter shipping address with ZIP code "00000"
4. Click "Continue to Payment"

### Expected Result
Validation error: "Please enter a valid ZIP code"

### Actual Result
Page crashes with white screen. Console shows:
TypeError: Cannot read property 'validate' of undefined

### Attachments
- Screenshot: [white_screen.png]
- Console log: [error_log.txt]
- HAR file: [network_capture.har]

### Additional Context
- Only reproducible with 5-digit ZIP codes starting with "0"
- Works correctly with ZIP codes starting with 1-9
- First noticed after PR #456 was merged</code></pre>
<p><strong>Senior signal:</strong> attach the HAR file. It removes ambiguity around timing, payloads, and headers — and devs notice.</p>`
    },
    {
      id: "lc-bug-antipatterns",
      q: "Bug report anti-patterns to avoid",
      diff: "easy",
      tags: ["learning", "communication", "bug-reports"],
      answer: `<ul>
<li>❌ <em>"Login doesn't work"</em> — too vague<br/>
✅ <em>"Login fails with valid credentials after session timeout — returns 500 instead of redirecting to login page"</em></li>
<li>❌ <em>"I think there might be a bug somewhere in the payment flow"</em> — uncertain, no details<br/>
✅ <em>"Payment form submits successfully with expired credit card — no validation on expiry date field"</em></li>
<li>❌ Steps: <em>"1. Do the thing. 2. It breaks."</em> — not reproducible<br/>
✅ Steps: <em>"1. Navigate to /settings. 2. Click 'Change Email'. 3. Enter 'test@' (incomplete email). 4. Click Save."</em> — clear and reproducible</li>
</ul>
<p>Rule of thumb: if a new joiner couldn't reproduce the bug from your report alone, it isn't finished.</p>`
    },
    {
      id: "lc-talking-to-devs",
      q: "Communicating with developers during bug discussions",
      diff: "easy",
      tags: ["learning", "communication", "developers"],
      answer: `<p>The way you raise a bug shapes whether it gets fixed quickly or pushed back.</p>
<h4>✅ DO</h4>
<ul>
<li>Come with evidence — logs, screenshots, network traces.</li>
<li>Suggest the general area of the issue ("might be in the validation middleware").</li>
<li>Acknowledge complexity ("I know this edge case is tricky").</li>
<li>Be collaborative ("let me know if you need me to test a fix").</li>
</ul>
<h4>❌ DON'T</h4>
<ul>
<li>Blame ("you broke this").</li>
<li>Be vague ("something is wrong").</li>
<li>Exaggerate severity to get attention.</li>
<li>Close issues without proper verification.</li>
</ul>
<p>The goal is shared ownership of quality. Tone compounds — devs remember which testers were a pleasure to work with.</p>`
    },
    {
      id: "lc-code-review",
      q: "Code review comments as QA",
      diff: "easy",
      tags: ["learning", "communication", "code-review"],
      answer: `<p>QA can — and should — leave code review comments. Frame them as questions and offers of help, not verdicts.</p>
<p>✅ <em>"I notice this endpoint doesn't validate the email format. Could we add validation here to prevent invalid data? Happy to add test cases once it's in."</em></p>
<p>❌ <em>"This is wrong."</em></p>
<p>✅ <em>"The error response returns a 200 status with an error message in the body. Should this be a 400/422 instead? It would make it easier to handle in integration tests."</em></p>
<p>❌ <em>"This won't work in testing."</em></p>
<p>Notice the pattern: name a specific observation, ask a question, offer to follow up. That converts a comment from "blocker" to "collaboration".</p>`
    },
    {
      id: "lc-summary-reports",
      q: "Test summary reports for product & leadership",
      diff: "mid",
      tags: ["learning", "communication", "reporting"],
      answer: `<p>Leadership reads the first line and the verdict. Lead with the recommendation, then back it up.</p>
<pre class="code"><code>## Sprint 24 QA Summary

### Overall Quality
🟢 Release candidate is READY with minor known issues

### Test Execution
| Metric | Value |
|--------|-------|
| Total test cases | 342 |
| Passed | 325 (95%) |
| Failed | 12 (3.5%) |
| Blocked | 5 (1.5%) |

### Critical Findings
1. Payment timeout (P1) — 3% of payments fail after 30s.
   Fix ETA: Tomorrow. Workaround: retry.
2. Search performance (P2) — Search takes 5s+ for queries
   with special characters. Investigation ongoing.

### Risk Assessment
- Low risk: Core user flows (login, browse, cart) are stable
- Medium risk: Payment module — needs monitoring post-deploy
- Recommendation: Deploy with payment alerting enabled</code></pre>
<p><strong>Risk assessment</strong> is what distinguishes a senior report. A list of pass/fail counts is not a decision; a recommendation with mitigations is.</p>`
    },
    {
      id: "lc-business-value",
      q: "Framing QA as business value",
      diff: "mid",
      tags: ["learning", "communication", "business"],
      answer: `<p>Same facts, two framings — one lands, one is forgotten:</p>
<p>❌ <strong>Technical:</strong> "We found 47 bugs this sprint, 12 are critical."</p>
<p>✅ <strong>Business:</strong> "We prevented 3 payment-processing issues from reaching customers, avoiding an estimated €50K in failed transactions. The remaining items are cosmetic."</p>
<h4>Translation table</h4>
<ul>
<li>"test coverage 85%" → "8 of 10 critical journeys verified end-to-end every release"</li>
<li>"flakiness reduced 40%" → "engineers save ~2 hours/week on rerunning failed PRs"</li>
<li>"automated regression" → "regression cycle dropped from 4 hours to 20 minutes — same-day deploy"</li>
</ul>
<p>Leadership funds outcomes, not activity. Always close with the customer or revenue impact.</p>`
    },
    {
      id: "lc-meetings",
      q: "Meeting communication — standups, reviews, demos",
      diff: "easy",
      tags: ["learning", "communication", "meetings"],
      answer: `<h4>Daily standup (≈30 seconds)</h4>
<blockquote style="border-left: 3px solid var(--accent); padding: 0 12px; margin: 8px 0;">
"Yesterday: completed API test suite for payment module — all 24 tests passing.<br/>
Today: starting integration tests for the new shipping calculator.<br/>
Blocker: staging environment is down, need DevOps support."
</blockquote>
<p>Three lines: did, doing, blocked. No essays, no apologies.</p>
<h4>Sprint review / demo</h4>
<blockquote style="border-left: 3px solid var(--accent); padding: 0 12px; margin: 8px 0;">
"This sprint, QA automated 40 new test cases for the checkout flow. This reduced our regression testing time from 4 hours to 20 minutes. Here's a quick demo of the automated pipeline running..."
</blockquote>
<p>Open with the outcome, then show the proof (CI dashboard, green run). A live green pipeline beats any slide.</p>`
    },
    {
      id: "lc-async",
      q: "Email & async status communication",
      diff: "easy",
      tags: ["learning", "communication", "async"],
      answer: `<p>The TL;DR is the message. Everything else is appendix.</p>
<pre class="code"><code>Subject: [QA] Release v2.4.1 — Test Results & Recommendation

Hi team,

TL;DR: ✅ Ready for release with 1 known low-priority issue.

Details:
- Smoke tests: 100% pass (12/12)
- Regression suite: 98% pass (196/200)
- 4 failures are existing known issues (JIRA-111, JIRA-222)
- No new bugs found

Known issue going out:
- JIRA-333: Tooltip misaligned on mobile Safari (P3, cosmetic)

Recommendation: Proceed with release.

Best,
[Name]</code></pre>
<p>Structure: prefix → TL;DR → details → recommendation. Anyone scanning Slack can answer "should we ship?" in under five seconds.</p>`
    },
    {
      id: "lc-takeaways",
      q: "Key takeaways & further resources",
      diff: "easy",
      tags: ["learning", "communication", "takeaways"],
      answer: `<h4>Key takeaways</h4>
<ul>
<li><strong>Bug reports are your resume</strong> — clear, reproducible reports earn developer respect.</li>
<li><strong>Adapt your language</strong> — technical for devs, business-impact for leadership.</li>
<li><strong>Be evidence-driven</strong> — screenshots, logs, and data beat opinions.</li>
<li><strong>Collaborate, don't blame</strong> — QA is about quality, not catching people.</li>
<li><strong>Be concise</strong> — busy people read TL;DR first, details second.</li>
</ul>
<h4>Resources</h4>
<ul>
<li><a href="https://bugzilla.mozilla.org/page.cgi?id=bug-writing.html" target="_blank" rel="noopener">Mozilla — Bug writing guidelines</a></li>
<li><a href="https://glossary.istqb.org/en_US/term/defect-report" target="_blank" rel="noopener">ISTQB Glossary — Defect Report</a></li>
<li><a href="https://www.youtube.com/watch?v=kehwCtHsH_M" target="_blank" rel="noopener">Video — Communication skills for QA engineers</a></li>
</ul>`
    },
  ]
};

const criticalThinking: Category = {
  id: "learning-critical-thinking",
  label: "Critical Thinking & Problem Solving in QA",
  desc: "Intermediate · 50 min · Analytical thinking for root cause analysis, exploratory testing, and data-driven quality decisions",
  questions: [
    {
      id: "lct-overview",
      q: "Course overview & learning objectives",
      diff: "easy",
      tags: ["learning", "critical-thinking", "overview"],
      answer: `<p><strong>Level:</strong> Intermediate · <strong>Duration:</strong> 50 minutes · <strong>Points:</strong> +225</p>
<p><strong>Skills covered:</strong> Problem Solving · Critical Thinking</p>
<h4>Learning objectives</h4>
<ul>
<li>Apply the 5 Whys and Fishbone diagram techniques for root cause analysis</li>
<li>Conduct session-based exploratory testing with charters and structured notes</li>
<li>Use heuristic test approaches (SFDIPOT) to systematically explore features</li>
<li>Make informed release decisions using impact/likelihood matrices</li>
<li>Recognize and counter cognitive biases that affect testing effectiveness</li>
</ul>
<p><strong>The QA mindset:</strong> great QA engineers don't just follow scripts — they think critically about what could go wrong, systematically investigate issues, and help teams make informed decisions about quality.</p>`
    },
    {
      id: "lct-5whys",
      q: "Root cause analysis — the 5 Whys",
      diff: "mid",
      tags: ["learning", "critical-thinking", "rca"],
      answer: `<p>Stop at the first plausible cause and you patch a symptom. Keep asking "why" until you reach a systemic answer.</p>
<pre class="code"><code>Problem: Users report intermittent checkout failures

Why 1: Why is checkout failing?
  → The payment API returns a 500 error

Why 2: Why does the payment API return 500?
  → The database connection pool is exhausted

Why 3: Why is the connection pool exhausted?
  → Connections are not being properly released after failed transactions

Why 4: Why aren't connections released on failure?
  → The error handling code doesn't include a finally block for cleanup

Why 5: Why doesn't the error handling clean up connections?
  → Code was copied from a prototype — no code review caught it

★ Root cause: Missing connection cleanup + insufficient code review
★ Fix: Add finally block + add connection leak check to review checklist</code></pre>
<p><strong>Senior signal:</strong> the fix has two parts — the code change <em>and</em> the process change that prevents the class of bug from recurring.</p>`
    },
    {
      id: "lct-fishbone",
      q: "Root cause analysis — Fishbone (Ishikawa) diagram",
      diff: "mid",
      tags: ["learning", "critical-thinking", "rca"],
      answer: `<p>Use a fishbone diagram when the cause space is wide and you need to brainstorm categorically rather than linearly.</p>
<pre class="code"><code>                Environment          Code
                    │                  │
                    ├── OS version     ├── Logic error
                    ├── Browser        ├── Missing validation
                    ├── Network        ├── Race condition
                    │                  │
───────────────────[BUG]───────────────────
                    │                  │
                    ├── Test data      ├── Concurrency
                    ├── Config         ├── Dependencies
                    ├── Permissions    ├── API changes
                    │                  │
                Data/Config      Integration</code></pre>
<p>Use it in a 20-minute group session: each branch gets a name, the team fills bones, then you score which branches are most likely and investigate those first.</p>`
    },
    {
      id: "lct-sbet",
      q: "Session-based exploratory testing (SBET)",
      diff: "mid",
      tags: ["learning", "critical-thinking", "exploratory"],
      answer: `<p>Exploratory testing without structure is just clicking around. SBET makes it accountable: a charter, a time-box, and notes you can hand over.</p>
<pre class="code"><code>## Exploration Charter
Target:   Shopping cart feature
Duration: 30 minutes
Focus:    Edge cases in quantity management

## Session Notes
09:00 — Empty cart. Added item. Changed quantity to 0.
        Result: Item removed ✅

09:05 — Changed quantity to -1.
        Result: 🐛 BUG! Negative quantity accepted, subtotal -€29.99

09:10 — Changed quantity to 9999.
        Result: Accepted, but stock is only 50. 🐛 No stock validation

09:15 — Typed "abc" in quantity field.
        Result: Field cleared to 0, item removed. Acceptable? ⚠ Discuss

09:20 — Added same item twice from different pages.
        Result: Two separate line items. 🐛 BUG

## Summary
- Duration: 25 minutes
- Bugs found: 3
- Questions: 1 (quantity=0 behavior)
- Areas not covered: Coupon interaction, shipping address</code></pre>
<p>The "areas not covered" line is what makes the session report useful to the next tester. Coverage gaps are explicit, not implied.</p>`
    },
    {
      id: "lct-sfdipot",
      q: "Heuristic test approaches — SFDIPOT",
      diff: "mid",
      tags: ["learning", "critical-thinking", "heuristics"],
      answer: `<p>Heuristic mnemonics give exploratory testers structured prompts so they don't miss whole dimensions of the system.</p>
<h4>SFDIPOT (a.k.a. San Francisco Depot)</h4>
<ul>
<li><strong>S</strong>tructure — what is it made of?</li>
<li><strong>F</strong>unction — what does it do?</li>
<li><strong>D</strong>ata — what data does it process?</li>
<li><strong>I</strong>nterface — how does it connect to other things?</li>
<li><strong>P</strong>latform — what environments does it run on?</li>
<li><strong>O</strong>perations — how is it used in practice?</li>
<li><strong>T</strong>ime — how does it behave over time?</li>
</ul>
<p>Worked example for a new login form: <em>Structure</em> = which components render? <em>Function</em> = sign-in, reset, SSO? <em>Data</em> = passwords stored where, in what format? <em>Interface</em> = which APIs? <em>Platform</em> = mobile Safari, iframe-embedded? <em>Operations</em> = how do real users get here, what do they paste? <em>Time</em> = session expiry, lockout windows.</p>
<p>Each prompt typically uncovers 1–2 test ideas you'd otherwise miss.</p>`
    },
    {
      id: "lct-decision-matrix",
      q: "Decision making under uncertainty — impact × likelihood matrix",
      diff: "mid",
      tags: ["learning", "critical-thinking", "decisions"],
      answer: `<p>"Should we release with this bug?" is a 2×2 question. Force the answer onto the matrix:</p>
<pre class="code"><code>                Low Impact          High Impact
            ┌──────────────────┬──────────────────┐
Rare        │ Accept risk      │ Monitor closely  │
(unlikely)  │ Ship with ticket │ Fix if time      │
            ├──────────────────┼──────────────────┤
Common      │ Fix in next      │ MUST FIX before  │
(likely)    │ sprint           │ release          │
            └──────────────────┴──────────────────┘</code></pre>
<p>Two questions force clarity:</p>
<ol>
<li>How many users hit this, how often? (likelihood)</li>
<li>What's the cost when they do? (impact)</li>
</ol>
<p>"It's only a cosmetic bug but it's on the checkout button" → high impact, common = MUST FIX. Putting bugs on the grid removes the gut-feel argument.</p>`
    },
    {
      id: "lct-biases",
      q: "Cognitive biases that undermine testing",
      diff: "mid",
      tags: ["learning", "critical-thinking", "biases"],
      answer: `<ul>
<li>🧠 <strong>Confirmation bias</strong> — "I think login works" → only test valid credentials.<br/>
<em>Fix:</em> deliberately test what you expect to work.</li>
<li>🧠 <strong>Anchoring bias</strong> — "the dev said it's fine" → less thorough testing.<br/>
<em>Fix:</em> test independently of developer confidence.</li>
<li>🧠 <strong>Pesticide paradox</strong> — running the same tests over and over finds fewer bugs.<br/>
<em>Fix:</em> regularly refresh test cases and add exploratory sessions.</li>
<li>🧠 <strong>Sunk-cost fallacy</strong> — "we invested 2 weeks in this approach" → resist changing.<br/>
<em>Fix:</em> evaluate current effectiveness, not past investment.</li>
</ul>
<p>The senior move is naming the bias when you notice it. "I might be anchoring on the dev's confidence here — let me test the failure path again" is what calibration sounds like out loud.</p>`
    },
    {
      id: "lct-troubleshooting",
      q: "Systematic troubleshooting — binary search & environment diffing",
      diff: "mid",
      tags: ["learning", "critical-thinking", "debugging"],
      answer: `<h4>Binary search debugging</h4>
<p>A 10-step user flow fails somewhere. Don't trace 10 steps — bisect.</p>
<ol>
<li>Test step 5 in isolation → fails</li>
<li>Test step 3 in isolation → passes</li>
<li>Test step 4 in isolation → <strong>FAILS</strong> ← breaking point</li>
<li>Investigate what's different about step 4.</li>
</ol>
<h4>Environment comparison</h4>
<p>When it works in dev but breaks in staging, table the differences:</p>
<table>
<tr><th>Factor</th><th>Works (Dev)</th><th>Broken (Staging)</th><th>Notes</th></tr>
<tr><td>Node version</td><td>18.17</td><td>18.19</td><td>Possible</td></tr>
<tr><td>DB schema</td><td>v45</td><td>v44</td><td>⚠ Missing migration!</td></tr>
<tr><td>API version</td><td>v2.1</td><td>v2.1</td><td>Same</td></tr>
<tr><td>Feature flags</td><td>all on</td><td>payment_v2 off</td><td>Check this</td></tr>
<tr><td>SSL</td><td>self-signed</td><td>real cert</td><td>Unlikely</td></tr>
</table>
<p>The table itself is the deliverable — when you send it to a dev they immediately see which row to investigate.</p>`
    },
    {
      id: "lct-takeaways",
      q: "Key takeaways",
      diff: "easy",
      tags: ["learning", "critical-thinking", "takeaways"],
      answer: `<ul>
<li><strong>Ask "why?" five times</strong> — surface the root cause, not just the symptom.</li>
<li><strong>Explore, don't just script</strong> — exploratory testing finds the bugs scripts miss.</li>
<li><strong>Use heuristics</strong> — structured frameworks (SFDIPOT) guide thorough exploration.</li>
<li><strong>Decide with data</strong> — use impact/likelihood matrices for go/no-go decisions.</li>
<li><strong>Watch your biases</strong> — they silently undermine your testing effectiveness.</li>
</ul>`
    },
  ]
};

const strategyPlanning: Category = {
  id: "learning-strategy-planning",
  label: "Test Strategy & Planning",
  desc: "Intermediate · 60 min · Build comprehensive test plans, estimate effort, manage risk, and communicate strategies",
  questions: [
    {
      id: "lsp-overview",
      q: "Course overview & learning objectives",
      diff: "easy",
      tags: ["learning", "strategy", "overview"],
      answer: `<p><strong>Level:</strong> Intermediate · <strong>Duration:</strong> 60 minutes · <strong>Points:</strong> +225</p>
<p><strong>Skills covered:</strong> Risk Management · Test Management</p>
<h4>Learning objectives</h4>
<ul>
<li>Distinguish between test strategy (organizational) and test plan (release-specific)</li>
<li>Apply the test pyramid and risk-based testing for efficient resource allocation</li>
<li>Estimate testing effort using WBS and three-point estimation techniques</li>
<li>Create comprehensive test plans with scope, approach, entry/exit criteria, and risk assessment</li>
<li>Identify, track, and prioritize test debt reduction</li>
</ul>
<p><strong>The foundation of quality:</strong> a test strategy defines <em>what</em> to test, <em>how</em> to test it, <em>when</em> to test, and <em>what risks</em> to accept. Without a strategy, testing is just random clicking.</p>`
    },
    {
      id: "lsp-strategy-vs-plan",
      q: "Test strategy vs. test plan",
      diff: "easy",
      tags: ["learning", "strategy", "planning"],
      answer: `<p>The two are often confused. A strategy is the long-lived doctrine; a plan is its application to a specific release.</p>
<table>
<tr><th>Aspect</th><th>Test Strategy</th><th>Test Plan</th></tr>
<tr><td>Scope</td><td>Organization or project-wide</td><td>Specific release or sprint</td></tr>
<tr><td>Duration</td><td>Long-term (updated quarterly)</td><td>Short-term (per sprint/release)</td></tr>
<tr><td>Content</td><td>Approach, tools, standards</td><td>Specific test cases, schedule, resources</td></tr>
<tr><td>Owner</td><td>QA Lead / Manager</td><td>QA Engineer / Team</td></tr>
<tr><td>Example</td><td>"We do API + E2E + Performance testing"</td><td>"Sprint 24: 50 tests for checkout feature"</td></tr>
</table>
<p>Tell: a "test plan" that lists tooling preferences but no schedule is actually a strategy. A "test strategy" that names specific tickets is actually a plan.</p>`
    },
    {
      id: "lsp-pyramid",
      q: "The test pyramid",
      diff: "mid",
      tags: ["learning", "strategy", "pyramid"],
      answer: `<pre class="code"><code>     /    E2E    \\        Few — expensive, slow, reliable
    /  Integration \\      Medium — API + service level
   /     Unit       \\     Many — fast, cheap, focused</code></pre>
<p><strong>Recommended ratios</strong></p>
<ul>
<li><strong>Unit tests: 70%</strong> — developers own these.</li>
<li><strong>Integration / API tests: 20%</strong> — QA + developers.</li>
<li><strong>E2E tests: 10%</strong> — QA owns these.</li>
</ul>
<p>An inverted pyramid (mostly E2E) is the most common QA anti-pattern: slow CI, flaky runs, debug nightmares. The fix is rarely "delete E2E tests" — it's "push the same assertions down to API or unit level".</p>`
    },
    {
      id: "lsp-risk-based",
      q: "Risk-based testing",
      diff: "mid",
      tags: ["learning", "strategy", "risk"],
      answer: `<p>Not every feature deserves the same coverage. Score by impact, change frequency, and complexity:</p>
<table>
<tr><th>Feature</th><th>Business Impact</th><th>Change Frequency</th><th>Complexity</th><th>Risk Score</th><th>Test Priority</th></tr>
<tr><td>Payment processing</td><td>Critical (revenue)</td><td>Medium</td><td>High</td><td>🔴 9/10</td><td>Extensive</td></tr>
<tr><td>User login/auth</td><td>Critical (security)</td><td>Low</td><td>Medium</td><td>🔴 8/10</td><td>Comprehensive</td></tr>
<tr><td>Search filters</td><td>Medium (UX)</td><td>High</td><td>Medium</td><td>🟡 6/10</td><td>Moderate</td></tr>
<tr><td>Footer links</td><td>Low (info)</td><td>Low</td><td>Low</td><td>🟢 2/10</td><td>Smoke only</td></tr>
</table>
<p>The matrix is also a justification tool: when leadership asks "why no coverage on X?", point to its row.</p>`
    },
    {
      id: "lsp-test-types",
      q: "Test types to consider",
      diff: "easy",
      tags: ["learning", "strategy", "test-types"],
      answer: `<pre class="code"><code>1. Functional Testing
   ├── Smoke tests       (critical path, 5 min)
   ├── Regression tests  (full suite, 30 min)
   └── New feature tests (per sprint)

2. Non-Functional Testing
   ├── Performance     (load, stress, endurance)
   ├── Security        (OWASP Top 10, auth)
   ├── Accessibility   (WCAG 2.1 AA)
   └── Compatibility   (browsers, devices)

3. Specialized Testing
   ├── API contract testing
   ├── Database/migration testing
   └── Localization testing</code></pre>
<p>A strategy doc should explicitly call out which of these are <em>in</em> and which are <em>out</em>. Silence creates wrong expectations.</p>`
    },
    {
      id: "lsp-estimation",
      q: "Estimating testing effort — WBS & three-point",
      diff: "mid",
      tags: ["learning", "strategy", "estimation"],
      answer: `<h4>Work Breakdown Structure (WBS)</h4>
<pre class="code"><code>Checkout Feature Testing:
├── Test case design           4h
├── Test data preparation      2h
├── Test environment setup     1h
├── Execution — Happy paths    3h
├── Execution — Edge cases     4h
├── Execution — Integration    2h
├── Bug reporting & retesting  3h
├── Automation (10 key tests)  8h
└── Report writing             1h
─────────────────────────────────
Total: 28 hours (≈ 3.5 days)</code></pre>
<h4>Three-point estimation</h4>
<ul>
<li><strong>Optimistic (O):</strong> 20h — everything goes smoothly</li>
<li><strong>Most Likely (M):</strong> 28h — normal amount of issues</li>
<li><strong>Pessimistic (P):</strong> 40h — major blockers, env issues</li>
</ul>
<p>Estimate = (O + 4M + P) / 6 = (20 + 112 + 40) / 6 = <strong>28.7 hours</strong></p>
<p>Giving a single number ("28h") sounds certain. Giving a range with a method behind it ("21–40h, weighted estimate ≈29h, mostly sensitive to env stability") sounds senior.</p>`
    },
    {
      id: "lsp-test-plan-template",
      q: "Test plan template",
      diff: "mid",
      tags: ["learning", "strategy", "template"],
      answer: `<pre class="code"><code># Test Plan: [Feature/Release Name]

## 1. Overview
- Feature description: [What we're testing]
- Release date: [Target date]
- QA resources: [Who's testing]

## 2. Scope
### In Scope
- ✅ User registration flow (web + mobile)
- ✅ Email verification
- ✅ Social login (Google, Azure AD)

### Out of Scope
- ❌ Admin user management (separate sprint)
- ❌ Performance testing (dedicated test cycle)

## 3. Test Approach
- Manual exploratory: New features
- Automated regression: Existing flows
- API testing: All new endpoints

## 4. Entry & Exit Criteria
### Entry Criteria
- [ ] Code deployed to staging
- [ ] Test data seeded
- [ ] All dependencies available

### Exit Criteria
- [ ] 100% of P0/P1 test cases executed
- [ ] 0 P0 bugs open
- [ ] &lt; 3 P1 bugs open (with workarounds)
- [ ] Regression suite passing &gt; 95%

## 5. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Staging environment instability | High | Backup env available |
| Third-party API downtime | Medium | Mock services ready |
| QA resource unavailable | High | Cross-trained backup |</code></pre>
<p>Entry &amp; exit criteria are the load-bearing sections. Without them, "are we done?" becomes a feeling instead of a check.</p>`
    },
    {
      id: "lsp-takeaways",
      q: "Key takeaways",
      diff: "easy",
      tags: ["learning", "strategy", "takeaways"],
      answer: `<ul>
<li><strong>Strategy is doctrine, plan is execution</strong> — don't conflate the two.</li>
<li><strong>Respect the pyramid</strong> — push assertions down to the cheapest layer that can catch the bug.</li>
<li><strong>Score risk explicitly</strong> — risk-based prioritisation makes "why no coverage?" answerable.</li>
<li><strong>Estimate with ranges and methods</strong> — single numbers hide your assumptions.</li>
<li><strong>Entry &amp; exit criteria</strong> are what turn "we tested it" into "we're done".</li>
</ul>`
    },
  ]
};

export const LEARNING_CATEGORIES: Category[] = [
  communication,
  criticalThinking,
  strategyPlanning,
];
