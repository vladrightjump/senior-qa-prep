import type { Category } from "../types";
import { PART_1_CATEGORIES } from "./categories-1";
import { PART_2_CATEGORIES } from "./categories-2";
import { PART_3_CATEGORIES } from "./categories-3";
import { PART_4_CATEGORIES } from "./categories-4";
import { GROWTH_CATEGORIES } from "./categories-growth";

const scenarios: Category = {
  id: "scenarios",
  label: "Real scenarios",
  desc: "Production-grade situations a senior QA must handle without flinching",
  questions: [
    {
      id: "4f1544f2-c26c-45b3-abc4-3da3da43efbd",
      q: "P0 bug found 1 hour before release demo. What do you do?",
      diff: "hard",
      tags: ["incident"],
      answer: `<ol>
<li><strong>Reproduce + capture</strong> — clear steps, screenshot, trace.</li>
<li><strong>Assess impact</strong> — how many users? Workaround? Data loss?</li>
<li><strong>Notify lead and PM immediately</strong> — don't wait for demo.</li>
<li><strong>Recommend, don't decide</strong> — present options: delay/hotfix/ship with workaround. Leadership picks.</li>
<li><strong>If demo proceeds</strong> — proactively call out to client. Surprises kill trust; transparency builds it.</li>
<li><strong>Postmortem after</strong> — how did it slip past automation?</li>
</ol>
<p>Senior signal: calm, structured, escalates appropriately, owns analysis but not decision.</p>`
    },
    {
      id: "d6435e7e-aa66-46d0-bce1-551ee894e693",
      q: "Nightly run: 60 flakes, 30 real failures. Triage in 30 min.",
      diff: "hard",
      tags: ["incident", "flakiness"],
      answer: `<ol>
<li><strong>Re-run failed only</strong> — separates intermittent from consistent.</li>
<li><strong>Group by error type</strong> — same stack trace = same root cause. 30 might be 3 bugs.</li>
<li><strong>Bisect real failures</strong> — last green commit. <code>git bisect</code> if needed.</li>
<li><strong>Tag flakes</strong> — JIRA tickets, exclude from PR runs, keep in nightly.</li>
<li><strong>Post summary</strong> — Slack within 1h. "30 real = 3 bugs (X, Y, Z), tickets filed. 60 flakes quarantined."</li>
</ol>
<p>Instinct to "fix the suite first" is wrong. Real failures are user-impacting bugs — they trump suite quality.</p>`
    },
    {
      id: "0d272df3-f209-42c0-95f9-81db15bb8dcc",
      q: "Join a team with no automation. 90-day plan.",
      diff: "hard",
      tags: ["strategy"],
      answer: `<p><strong>Days 1–14: discover</strong></p>
<ul>
<li>Shadow team. Read every JIRA from last quarter — what bugs shipped?</li>
<li>Map critical user journeys. Talk to support — what do users complain about?</li>
<li>Pick stack. Default: Playwright + TypeScript.</li>
</ul>
<p><strong>Days 15–45: smoke + foundations</strong></p>
<ul>
<li>10–20 critical-path E2E tests covering top journeys.</li>
<li>CI integration. PR gate.</li>
<li>POM from day 1. Don't accumulate spaghetti.</li>
</ul>
<p><strong>Days 46–90: regression + scale</strong></p>
<ul>
<li>Expand to 100+ tests. API tests in parallel.</li>
<li>Sharding, parallel workers in CI.</li>
<li>Flakiness dashboard. Quarantine ruthlessly.</li>
<li>Document. Train team.</li>
</ul>
<p><strong>What you don't do:</strong> automate everything in month 1. Depth comes after foundation.</p>`
    },
    {
      id: "7d20d432-520d-48d9-af02-34029564d160",
      q: "Pressure to skip regression for a deadline. Your response?",
      diff: "hard",
      tags: ["soft-skills"],
      answer: `<p>Don't say no. Say "here's the trade-off, you decide":</p>
<blockquote style="border-left: 3px solid var(--accent); padding: 0 12px; margin: 8px 0;">
"I can ship without full regression. Last 3 releases that skipped it had 2 hotfixes within 48h. Here's a 90-min minimum smoke pack covering payment, login, order flow — catches high-impact stuff. Remaining regression deferred to nightly post-release. Want me to proceed?"
</blockquote>
<p>Three things: quantifies risk, proposes concrete compromise, transfers decision to right person. PM owns "ship now"; you own "here's what that costs". Document.</p>`
    },
    {
      id: "61ac80d2-a32e-4325-9628-0973dee32e04",
      q: "Coverage 85% but bugs keep slipping to prod. What's missing?",
      diff: "hard",
      tags: ["strategy", "metrics"],
      answer: `<ul>
<li><strong>Shallow assertions</strong> — tests check "doesn't crash" not "produces correct output". Run mutation testing.</li>
<li><strong>Missing user paths</strong> — coverage hits code, not the way users hit it.</li>
<li><strong>No error-path coverage</strong> — happy paths dominate.</li>
<li><strong>No integration coverage</strong> — units pass in isolation, fail composed.</li>
<li><strong>No exploratory pre-release</strong> — automation finds known bugs. Exploratory finds unknown.</li>
</ul>
<p>Coverage is a vanity metric without escape rate counterpart. High escape rate = weak suite, regardless of coverage.</p>`
    },
    {
      id: "83f31073-5a47-42d1-8d2e-d294ca4f5b71",
      q: "Regression broke 47 tests overnight. Triage.",
      diff: "hard",
      tags: ["incident", "debugging"],
      answer: `<ol>
<li><strong>Group by stack trace</strong> — 47 with same trace = 1 root cause. Don't chase 47 fixes.</li>
<li><strong>Find introducing PR</strong> — git bisect or last green commit.</li>
<li><strong>Decide: revert vs forward fix</strong>. Critical PR? Forward fix. Otherwise revert.</li>
<li><strong>Add regression test</strong> — at right level (unit &gt; integration &gt; E2E).</li>
<li><strong>Communicate</strong> — "Caused by commit X, reverted, root cause Y, regression test in PR Z."</li>
</ol>
<p>Anti-pattern: 47 separate tickets. Right answer: 1 root-cause fix + 1 regression test.</p>`
    },
    {
      id: "67de99cb-4c2f-40ae-b032-6af399eca50c",
      q: "Test a feature behind a 10% feature flag.",
      diff: "hard",
      tags: ["strategy"],
      answer: `<ul>
<li><strong>Force-enable in test env</strong> — header (<code>X-Feature-Flag-Override</code>) or admin API. Don't depend on rollout sampling.</li>
<li><strong>Test both states</strong> — flag ON verifies new behavior; OFF verifies legacy.</li>
<li><strong>Test the toggle</strong> — flipping mid-session shouldn't break or leak data.</li>
<li><strong>Test rollback</strong> — flag killed at peak traffic — tests pass against OFF state.</li>
<li><strong>Document the flag</strong> — name, owner, planned removal date.</li>
</ul>
<p>Stale flags accumulate and become technical debt.</p>`
    },
    {
      id: "d17f88d3-1795-45a6-917e-a1b65981af88",
      q: "Justify ROI of automation to a CFO who only sees cost.",
      diff: "hard",
      tags: ["soft-skills", "metrics"],
      answer: `<ul>
<li><strong>Engineer hours saved per release</strong> × rate. "8 hours regression × 24 releases × €60/hr = €11,520/year."</li>
<li><strong>Production incidents prevented</strong> × cost. "3 rollbacks × €15K each. After automation, zero."</li>
<li><strong>Time-to-feedback</strong> × dev wait cost. "Devs waited 2 days for QA. Now 2 hours."</li>
<li><strong>Risk reduction as insurance</strong> — "we don't pay fire insurance because we expect a fire."</li>
</ul>
<p>Avoid: "test coverage went up". CFO doesn't care. They care about cost, risk, competitive speed.</p>`
    },
    {
      id: "51a1015e-7ee6-4d2c-b696-bc9d7ac1077c",
      q: "Test a feature that depends on a third-party payment provider you can't call.",
      diff: "hard",
      tags: ["strategy"],
      answer: `<p>Compare 4 strategies and their trade-offs:</p>
<ul>
<li><strong>Use the provider's test mode</strong> (Stripe test keys) — most realistic, slowest, requires keys. Best for pre-release.</li>
<li><strong>Network mocks</strong> — fast, drift over time. Use for negative cases.</li>
<li><strong>Contract tests</strong> (Pact) — medium speed, reliable, requires provider participation.</li>
<li><strong>Local mock server</strong> (WireMock, MSW) — full control, maintenance burden. Use when above options fail.</li>
</ul>
<p>Senior approach: layer them. Test mode for the critical path E2E. Mocks for error states. Contract tests if the provider publishes contracts. No single tool covers all needs.</p>`
    },
    {
      id: "d1c32db6-5873-4593-b689-31281353a6a9",
      q: "How do you handle a security vulnerability disclosed by an external researcher?",
      diff: "hard",
      tags: ["incident", "security"],
      answer: `<ol>
<li><strong>Confirm and assess</strong> — reproduce, classify severity (CVSS), determine blast radius.</li>
<li><strong>Notify security team and leadership</strong> — within hours, not days. Set communication cadence.</li>
<li><strong>Develop fix in private</strong> — separate branch, limited reviewers, no public commits.</li>
<li><strong>Write security regression tests</strong> — automated, must run on every release. The bug must not return.</li>
<li><strong>Coordinated disclosure</strong> — agree timeline with the researcher (typical: 90 days).</li>
<li><strong>Postmortem</strong> — how did it ship? What's the systemic fix? Often missing security review or threat model gap.</li>
</ol>
<p>QA's role: write the regression test, verify the fix doesn't break anything, validate that the same class of bug doesn't exist elsewhere.</p>`
    },
  ]
};

const behavioral: Category = {
  id: "behavioral",
  label: "Behavioral",
  desc: "STAR-format soft-skill questions — be specific, quantify when possible",
  questions: [
    {
      id: "b946b271-9de9-4f60-b599-49aadd9abc96",
      q: "Tell me about the most critical bug you ever caught.",
      diff: "mid",
      tags: ["star"],
      answer: `<p>Use STAR:</p>
<ul>
<li><strong>Situation</strong> — project, role, timing.</li>
<li><strong>Task</strong> — what you owned.</li>
<li><strong>Action</strong> — your specific technique. Edge case thinking? Log analysis? Cross-feature integration?</li>
<li><strong>Result</strong> — quantified impact. "Prevented €X loss / blocked release / users protected."</li>
</ul>
<p>Avoid heroic narratives. Be specific about your contribution, humble about the team.</p>`
    },
    {
      id: "17adca23-658e-4ccf-9a77-04bb68f6298b",
      q: "Time you pushed back on a deadline.",
      diff: "mid",
      tags: ["star", "soft-skills"],
      answer: `<p>Show same skill you'd use in their job: communicating risk without being obstructive.</p>
<ul>
<li>Quantified the risk in concrete terms.</li>
<li>Proposed alternatives — scope cut, defer items, post-release fixes.</li>
<li>Stayed collaborative — "here's what we'd give up", not "no".</li>
<li>Owned outcome regardless of decision.</li>
</ul>
<p>Bad: "I told them no and they listened." Good: "I laid out trade-off, they shipped anyway, hit the bug, listened next time."</p>`
    },
    {
      id: "c74c2388-ed51-4c4c-8eea-57afff0c58b1",
      q: "How do you stay current? 3 things you learned in last 6 months.",
      diff: "easy",
      tags: ["soft-skills"],
      answer: `<p>Be specific. Vagueness fails this question. Examples:</p>
<ul>
<li>"Migrated suite from <code>page.$()</code> to <code>locator()</code> — reduced flakes 40%, wrote up internally."</li>
<li>"Experimenting with mutation testing using Stryker on a critical service — caught 3 weak assertions."</li>
<li>"Read Playwright 1.50 release notes, started using <code>expect.toHaveScreenshot</code> for visual regression where it makes sense."</li>
</ul>
<p>Tie at least one to current work. Reading without applying = yellow flag.</p>`
    },
    {
      id: "d9f269b6-97ef-4563-985f-a8e98aaaefd7",
      q: "Bug that escaped to production. What did you change?",
      diff: "hard",
      tags: ["star", "soft-skills"],
      answer: `<p>Own without overdoing apology. Interviewer wants to see learning, not shame.</p>
<ul>
<li><strong>Root cause</strong> — specific, technical.</li>
<li><strong>Immediate response</strong> — rollback, hotfix, comms.</li>
<li><strong>Systematic change</strong> — not "I'll be more careful". A new test, process change, coverage gap closed.</li>
</ul>
<p>Strong example: "Empty cart edge case shipped. Unit test had <code>expect(total).toBeGreaterThan(0)</code> instead of equality. Added boundary cases to cart unit test template, now required in PR descriptions for cart changes."</p>`
    },
    {
      id: "f6ab8fa7-9e62-45e3-b569-355a1eeeb60d",
      q: "Time you introduced a new tool against initial team resistance.",
      diff: "mid",
      tags: ["star", "soft-skills"],
      answer: `<ol>
<li><strong>Pain point first</strong> — team felt the problem. You named it.</li>
<li><strong>Small POC</strong> — 2 days on one feature, not a 6-month migration.</li>
<li><strong>Skeptic involved</strong> — get them to break it. They become advocates.</li>
<li><strong>Measure</strong> — before/after numbers.</li>
<li><strong>Public win</strong> — sprint demo or #engineering.</li>
</ol>
<p>Don't introduce 5 tools at once.</p>`
    },
    {
      id: "6ef9d0f8-b970-4219-bba3-567c7e950c08",
      q: "Overruled on a technical call you disagreed with. What did you do?",
      diff: "hard",
      tags: ["soft-skills"],
      answer: `<p>This filters for maturity. Show:</p>
<ul>
<li>Raised concern with evidence, not feeling.</li>
<li>Accepted outcome professionally — disagree and commit.</li>
<li>Followed up if concern materialized — without "I told you so".</li>
<li>Documented rationale either way.</li>
</ul>
<p>Bad: "I was right, they were wrong." Good: "Disagreed, made my case, lost. 3 months later issue surfaced. Discussed as team, updated practice. Learned to make case more clearly with data."</p>`
    },
    {
      id: "9f8b77c1-d3b1-4ec9-9ac2-6773e5fbd1b8",
      q: "How do you handle being wrong in a public discussion?",
      diff: "mid",
      tags: ["soft-skills"],
      answer: `<p>Three rules:</p>
<ol>
<li><strong>Acknowledge cleanly</strong> — "You're right, I was wrong about X." No qualifications, no defending.</li>
<li><strong>Update your position publicly</strong> — same channel, same audience.</li>
<li><strong>Take the lesson, leave the embarrassment</strong> — don't dwell. Don't apologize 3 times.</li>
</ol>
<p>The senior signal: you can change your mind without losing credibility. People who can't admit being wrong don't get trusted with hard problems.</p>`
    },
    {
      id: "61cefba6-355c-4d86-92d6-97c36adbc9c8",
      q: "How do you mentor junior QA engineers?",
      diff: "mid",
      tags: ["soft-skills", "mentorship"],
      answer: `<p>Concrete patterns that work:</p>
<ul>
<li><strong>Pair on real tickets</strong> — they drive, you ask questions. They learn faster than from documentation.</li>
<li><strong>Code review with explanation</strong> — don't just say "use locator.filter()". Explain why and link to the doc.</li>
<li><strong>Give them ownership of small areas</strong> — flakiness dashboard, one feature's tests. Real responsibility, low blast radius.</li>
<li><strong>Weekly 1:1s</strong> — career goals, blockers, "what would help you next week?"</li>
<li><strong>Public credit</strong> — "Maria found this regression" in standup, not "we found".</li>
</ul>
<p>Mentorship is part of senior responsibility. If asked "what would you bring to the team?" and you don't mention mentorship, that's a gap.</p>`
    },
    {
      id: "1c8a42ee-9fc0-4524-ad1f-5e129a8a670c",
      q: "What's your approach to learning a new codebase quickly?",
      diff: "mid",
      tags: ["soft-skills"],
      answer: `<ol>
<li><strong>Start with the build/CI</strong> — how is it shaped, deployed, tested? Reveals architecture.</li>
<li><strong>Read recent PRs</strong> — what's the team currently working on? What patterns do they follow?</li>
<li><strong>Run it locally</strong> — break things on purpose. Observation beats reading.</li>
<li><strong>Map the test suite</strong> — what's covered? What's flaky? Coverage gaps reveal risk areas.</li>
<li><strong>Ask "why" questions in context</strong> — "Why this pattern over X?" beats abstract questions.</li>
<li><strong>Document as you go</strong> — your notes become the next person's onboarding doc.</li>
</ol>
<p>First 2 weeks: pure learning. Resist the urge to refactor.</p>`
    },
  ]
};

/* ============================================================================
   ASSEMBLE — exported flat array for the app
   ========================================================================= */

export const CATEGORIES: Category[] = [
  ...PART_1_CATEGORIES,
  ...PART_2_CATEGORIES,
  ...PART_3_CATEGORIES,
  scenarios,
  behavioral,
  ...PART_4_CATEGORIES,
  ...GROWTH_CATEGORIES,
];
