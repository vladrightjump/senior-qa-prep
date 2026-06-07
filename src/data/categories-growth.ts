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
    {
      id: "a1b2c3d4-0001-4001-8001-000000000001",
      q: "Scenario: It's release day. Regression has 90 cases left and you have 6 hours. The PM wants to ship. What do you do?",
      diff: "hard",
      tags: ["test-management", "scenario", "risk"],
      answer: `<p>This is a <strong>risk-triage</strong> moment, not a heroics moment. The senior move is to <em>reduce scope of what you assert</em>, not to grind through 90 cases at half quality.</p>
<p><strong>Within the first 30 min:</strong></p>
<ol>
<li>Group the remaining 90 by risk: <em>critical user paths</em> (login, checkout, payment), <em>regression of recent changes</em> (look at the diff for this release), <em>nice-to-have edges</em>.</li>
<li>Cut everything in tier 3. Be explicit: "These 40 cases will run in the next cycle. Here's the list."</li>
<li>Estimate: critical (20 cases × 6 min = 2h), recent-change (30 × 4 min = 2h), buffer for retests on failures (2h).</li>
</ol>
<p><strong>Communicate the cut, don't hide it.</strong> Send the PM + EM a short note: <em>"Shipping path: covering A, B, C. Deferring D, E, F to next cycle. Residual risk: X. Recommend rollback plan ready and feature flag on for D."</em></p>
<p>Senior signal: you traded <em>completeness</em> for <em>transparency about risk</em>. Junior signal: you'd either burn yourself out trying all 90, or silently skip and pretend they passed.</p>
<p><strong>Red flag answer to avoid:</strong> "I'd ask for an extension." Sometimes you can — but the interviewer wants to see how you handle <em>not getting</em> the extension.</p>`
    },
    {
      id: "a1b2c3d4-0001-4001-8001-000000000002",
      q: "Case study: What went wrong at Knight Capital (2012), and what does it teach about test management?",
      diff: "hard",
      tags: ["test-management", "case-study"],
      answer: `<p><strong>What happened:</strong> Knight Capital lost <strong>$440M in 45 minutes</strong> on Aug 1, 2012. A deploy of new order-router code went to 7 of 8 production servers. The 8th still ran an old function called <code>Power Peg</code>, repurposed as a feature flag. The flag flip activated dead code on the unupdated box, which started flooding the market with unwanted trades.</p>
<p><strong>QA / test management failures that compounded:</strong></p>
<ul>
<li><strong>No deployment verification</strong> — there was no automated check that all 8 servers were on the same build.</li>
<li><strong>Dead code not pruned</strong> — <code>Power Peg</code> hadn't been used in 9 years but was still shipped in every build.</li>
<li><strong>No safe-mode kill switch in test plan</strong> — no rehearsed rollback. They tried to "fix forward" for 45 minutes while losing money per second.</li>
<li><strong>Feature flag reused as a deploy mechanism</strong> — the same toggle name had two unrelated meanings across versions.</li>
</ul>
<p><strong>What a senior QA would have done:</strong></p>
<ol>
<li>A pre-deploy smoke that hits every box and asserts build hash + version → fails if drift.</li>
<li>A deploy runbook with explicit <em>"if X, roll back in &lt; 5 min"</em> criteria.</li>
<li>A periodic dead-code audit as part of release readiness.</li>
<li>A canary trade with a tiny notional that runs in prod after deploy, before opening the firehose.</li>
</ol>
<p>The lesson is not "QA should have caught the bug." The lesson is: <em>test management owns the bridge between code that passes tests and code that runs in production safely.</em></p>`
    },
    {
      id: "a1b2c3d4-0001-4001-8001-000000000003",
      q: "Scenario: A bug shipped to prod. The postmortem question is, 'Why did QA miss this?' How do you respond?",
      diff: "mid",
      tags: ["test-management", "blameless-postmortem", "scenario"],
      answer: `<p>Reframe the question, but do it without being defensive. The honest answer is almost never <em>"QA missed it"</em> — it's usually <em>"the system that catches bugs has a hole in the shape of this bug."</em></p>
<p><strong>What to say:</strong></p>
<ol>
<li><strong>Walk the test coverage map for the failing area.</strong> Was the path covered? At which layer? With what data?</li>
<li><strong>Classify the miss:</strong> (a) untested path, (b) tested but with insufficient data, (c) tested in CI but skipped in this run, (d) impossible to catch pre-prod because it required prod-only data/load, (e) caught by an alert that nobody owned.</li>
<li><strong>Pick the cheapest fix that closes the hole class</strong>, not just this bug — e.g. "Add a contract test on the upstream payload, not just a unit test for this branch."</li>
</ol>
<p><strong>Language to use:</strong> "Our pre-prod testing didn't include X because Y. The fix is to add Z, which would also catch a class of similar issues. Here's the ticket and the owner."</p>
<p><strong>Language to avoid:</strong> "I'll add more tests." (Vague, defensive, doesn't address class of issue.)</p>
<p>Senior QA framing: bugs in prod are <em>process signals</em>. The interview win is showing you treat them as data, not as personal failures or QA-vs-dev fights.</p>`
    },
    {
      id: "a1b2c3d4-0001-4001-8001-000000000004",
      q: "Example: Sketch a 1-page test plan for a 'forgot password' feature in a B2C app.",
      diff: "easy",
      tags: ["test-management", "example", "test-plan"],
      answer: `<p>A one-pager is enough for most features. The trick is being explicit about what you <em>aren't</em> testing.</p>
<pre><code># Test Plan — Forgot Password (FE + API + email)

## 1. Scope
IN: request reset, email delivery, link-click flow, token expiry, new-password rules, login with new password.
OUT: account lockout policy (covered by Auth team plan #142), localization beyond en-US, mobile native flow.

## 2. Risks (likelihood x impact)
- HIGH: token reuse / replay (security)
- HIGH: reset email not delivered (deliverability)
- MED:  expired token shows confusing error (UX)
- LOW:  email rendering in obscure clients (visual)

## 3. Test types &amp; ownership
- Unit (Dev): token generator, password validator
- API (QA):  POST /reset-request, POST /reset-confirm — happy + 4xx + 5xx
- E2E (QA):  full flow on Chrome desktop + Safari iOS, dark mode
- Security (Sec): token entropy, single-use, expiry, replay
- Manual (QA): email rendering in Gmail, Outlook, Apple Mail

## 4. Data &amp; environments
Seeded user fixture, Mailpit for email capture in staging, fake clock for expiry tests.

## 5. Exit criteria
All P0/P1 pass; no open security findings; deliverability check &gt; 99% in last 24h on staging mailer.

## 6. Out-of-scope risks accepted
We are not load-testing the reset endpoint this release. Rate limit is enforced upstream by WAF rule #88.

## 7. Sign-off
QA lead, Eng lead, Security lead.</code></pre>
<p>Why this is senior: explicit <em>OUT-of-scope</em>, named risk owner, and accepted residual risk. A plan that says "test everything" tells you nothing.</p>`
    },
    {
      id: "a1b2c3d4-0001-4001-8001-000000000005",
      q: "Quiz: A PM keeps changing acceptance criteria mid-sprint. Traceability is breaking. How do you protect it without becoming the 'no' person?",
      diff: "mid",
      tags: ["test-management", "scenario", "traceability"],
      answer: `<p>Two failures to avoid: (a) freezing the PM out, which damages trust, and (b) silently absorbing the churn, which loses the audit trail.</p>
<p><strong>The senior approach:</strong></p>
<ol>
<li><strong>Move traceability into the ticket itself.</strong> Each AC line has an ID (AC-1, AC-2…). Test cases reference those IDs. If AC-2 changes, the linked test cases auto-show as <em>"needs review."</em></li>
<li><strong>Set a soft cutoff.</strong> "After Wednesday of sprint, AC changes either ship as-is, get bumped, or trigger an explicit re-plan." Make it a team norm, not a QA edict.</li>
<li><strong>Maintain a change log on the ticket.</strong> Three lines: <em>"AC-3 changed 2026-05-10 — added handling for expired carts. Re-tested by VF. Original behavior preserved by feature flag."</em></li>
<li><strong>Surface the cost, not the complaint.</strong> "This is the third AC change this week — last regression took us 6h. If we expect more churn, let's plan for it." Quantified, not whiny.</li>
</ol>
<p><strong>Tools that help:</strong> Linear / Jira AC fields, Xray or TestRail for test-to-requirement links, a "definition of ready" the team agreed to, and a 5-minute Friday sync where AC changes are reviewed.</p>
<p>The goal is to make traceability cost-free for the PM and visible for the team — not to gate their changes.</p>`
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
    {
      id: "a1b2c3d4-0002-4002-8002-000000000001",
      q: "Scenario: Your team has 5,000 E2E tests, 70% are flaky, the suite takes 4h. Build the case to invert the pyramid.",
      diff: "hard",
      tags: ["strategy", "pyramid", "scenario"],
      answer: `<p>You're not arguing "E2E is bad." You're arguing <strong>the current mix costs more than it earns</strong>. Lead with cost, not theory.</p>
<p><strong>Step 1 — quantify what the suite costs today:</strong></p>
<ul>
<li>4h × 8 devs × ~3 PR cycles/day → ~96 dev-hours/day waiting on CI.</li>
<li>70% flaky → ~2 reruns per PR → infra bill and another hour of dev attention each.</li>
<li>Bug escape rate <em>despite</em> the suite — pull last quarter's prod incidents and check how many had passing E2Es.</li>
</ul>
<p><strong>Step 2 — sample where the value is:</strong> pick 10 random failing E2Es, see how many caught a real regression. Usually it's &lt;20%. The other 80% caught timing / data / environment issues that a contract or integration test would catch faster and cheaper.</p>
<p><strong>Step 3 — propose the inversion as a 3-month plan:</strong></p>
<ol>
<li>Freeze new E2E creation; require an ADR to add one.</li>
<li>Tag the existing 5,000 by feature; for each, ask "what's the smallest layer that could catch this regression?" Move what fits down (component, contract, integration).</li>
<li>Keep ~50–100 true journey E2Es as smoke / synthetic monitoring.</li>
<li>Track flakiness weekly. Goal: &lt;2% by month 3.</li>
</ol>
<p><strong>Step 4 — agree what failure looks like.</strong> "If after month 1 escape rate climbs or critical paths get missed, we pause and reassess." That earns trust.</p>
<p>The 2025 industry data backs this — teams using Playwright + a thinner E2E layer report 40% faster execution and 50% fewer flakes vs Selenium-heavy stacks. But cite <em>your</em> numbers, not theirs.</p>`
    },
    {
      id: "a1b2c3d4-0002-4002-8002-000000000002",
      q: "Case study: CrowdStrike (July 2024) took down 8.5M Windows machines in 2 hours. What testing strategy gap allowed it?",
      diff: "hard",
      tags: ["strategy", "case-study", "release-process"],
      answer: `<p><strong>What happened:</strong> CrowdStrike pushed a "Rapid Response Content" config update to the Falcon sensor on 19 Jul 2024. The new file contained a logic error that triggered an out-of-bounds memory read in the kernel-mode driver, BSODing every machine it reached. Airlines grounded, hospitals diverted, ~$5B+ damage.</p>
<p><strong>The strategy gap was not "they didn't test." It was that they had two release pipelines with different rigor:</strong></p>
<ul>
<li><em>Full sensor releases</em> — code, staged rollout, full QA.</li>
<li><em>Rapid Response Content</em> — config / detection rules, treated as "data," bypassing the full validation pipeline.</li>
</ul>
<p>The faulty file went straight to global production. There was no canary, no staged rollout, no kill switch fast enough to matter.</p>
<p><strong>Strategic lessons for a senior QA:</strong></p>
<ol>
<li><strong>Anything that runs on the customer's machine is "code," regardless of file extension.</strong> If you have a fast path for "just config," that fast path is a load-bearing risk surface and needs its own validation.</li>
<li><strong>Staged rollouts aren't optional for blast radius this size.</strong> 1% → 10% → 50% → 100% with health checks between. Even 30 minutes of staged rollout would have caught this.</li>
<li><strong>The kill switch must be tested.</strong> CrowdStrike couldn't pull the file back because affected machines couldn't boot to receive an update. The rollback assumed a working OS.</li>
<li><strong>"Defense in depth" for the release process itself</strong> — fuzz tests on config parsers, schema validation before publish, a canary fleet that runs production traffic.</li>
</ol>
<p>This is the "confidence in strategy" question made concrete: <em>where in your release pipeline can a single artifact reach 100% of users with no human in the loop?</em> If you can name that point, you've found your highest-leverage test investment.</p>`
    },
    {
      id: "a1b2c3d4-0002-4002-8002-000000000003",
      q: "Scenario: Greenfield mobile banking app. 4-month launch. Design the test strategy.",
      diff: "hard",
      tags: ["strategy", "scenario", "mobile", "risk-based"],
      answer: `<p>Anchor on <strong>risk × regulation × release cadence</strong>. Mobile banking has high blast radius (money + reputation) and regulatory weight (PCI, PSD2, GDPR). The strategy reflects that.</p>
<p><strong>Layered plan:</strong></p>
<ul>
<li><strong>Static / shift-left</strong> — TypeScript strict, ESLint with security rules, dependency scanning (Snyk / Dependabot), secrets scanning. Mandatory PR gate.</li>
<li><strong>Unit (Dev-owned)</strong> — calculation logic, currency formatting, transaction state machine. Target 80% on the money-math module, lower elsewhere.</li>
<li><strong>Component (QA + Dev)</strong> — React Native components with Testing Library. Auth flows, balance screens, transfer form validation.</li>
<li><strong>Contract (QA)</strong> — Pact between app and each backend service (accounts, payments, notifications). Both sides verify on every PR.</li>
<li><strong>API (QA)</strong> — Postman / supertest suites: auth flows, idempotency keys, error envelope, rate limits.</li>
<li><strong>E2E (QA)</strong> — Maestro or Detox on real devices via BrowserStack. Just the golden paths (~15 flows): login, view balance, transfer, statement, logout. Run on each release branch, not every PR.</li>
<li><strong>Security</strong> — pen-test before launch, MASVS checklist, certificate pinning verified, biometric flows tested across iOS/Android quirks.</li>
<li><strong>Accessibility</strong> — WCAG 2.2 AA target; banking is often legally required.</li>
<li><strong>Performance</strong> — cold start &lt; 2s, transfer submit p95 &lt; 1.5s. Synthetic monitoring once live.</li>
<li><strong>Exploratory</strong> — weekly charters tied to recent changes. This is where 80% of UX issues will be found.</li>
</ul>
<p><strong>Non-goals you call out explicitly:</strong> not chasing 90% unit coverage; not building a custom test framework when Maestro exists; not auto-testing every device — pick 5 representative ones via crashlytics demographics.</p>
<p><strong>Release strategy:</strong> phased rollout via App Store / Play staged release (1% → 10% → 100%), feature flags for risky paths, on-call rota for week-1 launch.</p>
<p>Senior signal: you named what you're <em>not</em> doing and why. Junior signal: you'd promise full coverage of everything.</p>`
    },
    {
      id: "a1b2c3d4-0002-4002-8002-000000000004",
      q: "Quiz: A critical bug shipped in code with 95% unit coverage. How is that possible — and what does it say about your strategy?",
      diff: "mid",
      tags: ["strategy", "scenario", "interview-quiz"],
      answer: `<p>Coverage is a <em>measure of code touched by tests</em>, not <em>behavior verified</em>. A 95% covered codebase can still ship critical bugs in at least five ways:</p>
<ol>
<li><strong>Wrong assertions.</strong> Tests run the code but assert something trivial (<code>expect(result).toBeDefined()</code>). Mutation testing exposes this — Stryker, PIT.</li>
<li><strong>Wrong inputs.</strong> Tests pass with the happy data the dev wrote them for; the bug lives in the edge case nobody tested (null, empty string, negative, leap year, timezone boundary).</li>
<li><strong>Integration gaps.</strong> All units pass; the wiring between them is broken. This is the classic "trophy" critique of the pyramid.</li>
<li><strong>Mocked-away reality.</strong> The DB call is mocked to return what the test wants. In prod, the real query returns a different shape and the code crashes.</li>
<li><strong>Concurrency / state.</strong> Single-call unit tests can't surface race conditions, ordering, or stale-cache bugs.</li>
</ol>
<p><strong>What it says about your strategy:</strong> you've optimized for the <em>cheapest-to-measure</em> metric instead of <em>fitness-for-purpose</em>. The fix is to add layers where the missing class of bug lives — usually contract / integration tests, mutation testing on the money-math modules, and a small set of synthetic prod probes.</p>
<p><strong>Reframing line for the interview:</strong> "Coverage is a hygiene signal, not a quality signal. I care more about whether our top 10 critical paths have <em>verified behavior</em> than whether our line coverage is 80 or 95."</p>`
    },
    {
      id: "a1b2c3d4-0002-4002-8002-000000000005",
      q: "Example: Write a 1-page testing strategy document for a feature.",
      diff: "mid",
      tags: ["strategy", "example", "documentation"],
      answer: `<p>A strategy doc is not a test plan. It says <em>what we'll bet on and why</em>, not the case-by-case detail. One page max.</p>
<pre><code># Testing Strategy — Realtime Notifications (Q2 2026)

## Goal
Confidence that notifications are delivered, in order, within SLA (p95 &lt; 5s), without duplicate sends.

## What's risky here
1. Fan-out at scale — 1 event can become 100k pushes.
2. Ordering — out-of-order notifications confuse users (e.g. "X liked your post" after "X unliked it").
3. Idempotency — retries from the broker must not double-send.

## Where we'll put the test weight
- 60% contract + integration on the publisher and worker boundaries (we own both).
- 20% unit on the dedup / ordering logic — this is where bugs hide.
- 15% load tests (k6) at 10x current peak, run weekly.
- 5% E2E smoke — receive a real push on a real device, 3 platforms.

## What we are NOT doing
- Not unit-testing every notification template variant (covered by snapshot tests).
- Not load-testing the email channel — it's not the bottleneck this quarter.
- Not pursuing 90%+ coverage; we're targeting verified behavior on critical paths.

## How we know it's working
- Defect escape rate &lt; 1 per release.
- p95 delivery latency stays under 5s in prod synthetic checks.
- Zero duplicate-send incidents in 90 days.

## Open risks &amp; owners
- Mobile push provider rate limits during spikes — owner: @platform-team
- Replay-attack resistance of the webhook — owner: @security

## Review
Quarterly, or after any incident touching this surface.</code></pre>
<p>Why this is senior: it bets the test budget on the <em>highest-risk surfaces</em>, names explicit non-goals, and ties success to <em>measurable</em> outcomes. It would survive a 5-minute exec read.</p>`
    },
  ]
};

const automationFrameworks: Category = {
  id: "growth-automation-frameworks",
  label: "Growth: Automation Frameworks",
  desc: "Survey of frameworks/libraries at each validation level and how to choose",
  questions: [
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
      id: "a1b2c3d4-0003-4003-8003-000000000001",
      q: "Scenario: Your org standardized on Selenium 4 years ago. The team wants to migrate to Playwright. Make the case (and the migration plan).",
      diff: "hard",
      tags: ["frameworks", "scenario", "migration"],
      answer: `<p>The case is not "Playwright is cooler." It's a <strong>cost / risk / velocity argument</strong> with numbers.</p>
<p><strong>Build the case (1-pager):</strong></p>
<ul>
<li><strong>Current state:</strong> Selenium suite — N tests, X minutes, Y% flake rate, Z hours of weekly QA time spent on rerun/triage.</li>
<li><strong>Industry data:</strong> 2025 adoption — Playwright at ~45% (and rising), Selenium ~22% (declining). Playwright pipelines deliver ~40% faster execution, ~50% fewer flakes (TestDino, 2025 benchmarks). Cite as supporting data, not as the case itself.</li>
<li><strong>What you specifically gain:</strong> native auto-wait (kills 60% of your flakes), trace viewer (cuts debug time), parallelism by default, built-in API testing (deletes a separate Postman job), one tool for web + mobile-web.</li>
<li><strong>What it costs:</strong> ~6–8 engineer-weeks for the migration, ~1 week of dual-running, training time for 3 engineers, CI cost during dual-run period.</li>
<li><strong>Payback period:</strong> if you save 8h/week of triage × 4 engineers, that's 32h/week. Migration pays back in ~6 weeks.</li>
</ul>
<p><strong>Migration plan (phased, not big-bang):</strong></p>
<ol>
<li><strong>Week 1:</strong> Stand up Playwright in CI alongside Selenium. Port 5 representative tests (one easy, one hard, one flaky). Compare execution time and flakes.</li>
<li><strong>Week 2–4:</strong> Build shared fixtures, auth setup, test data factories in Playwright. Migrate the 50 critical-path tests first.</li>
<li><strong>Week 5–8:</strong> Migrate by feature owner — devs port their team's tests with QA pairing. Quarantine flakes in Selenium, don't migrate them as-is.</li>
<li><strong>Week 9:</strong> Selenium runs as "shadow" CI for one week, then is deleted.</li>
<li><strong>Post-migration:</strong> Track flake rate weekly; goal &lt; 1% in 90 days.</li>
</ol>
<p><strong>Counter-arguments to be ready for:</strong> "We have Java skills" — Playwright has Java/Python/C# bindings; you don't have to move to TS unless you want to. "We have a custom framework" — refactor it as a thin layer over Playwright, not a rewrite.</p>`
    },
    {
      id: "a1b2c3d4-0003-4003-8003-000000000002",
      q: "Scenario: Mobile-first SaaS app. Pick between Appium, Maestro, and BrowserStack/Sauce App Live. Justify.",
      diff: "hard",
      tags: ["frameworks", "mobile", "scenario"],
      answer: `<p>Three different categories, not three competitors. Pick a <em>combination</em>.</p>
<p><strong>Appium</strong></p>
<ul>
<li>Industry standard, WebDriver protocol, cross-platform iOS / Android.</li>
<li>Steep setup (Appium server, drivers, capabilities). Tests are verbose.</li>
<li>Fits when you need <em>full WebDriver semantics</em> or already have a desktop test team that knows Selenium.</li>
</ul>
<p><strong>Maestro</strong></p>
<ul>
<li>YAML-based flows, dramatically simpler. Built by ex-Uber team specifically because Appium was too heavy.</li>
<li>Hot-reload while authoring, AI-assisted selectors, runs against simulators / real devices.</li>
<li>Fits when you want devs to write flows. Lower ceiling, much lower floor.</li>
</ul>
<p><strong>BrowserStack App Live / Sauce Labs RDC</strong></p>
<ul>
<li>Real-device cloud — not a test framework, an <em>environment</em>. You run Appium or Maestro <em>against</em> it.</li>
<li>Necessary because emulators miss real-device issues (camera quirks, biometrics, OEM Android skins, low-memory crashes).</li>
<li>Pick one based on device coverage in your top markets and pricing per parallel session.</li>
</ul>
<p><strong>Recommendation for a mid-size SaaS:</strong></p>
<ol>
<li>Maestro for the daily PR / regression flows — fast feedback, low maintenance.</li>
<li>Appium for advanced gestures or deep native integration (in-app purchases, push notifications, certificate pinning checks).</li>
<li>BrowserStack as the device farm both run on, with a fixed list of ~5 priority devices reflecting your user base.</li>
</ol>
<p>Senior signal: you said "and," not "or." You separated framework from environment. You picked based on the <em>team's authoring cost</em>, not the tool's logo.</p>`
    },
    {
      id: "a1b2c3d4-0003-4003-8003-000000000004",
      q: "Quiz: Design the full automation stack for a microservices e-commerce platform. Justify each layer's tool choice.",
      diff: "hard",
      tags: ["frameworks", "interview-quiz", "stack-design"],
      answer: `<p>A modern microservices e-commerce stack typically has 5–8 services (catalog, cart, checkout, payments, orders, inventory, notifications, search). The test stack mirrors that.</p>
<table>
<thead><tr><th>Layer</th><th>Tool</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Static</td><td>TypeScript strict, ESLint, Snyk</td><td>Cheapest bug-killer; runs on every keystroke</td></tr>
<tr><td>Unit</td><td>Vitest (or Jest)</td><td>Speed; native ESM; same primitives as Vite-based frontends</td></tr>
<tr><td>Component (frontend)</td><td>Testing Library + Storybook Test Runner</td><td>User-centric assertions; Storybook doubles as design QA</td></tr>
<tr><td>API (per service)</td><td>Supertest (Node) or REST Assured (Java) + ajv / json-schema</td><td>Same-language assertions; schema-aware</td></tr>
<tr><td>Contract</td><td>Pact (consumer-driven) + Pactflow broker</td><td>Catches breaking changes at the boundary, not in E2E</td></tr>
<tr><td>Integration (per service)</td><td>Testcontainers + the real DB</td><td>Real Postgres / Redis / Kafka — no mocks for infra</td></tr>
<tr><td>E2E (cross-service)</td><td>Playwright — ~30 journey tests</td><td>Just the critical paths; not a regression dump</td></tr>
<tr><td>Visual</td><td>Percy or Chromatic</td><td>Catches CSS regressions humans miss</td></tr>
<tr><td>Performance</td><td>k6 (or Gatling)</td><td>Scriptable in JS / Go; runs in CI; cheap cloud mode</td></tr>
<tr><td>Security</td><td>OWASP ZAP in CI + Burp manually</td><td>Automated baseline + human depth</td></tr>
<tr><td>Synthetic (prod)</td><td>Datadog Synthetics or Checkly</td><td>Runs your top journeys every 5 min in prod</td></tr>
</tbody>
</table>
<p><strong>The trick:</strong> 90% of your bug-catching happens in <em>unit + contract + integration</em>. E2E is a <em>last line</em>, not a regression hammer. If you find yourself adding an E2E to "catch a regression," ask why it wasn't caught at a cheaper layer.</p>
<p>Senior signal: you didn't pick the trendy single tool; you composed a layered stack and justified each. Junior signal: "We'll use Cypress for everything."</p>`
    },
    {
      id: "a1b2c3d4-0003-4003-8003-000000000005",
      q: "Example: Build a framework evaluation rubric to pick between two options.",
      diff: "easy",
      tags: ["frameworks", "example", "evaluation"],
      answer: `<p>Score each criterion 1–5. Weight by what matters for <em>your</em> team. The output is a number, but the value is the discussion the rubric forces.</p>
<pre><code>| Criterion                          | Weight | Tool A | Tool B |
|------------------------------------|--------|--------|--------|
| Author experience (1=painful, 5=joy)| 3      |   4    |   5    |
| Speed of feedback                  | 3      |   3    |   5    |
| Flakiness in our domain            | 3      |   2    |   4    |
| Debuggability (traces, replay)     | 2      |   2    |   5    |
| Language fit with our codebase     | 2      |   5    |   4    |
| CI integration                     | 2      |   4    |   5    |
| Community size / recent releases   | 1      |   5    |   5    |
| Migration cost from current        | 2      |   5    |   2    |
| Cross-browser / cross-platform     | 2      |   3    |   5    |
| Security / supply chain hygiene    | 1      |   4    |   4    |
|------------------------------------|--------|--------|--------|
| Weighted total                     |        |   71   |   91   |</code></pre>
<p><strong>Rules to keep it honest:</strong></p>
<ul>
<li>Score each tool on the same evidence — actually port a real test, don't read the marketing site.</li>
<li>Include "migration cost from current" — sunk cost is real cost.</li>
<li>Spike one risky criterion (the flakiness one, usually) in a 1-day proof.</li>
<li>Share the rubric with the team before scoring; let people argue weights, not totals.</li>
</ul>
<p>The number is a tiebreaker. The conversation is the deliverable.</p>`
    },
  ]
};

const apiDatabaseTesting: Category = {
  id: "growth-api-db-testing",
  label: "Growth: API & DB Testing",
  desc: "API contracts, auth, schema validation, plus SQL & NoSQL data verification",
  questions: [
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
    {
      id: "a1b2c3d4-0004-4004-8004-000000000001",
      q: "Scenario: Order service depends on Payment service. Both are owned by different teams. How do you set up contract testing with Pact?",
      diff: "hard",
      tags: ["api", "contract-testing", "pact", "scenario"],
      answer: `<p><strong>Pact in one sentence:</strong> the consumer writes the test (against a mock), generates a "pact" JSON file, the provider verifies its real API against that pact. If the provider breaks the contract, the provider's CI fails — not the consumer's prod traffic.</p>
<p><strong>Setup, end-to-end:</strong></p>
<ol>
<li><strong>Stand up a Pact Broker</strong> (open-source or Pactflow). It's the source of truth for pacts between services.</li>
<li><strong>On the Order service (consumer):</strong> write a unit test that uses the Pact mock provider.
<pre><code>// order-service/tests/contract/payment.pact.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'OrderService',
  provider: 'PaymentService',
});

it('charges a card and returns a payment id', async () =&gt; {
  await provider
    .given('a valid card on file')
    .uponReceiving('a charge request for $20')
    .withRequest({
      method: 'POST', path: '/v1/charges',
      headers: { 'content-type': 'application/json' },
      body: { amount: 2000, currency: 'usd', source: 'tok_visa' },
    })
    .willRespondWith({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        id: MatchersV3.regex(/^ch_[A-Za-z0-9]+$/, 'ch_abc123'),
        status: 'succeeded',
      },
    })
    .executeTest(async (mock) =&gt; {
      const res = await chargeCard(mock.url, 2000);
      expect(res.status).toBe('succeeded');
    });
});</code></pre>
</li>
<li><strong>On pass, the test publishes the pact</strong> to the broker, tagged with the consumer branch / version.</li>
<li><strong>On the Payment service (provider):</strong> a provider verification step in CI fetches the pact from the broker, spins up the real API with the matching state ("a valid card on file"), and replays each interaction. If the real response doesn't match — fail the build.</li>
<li><strong>Webhook the broker → provider CI</strong> so when the consumer publishes a new pact, the provider runs verification automatically. This is the magic — breaking changes get caught <em>before</em> the consumer ships.</li>
</ol>
<p><strong>Senior signals:</strong></p>
<ul>
<li>Use <code>given()</code> states deliberately — they tell the provider what fixture data to seed.</li>
<li>Use matchers (regex, type, like) instead of exact values when the consumer doesn't care.</li>
<li>"can-i-deploy" check in deploy pipeline: <code>pact-broker can-i-deploy --pacticipant OrderService --version $GIT_SHA</code>. Refuses deploy if a verified contract is missing.</li>
<li>Don't contract-test across team boundaries you don't own — use Pact for <em>your team's</em> consumers / providers; rely on schema + integration for the rest.</li>
</ul>`
    },
    {
      id: "a1b2c3d4-0004-4004-8004-000000000002",
      q: "Scenario: You're migrating from MongoDB to Postgres. Design the data-parity test plan.",
      diff: "hard",
      tags: ["database", "migration", "scenario", "nosql", "sql"],
      answer: `<p>The plan has 3 phases: <strong>shape parity, value parity, behavior parity</strong>. Each catches a different class of bug.</p>
<p><strong>Phase 1 — Shape parity (run before any data moves):</strong></p>
<ul>
<li>For every Mongo collection, define the target Postgres schema. Nullability, defaults, types, indexes.</li>
<li>Static test: sample 10k random docs from each collection, JSON-Schema-validate against the target, fail on first incompatible shape. Surface the count, not just first failure.</li>
<li>Decide explicitly: array → JSONB column, nested object → JSONB or normalized table, polymorphic doc → separate tables.</li>
</ul>
<p><strong>Phase 2 — Value parity (run after each migration batch):</strong></p>
<pre><code>-- Pseudo-comparison: for each Mongo _id, assert the Postgres row matches.
-- Run after ETL job batch completes.
WITH mongo_view AS (
  SELECT id, payload-&gt;&gt;'email' AS email, (payload-&gt;&gt;'created_at')::timestamptz AS created_at
  FROM mongo_export   -- staged from a Mongo $out export
)
SELECT m.id
FROM mongo_view m
LEFT JOIN users u ON u.id = m.id::uuid
WHERE u.id IS NULL                           -- missing rows
   OR u.email IS DISTINCT FROM m.email       -- value drift
   OR u.created_at IS DISTINCT FROM m.created_at;</code></pre>
<p>Run on every batch; alert if any row mismatch in a critical collection. For 100M+ row tables, sample 1% with a random seed plus full check on the 1k newest and 1k oldest — the edges always break first.</p>
<p><strong>Phase 3 — Behavior parity (run with both DBs live, dual-read shadow mode):</strong></p>
<ul>
<li>Dual-write to Mongo + Postgres for a week. Reads still go to Mongo, but a shadow reader hits Postgres and diff-logs any difference.</li>
<li>Test eventual-consistency assumptions explicitly: in Mongo a read-after-write may have lagged behind; in Postgres (single-leader) it won't. Code that relied on that lag will break.</li>
<li>Replay top 20 production queries against both stores. Compare result sets <em>and</em> latency.</li>
</ul>
<p><strong>Edges to test deliberately:</strong></p>
<ul>
<li>Mongo's flexible schema means a field might be <em>missing</em> on old docs but <em>required</em> in the Postgres model. Audit before, not after.</li>
<li>Unicode normalization differences — Mongo stores raw bytes; Postgres normalizes if the collation is set. Names with accents are a classic bug.</li>
<li>Timezone — Mongo Date is UTC; Postgres needs <code>timestamptz</code> or you'll silently lose offset info.</li>
<li>ObjectId → UUID mapping must be deterministic and reversible during cutover.</li>
</ul>
<p><strong>Cutover criteria:</strong> shadow-read diff rate &lt; 0.01% for 7 consecutive days, on top-of-funnel reads.</p>`
    },
    {
      id: "a1b2c3d4-0004-4004-8004-000000000005",
      q: "Example: Write the SQL parity query a senior QA would use to validate a migration.",
      diff: "mid",
      tags: ["database", "example", "sql", "migration"],
      answer: `<p>Parity = <em>same rows, same values, same counts</em>. A real parity query is more than <code>SELECT COUNT(*)</code>. It checks shape, distribution, and tail behavior — because that's where bugs hide.</p>
<pre><code>-- 1. ROW COUNT &amp; PER-DAY DISTRIBUTION (catches truncation / partial loads)
WITH old AS (
  SELECT date_trunc('day', created_at) AS day, COUNT(*) AS n
  FROM legacy.orders GROUP BY 1
),
new_ AS (
  SELECT date_trunc('day', created_at) AS day, COUNT(*) AS n
  FROM public.orders GROUP BY 1
)
SELECT COALESCE(old.day, new_.day) AS day,
       old.n   AS old_count,
       new_.n  AS new_count,
       new_.n - old.n AS delta
FROM old FULL OUTER JOIN new_ USING (day)
WHERE old.n IS DISTINCT FROM new_.n
ORDER BY day DESC
LIMIT 30;

-- 2. AGGREGATE PARITY (catches silent type / rounding drift on money)
SELECT
  SUM(amount) AS total,
  AVG(amount) AS avg_amount,
  MIN(amount) AS min_amount,
  MAX(amount) AS max_amount,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.orders
WHERE created_at &gt;= now() - interval '7 days';
-- Run the same SQL against legacy.orders; compare line-by-line.

-- 3. ROW-LEVEL DIFF FOR A SAMPLE (catches per-row field drift)
SELECT o.id, o.amount AS new_amount, l.amount AS old_amount
FROM public.orders o
JOIN legacy.orders l ON l.id = o.legacy_id
WHERE o.amount IS DISTINCT FROM l.amount
   OR o.status IS DISTINCT FROM l.status
   OR o.user_id IS DISTINCT FROM l.user_id
TABLESAMPLE BERNOULLI (1)   -- 1% sample
LIMIT 1000;

-- 4. EDGE-CASE PROBES (the bugs live here)
-- a) NULL handling
SELECT COUNT(*) FROM public.orders WHERE user_id IS NULL;
-- compare to legacy

-- b) Unicode &amp; collation
SELECT id FROM public.orders WHERE notes ~ '[^\\x00-\\x7F]'   -- non-ASCII
EXCEPT
SELECT id FROM legacy.orders WHERE notes ~ '[^\\x00-\\x7F]';

-- c) Timezone drift
SELECT id, created_at FROM public.orders
WHERE created_at::text NOT LIKE '%+00'   -- assert UTC everywhere
LIMIT 10;</code></pre>
<p><strong>Why this is senior:</strong></p>
<ul>
<li>It checks <em>distribution</em>, not just <em>total</em> — a migration that drops Monday data but keeps weekend counts will look fine on <code>COUNT(*)</code>.</li>
<li>It probes the failure modes that <em>actually</em> bite (NULL, unicode, timezone, rounding) instead of trusting that "if the count matches, we're good."</li>
<li>It's reproducible — same query, two databases, line-by-line diff.</li>
<li>The 1% sample with row-level diff catches per-row drift cheaply; full row-diff on 100M is unnecessary if the aggregates and sample agree.</li>
</ul>`
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
    {
      id: "a1b2c3d4-0005-4005-8005-000000000001",
      q: "Scenario: New team. Releases monthly with a 2-week QA freeze. Propose a credible path to weekly releases.",
      diff: "hard",
      tags: ["improvements", "scenario", "release-process"],
      answer: `<p>Don't propose "weekly releases" on day one. The freeze exists for a reason — usually <em>regression cost</em>, <em>release coordination cost</em>, and <em>fear of incidents</em>. Address each.</p>
<p><strong>First 30 days — measure, don't move:</strong></p>
<ul>
<li>Pull DORA metrics: lead time, deploy frequency, change failure rate, MTTR. Establish baseline.</li>
<li>Time-track the 2-week freeze: what fraction is automated regression, manual regression, environment setup, signoff coordination, hotfix?</li>
<li>Interview 3 devs, 2 QA, 1 PM, 1 SRE. Ask: "What's the worst thing that would happen if we released next Monday?" Real answers point at the real blockers.</li>
</ul>
<p><strong>The proposal (60-day plan, not "weekly releases by Friday"):</strong></p>
<ol>
<li><strong>Cut regression cost by 50%</strong> — quarantine flaky tests, move 20% of the slowest E2E to component / contract layer, parallelize CI shards. Target: regression suite under 30 min.</li>
<li><strong>Decouple deploy from release</strong> — feature flags for risky changes. Deploys become low-risk; releases become a flag flip. This is the single biggest unlock.</li>
<li><strong>Add staged rollout</strong> — 1% → 10% → 50% → 100% with auto-rollback on error-rate spike. Even one-step staging buys back a lot of risk.</li>
<li><strong>Move the freeze ritual</strong> from "two-week regression sprint" to "1-day release-readiness check," supported by always-green CI.</li>
<li><strong>Pick a single low-risk service to pilot weekly cadence</strong> for 4 weeks. Show the metric — change failure rate, MTTR — improved or stayed flat. Now you can scale.</li>
</ol>
<p><strong>How to pitch it:</strong> "We're not going from monthly to weekly. We're removing the four reasons we can't release weekly. If we knock down even two, monthly becomes biweekly and the freeze shrinks."</p>
<p><strong>What kills the proposal:</strong> framing it as a QA wish ("I want faster releases"). Framing it as a business win ("we'll cut lead time from 14 days to 3, recover from incidents 4× faster, and reduce coordination tax") works.</p>`
    },
    {
      id: "a1b2c3d4-0005-4005-8005-000000000002",
      q: "Scenario: Your manager rejects your proposal. When do you push, when do you fold?",
      diff: "mid",
      tags: ["improvements", "scenario", "influence"],
      answer: `<p>"No" is data, not a verdict. The senior move is to <em>understand the no</em>, decide whether the reasoning is sound, and respond accordingly.</p>
<p><strong>Diagnose the no:</strong></p>
<ul>
<li><strong>Hard no (don't push):</strong> conflicts with org strategy, regulatory, legal, or budget you don't see. Examples: "We're in due diligence and can't change the release process for 3 months," "Compliance requires this manual signoff." Accept, ask if you can revisit on a date.</li>
<li><strong>Soft no (push, with new info):</strong> "I don't see the ROI." That's a question, not a verdict. Bring the data they don't have. Re-pitch with one number that changes.</li>
<li><strong>Political no (re-route):</strong> "Marketing wouldn't like that." There's a stakeholder you haven't talked to. Ask: "Who else needs to weigh in?" Then talk to them, not your manager again.</li>
<li><strong>Bandwidth no (descope):</strong> "We can't take this on this quarter." Offer a 2-week version. "Could we run a 1-team pilot instead of org-wide?"</li>
<li><strong>Capricious no (escalate or fold):</strong> no clear reason, no path forward. Try once more in writing. If still no — fold for now, build credibility with smaller wins, retry in 6 months with a track record.</li>
</ul>
<p><strong>How to push without being annoying:</strong></p>
<ol>
<li>"Can I share the data behind this once more?" — invites a 5-min review.</li>
<li>"What would change your mind?" — surfaces the real blocker.</li>
<li>"Can I run a 1-team / 2-week trial?" — lower stakes, clearer signal.</li>
<li>"Can we revisit at Q+1 planning?" — buys time, signals you'll be back.</li>
</ol>
<p><strong>When to fold (and how):</strong> say "thanks, I'll park this" — and actually park it. Document why it was rejected so future-you doesn't repeat the work. Senior signal: you can lose a fight gracefully and stay credible.</p>`
    },
    {
      id: "a1b2c3d4-0005-4005-8005-000000000003",
      q: "Case study: How does Google's SRE practice institutionalize 'influence without authority' — and what can QA borrow?",
      diff: "mid",
      tags: ["improvements", "case-study", "leadership"],
      answer: `<p>SRE at Google works because the team has <em>structural leverage</em>, not seniority. QA can borrow at least 4 of the mechanisms.</p>
<p><strong>What SRE actually does:</strong></p>
<ul>
<li><strong>Error budgets.</strong> Every service has an SLO (e.g. 99.9% availability). The 0.1% is a <em>budget</em>. If you spend it, dev velocity is throttled — no new features until you're back under budget. Suddenly reliability is a <em>shared business problem</em>, not a "QA's job."</li>
<li><strong>Production-readiness reviews</strong> before a service launches. SRE doesn't ask permission; the review is a gate.</li>
<li><strong>The right to refuse on-call</strong> for services with low quality bars. If your dashboard, alerting, and runbook aren't ready, SRE doesn't take pager.</li>
<li><strong>Toil budget.</strong> A 50% cap on manual / repetitive work. Forces investment in automation, not heroics.</li>
</ul>
<p><strong>What QA can borrow:</strong></p>
<ol>
<li><strong>Quality budgets.</strong> "Defect escape rate ≤ X / quarter; if exceeded, freeze new features." Quantifies the cost of skipping QA. Tie to deploy frequency / lead time.</li>
<li><strong>Test-readiness reviews</strong> as a release gate. Not a 100-question checklist; a 5-question sanity: "Critical paths covered? Rollback rehearsed? Alerts wired? Data migration parity checked? Top risk + mitigation?"</li>
<li><strong>The right to insist on layered coverage.</strong> "We won't add an E2E for this; the test belongs at the contract layer, where it's 10× cheaper. Here's the contract test." That's influence backed by a cheaper alternative.</li>
<li><strong>A toil cap for QA.</strong> Track time spent on manual regression vs new-feature testing vs flake triage. Use the numbers in budget conversations.</li>
</ol>
<p><strong>The pattern is the same:</strong> stop arguing about who has authority. Build the <em>structures</em> that make the right behavior the path of least resistance.</p>`
    },
    {
      id: "a1b2c3d4-0005-4005-8005-000000000004",
      q: "Quiz: A dev says 'QA is the bottleneck.' How do you respond?",
      diff: "mid",
      tags: ["improvements", "interview-quiz", "influence"],
      answer: `<p>This is a politically loaded question with a technical answer underneath. Two failure modes: getting defensive, or capitulating and skipping tests. The senior path is to <em>partner on the bottleneck</em>.</p>
<p><strong>What not to say:</strong></p>
<ul>
<li>"We're not the bottleneck, devs ship buggy code." (Defensive, deflects.)</li>
<li>"You're right, we'll just test less." (Capitulates, ships incidents.)</li>
<li>"That's not fair." (Emotional, doesn't move the conversation.)</li>
</ul>
<p><strong>What to say:</strong></p>
<ol>
<li>"<em>Let's look at where the time goes.</em>" Pull last 5 releases. Show the breakdown — code freeze, regression run, bug retest, manual signoff, environment setup. The bottleneck is rarely "QA running tests"; it's usually environment churn, late-arriving features, or flake retries.</li>
<li>"<em>What would 'not a bottleneck' look like?</em>" Often the dev wants faster feedback, not less testing. Faster feedback is a shared goal.</li>
<li>"<em>Here are three concrete things we could change.</em>" e.g., shift left into PR-level testing, kill 50 flaky tests, give devs the test framework to add cases themselves.</li>
<li>"<em>I'll commit to X if you commit to Y.</em>" "I'll cut regression to 1h if devs add a contract test to each PR." Reciprocity makes it a partnership.</li>
</ol>
<p><strong>Interview-level framing:</strong> "When someone says 'X is the bottleneck,' they're usually telling you their pain, not their diagnosis. The job is to find the real constraint, fix that, and make it visible — not to defend QA's honor."</p>
<p>Senior signal: you reframed the complaint as a system problem and offered a measurable change. Junior signal: you took it personally.</p>`
    },
    {
      id: "a1b2c3d4-0005-4005-8005-000000000005",
      q: "Example: Sketch a 6-month QA transformation roadmap (the kind you'd present to a head of engineering).",
      diff: "hard",
      tags: ["improvements", "example", "roadmap"],
      answer: `<p>Format matters here. A roadmap that fits on one page and reads in 60 seconds gets approved. Pages of detail get parked.</p>
<pre><code># QA Transformation — H2 2026

## Goal
Cut lead time from 14d → 5d, defect escape rate from 8/qtr → 2/qtr,
manual regression from 60h → 20h per release.

## Baseline (today)
- Lead time:           14 days
- Deploy frequency:    2 / week
- Change failure rate: 18%
- MTTR:                4h
- Flaky tests:         620 (12% of suite)
- Manual regression:   60h / release

## Workstreams
M1–2: Stabilize CI
  - Quarantine top 100 flaky tests; auto-disable on 3 failures.
  - Parallelize CI shards: target suite &lt; 30 min.
  - Trace viewer + Datadog CI Visibility on day 1.

M3: Shift left
  - Contract tests at every service boundary (Pact + broker).
  - Component tests required on every UI PR (Testing Library).
  - Schema validation as a CI gate on all API responses.

M4: De-risk the release
  - Feature flags as default for any user-visible change.
  - Staged rollout (1% → 10% → 100%) with auto-rollback on error spike.
  - Synthetic prod checks for top 10 journeys.

M5: Eliminate the freeze
  - 1-day release-readiness check replaces 2-week freeze.
  - Quality budget: if escape rate &gt; X this month, freeze features.

M6: Embed and measure
  - Embedded QA in each squad, not a central gate.
  - Quarterly review of DORA + escape rate, public dashboard.

## Investment ask
- 2 eng-quarters of platform engineer time (CI infra).
- $30k tooling (Pact broker, Datadog CI, Maestro Cloud).
- 1 SDET hire to lead contract-testing rollout.

## Risks
- Devs may push back on PR-level test requirements → mitigate with pairing weeks + clear examples.
- Flake quarantine may hide real regressions → weekly review + ratchet to re-enable.

## Decision needed by
End of June. Otherwise H2 plan slips one quarter.</code></pre>
<p><strong>Why this works at the exec level:</strong></p>
<ul>
<li>Numbers up top — they read 5 lines and know the bet.</li>
<li>Six months of work in six bullet headers — not a Gantt chart.</li>
<li>An ask (money + headcount + a decision date) — exec brains run on "what do you need from me by when."</li>
<li>Named risks with mitigations — proves you've thought about it.</li>
<li>Tied to business metrics, not QA vanity metrics.</li>
</ul>
<p><strong>How to use it:</strong> walk in with this on one page printed, walk out with a yes/no/maybe in 15 minutes. Don't ship a 12-slide deck.</p>`
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
