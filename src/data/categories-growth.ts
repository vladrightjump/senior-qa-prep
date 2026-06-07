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
      answer: `<p>Every requirement maps to one or more tests; every test traces back to a requirement (or an explicit risk). The matrix is the link between "what the product must do" and "what we've actually verified".</p>
<p>The chain is: <strong>requirement → acceptance criteria → test case → automation script → defect</strong>. Each link is queryable in both directions.</p>
<h4>A worked matrix — what coverage gaps actually look like</h4>
<p>Feature: <em>password reset for a B2C app</em>. Five requirements, mapped against the existing test suite:</p>
<table>
<tr><th>Req ID</th><th>Requirement</th><th>Test cases</th><th>Automation</th><th>Last defect</th><th>Coverage</th></tr>
<tr><td>REQ-101</td><td>User can request reset via email</td><td>TC-201, TC-202</td><td>auth.spec.ts:34</td><td>DEF-512 (closed)</td><td>✓ full</td></tr>
<tr><td>REQ-102</td><td>Reset link expires after 30 min</td><td>TC-203</td><td>auth.spec.ts:55</td><td>—</td><td>✓ full</td></tr>
<tr><td>REQ-103</td><td>Reused token returns clear error</td><td><strong>—</strong></td><td><strong>—</strong></td><td><strong>DEF-617 (open)</strong></td><td><strong>✗ gap</strong></td></tr>
<tr><td>REQ-104</td><td>Rate limit: 3 requests / hour / user</td><td>TC-204</td><td>(manual)</td><td>—</td><td>△ manual only</td></tr>
<tr><td>REQ-105</td><td>Email template renders in EN/DE/FR/RO</td><td>TC-205</td><td>email.spec.ts:12 (EN only)</td><td>—</td><td>△ partial — DE/FR/RO untested</td></tr>
</table>
<p>The matrix surfaces three things you cannot see by reading the test suite or the spec alone:</p>
<ol>
<li><strong>REQ-103 has an open defect but no test.</strong> The bug was found in prod and never had a test added — exactly the regression risk traceability exists to prevent. Action: write TC-206, add an automated assertion, link the defect resolution to the new test.</li>
<li><strong>REQ-104 is automated as "manual" — meaning skipped in CI.</strong> A rate-limit regression ships silently. Action: convert to a programmatic test against the staging environment.</li>
<li><strong>REQ-105 is partially covered.</strong> EN tested, three locales untested. Action: parametrise the email test by locale.</li>
</ol>
<h4>Why it matters</h4>
<ul>
<li>Coverage gaps surface immediately — requirements without tests are visible.</li>
<li>Change impact is scoped — when REQ-42 changes, you know which tests to update.</li>
<li>Audits / regulated industries demand it (medical, automotive, finance). ISO 26262 / IEC 62304 require it explicitly.</li>
<li>Defect triage is faster — bug → failing test → original requirement.</li>
</ul>
<p><strong>Tools</strong>: TestRail, Xray, Zephyr, qTest generate the matrix automatically when test cases reference requirement IDs (most commonly via JIRA's <code>Issue Link: tests/tested by</code>). For lighter setups, a single CSV maintained in the repo works — the matrix is the discipline, not the tool.</p>
<p><strong>Senior signal</strong>: when an interviewer asks about traceability, show a small matrix with at least one ✗ row and one △ row. Anyone can say "every requirement should have a test"; only someone who's actually maintained one can show how the matrix surfaces the gap and what the next action is.</p>`
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
      id: "b3f1c001-2026-4000-8000-000000000101",
      q: "Define measurable exit criteria for a payment feature release. What metrics, what thresholds, who signs off?",
      diff: "mid",
      tags: ["exit-criteria", "release"],
      answer: `<p>"Exit criteria" without numbers is decoration. Senior QA picks measurable thresholds before the release, gets sign-off on the numbers (not the wording), and lets the gate make the call.</p>
<h4>Concrete exit criteria for a payment feature</h4>
<table>
<tr><th>Criterion</th><th>Metric</th><th>Threshold</th><th>Source of truth</th></tr>
<tr><td>Functional coverage</td><td>% of acceptance criteria with ≥ 1 automated test</td><td>100% of P0/P1 ACs</td><td>traceability report</td></tr>
<tr><td>Defect escape</td><td>open defects in the affected paths</td><td>0 P0, 0 P1, ≤ 2 P2 with documented workaround</td><td>JIRA / Linear filter</td></tr>
<tr><td>Stability</td><td>flakiness on the new tests (10-run rolling)</td><td>≤ 1% individual, ≤ 3% suite</td><td>CI dashboard</td></tr>
<tr><td>Performance</td><td>p95 of <code>POST /charges</code> at 100 RPS</td><td>≤ 800 ms (SLO 1 s)</td><td>k6 nightly</td></tr>
<tr><td>Resilience</td><td>system recovers from provider 5xx within retry budget</td><td>0 stuck charges in chaos run</td><td>chaos-engineering job</td></tr>
<tr><td>Security</td><td>SAST + dependency scan</td><td>0 high/critical, all moderate triaged with date</td><td>Snyk / Semgrep report</td></tr>
<tr><td>Observability</td><td>dashboards + alerts deployed for new endpoints</td><td>all dashboards reviewed with on-call</td><td>Grafana folder + PagerDuty</td></tr>
<tr><td>Rollback</td><td>feature flag verified to disable new path</td><td>flag-off test passes in staging</td><td>release rehearsal report</td></tr>
</table>
<h4>Who signs off — RACI</h4>
<ul>
<li><strong>Responsible</strong>: feature lead engineer + senior QA — they show the dashboard meets every threshold.</li>
<li><strong>Accountable</strong>: engineering manager — owns the go/no-go decision.</li>
<li><strong>Consulted</strong>: SRE (resilience + observability rows), security (SAST row), payments product manager (defect-class triage).</li>
<li><strong>Informed</strong>: customer success, finance reconciliation, support on-call.</li>
</ul>
<h4>The senior moves</h4>
<ul>
<li><strong>Negotiate the numbers BEFORE coding starts</strong>, not the night before release. Once you're at sign-off the leverage to push back has evaporated.</li>
<li><strong>Distinguish blockers from "ship with risk"</strong>. P2 with workaround documented + customer success briefed = ship. P1 with no workaround = stop, regardless of schedule pressure.</li>
<li><strong>Keep a "missed exit criterion" ledger</strong> per release. After 3 releases you can show "we skipped the chaos check on the last 2 releases and both had incidents" — that's how you move from negotiated thresholds to enforced thresholds.</li>
</ul>
<p><strong>Anti-pattern</strong>: "QA sign-off pending" as a tracker field with no numeric meaning. If the PM can ship by overriding the field without changing anyone's metric, the gate is theatre.</p>`
    },
    {
      id: "b3f1c002-2026-4000-8000-000000000102",
      q: "You inherit 5,000 test cases. Only 1,200 ran last cycle. How do you clean this up without breaking trust?",
      diff: "hard",
      tags: ["test-portfolio", "governance", "scenario"],
      answer: `<p>This is a real situation at almost every shop over 3 years old. The temptation is to nuke the unused 3,800; the senior move is to <em>classify before deleting</em> and use the cleanup as a trust-builder, not a fight.</p>
<h4>30-day classification — no deletions yet</h4>
<ol>
<li><strong>Tag every case by last-run + outcome.</strong> Pull from your test management tool (TestRail / Xray / Zephyr) or the CI log. Build a CSV: <code>id, area, owner, last_run, last_result, flaky_count_30d</code>.</li>
<li><strong>Bucket them.</strong>
<ul>
<li><strong>Active (≥ 1 run in last 30d, passing)</strong>: keep, no action.</li>
<li><strong>Flaky (run but failing ≥ 10% non-deterministically)</strong>: quarantine pile.</li>
<li><strong>Stale (no run in 90+ days)</strong>: candidates — needs an owner to vouch.</li>
<li><strong>Orphan (no clear owner, ambiguous area)</strong>: detective work pile.</li>
<li><strong>Duplicate (text-similar to another case in the same area)</strong>: merge candidate.</li>
</ul>
</li>
<li><strong>Publish the numbers</strong> to the team. "We have 5,000 cases. 1,200 ran. 2,300 are stale &gt; 90 days. 400 are duplicates. 350 are flaky. 750 are orphans." That conversation alone moves people.</li>
</ol>
<h4>60-day cleanup — with explicit ownership</h4>
<ul>
<li><strong>Stale</strong>: send a per-team report listing their stale cases. Default = archive in 14 days if no objection. Anyone can reclaim with a "yes still relevant, last needed for X". Archive ≠ delete; the file moves to a <code>__archive/</code> folder with last-known-good metadata. Recoverable.</li>
<li><strong>Duplicates</strong>: merge to the better-written one; redirect the IDs in the traceability matrix.</li>
<li><strong>Flaky</strong>: triage with the test author. Fix or quarantine on a clock. Quarantine + ticket + 30-day SLA: fix or delete.</li>
<li><strong>Orphans</strong>: ask the team. After two reminders with no claim, archive — owner-of-last-resort is the QA lead.</li>
</ul>
<h4>The trust mechanics</h4>
<ul>
<li><strong>Nothing is permanently deleted.</strong> Archive is reversible. People are far more willing to let a test go when "archived" is the wording.</li>
<li><strong>Per-team accountability, not blame.</strong> The report shows stale counts per team without naming individuals. The conversation is "your area has 400 stale cases" not "you wrote bad tests".</li>
<li><strong>Show the cost, not the bloat.</strong> "These 350 flakies cost the org 47 hours of dev attention last month rerunning CI." Cost framing changes minds; bloat-framing makes people defensive.</li>
</ul>
<h4>90-day target state</h4>
<ul>
<li>Active suite: ~1,500–1,800 cases (the 1,200 + recovered + new replacements).</li>
<li>Archived: ~3,000 cases, recoverable, indexed.</li>
<li>Living governance: monthly stale-report, per-team owners, flake SLA in place.</li>
</ul>
<p><strong>Anti-pattern</strong>: a "test cleanup sprint" announced top-down with mass deletion. You lose institutional knowledge embedded in old tests, and you lose trust because half the team finds out their case is gone after a regression slips. Slow, transparent, reversible beats fast every time.</p>`
    },
    {
      id: "b3f1c003-2026-4000-8000-000000000103",
      q: "Severity vs priority: define both, give a worked rubric, defend a P1 call against a PM who wants it downgraded.",
      diff: "mid",
      tags: ["triage", "defect-management"],
      answer: `<p>These two get conflated in every bug tracker in the industry. They are not the same thing — confusing them creates fights between QA and product.</p>
<table>
<tr><th></th><th>Severity</th><th>Priority</th></tr>
<tr><td><strong>Asks</strong></td><td>"How bad is the technical impact when this fires?"</td><td>"How urgently must we fix this relative to everything else?"</td></tr>
<tr><td><strong>Owner</strong></td><td>QA / engineering (objective)</td><td>Product / business (contextual)</td></tr>
<tr><td><strong>Inputs</strong></td><td>data loss, security, blast radius, workaround</td><td>customer impact, revenue, contractual SLA, strategic importance</td></tr>
<tr><td><strong>Stable across releases?</strong></td><td>Mostly yes</td><td>No — depends on what else is in flight</td></tr>
</table>
<h4>Severity rubric</h4>
<ul>
<li><strong>S1 — Critical</strong>: data loss / corruption, security breach, system down for &gt; 50% of users, no workaround.</li>
<li><strong>S2 — Major</strong>: core function broken for a sub-segment, workaround exists but degrades UX significantly.</li>
<li><strong>S3 — Moderate</strong>: feature works but with wrong output / unclear messaging, workaround is reasonable.</li>
<li><strong>S4 — Minor</strong>: cosmetic, edge case, no functional impact.</li>
</ul>
<h4>Priority rubric (independent axis)</h4>
<ul>
<li><strong>P0 — Now</strong>: fix immediately, hotfix path, may pull a release.</li>
<li><strong>P1 — Next release</strong>: in scope for the upcoming release; blocks release if unresolved.</li>
<li><strong>P2 — Soon</strong>: scheduled within 2 sprints.</li>
<li><strong>P3 — Backlog</strong>: triaged in, no commitment.</li>
</ul>
<h4>The conversation when a PM wants P1 → P2</h4>
<p>Worked example: a payment confirmation email is missing the order total. Severity S2 (functional output is wrong; workaround is "user opens the dashboard"). You labelled it P1. PM wants P2 because "no one complained yet".</p>
<p>The senior response uses data, not opinion:</p>
<ol>
<li><strong>"Who is affected?"</strong> — 100% of orders, every email. Not a sampled segment.</li>
<li><strong>"What is the user's recovery cost?"</strong> — they log in to find the total. Friction, support tickets, refund-disputes when they misremember the amount.</li>
<li><strong>"What's the blast radius if it stays at P2?"</strong> — 14 days × ~500 orders/day × ~3% support-ticket conversion = ~210 tickets. Engineering's cost vs. the alternative cost of fixing now.</li>
<li><strong>"What's the financial / regulatory exposure?"</strong> — EU consumer protection requires accurate order confirmation. Repeated misses become a complaint to the consumer body.</li>
<li><strong>"What's our SLA contract with key customers?"</strong> — enterprise contracts mention "accurate transactional emails" as a deliverable.</li>
</ol>
<p>If the PM still wants P2 after the conversation, that's their call — log the rationale in the ticket. If a customer complaint or finance-reconciliation issue then materialises, the log is your professional record. The fight stays in the data, not in the room.</p>
<p><strong>Anti-pattern</strong>: a single "Priority" field that mashes severity and priority into one number. Devs end up arguing "this is a P1 because it's a P1" and the org loses the ability to reason about what's broken vs. what's urgent.</p>
<p><strong>Senior signal</strong>: when you set severity, you also write a one-line <em>impact statement</em> ("100% of paying customers, every email, missing financial info"). That statement is what the PM uses to set priority. You don't get to set the priority — but you absolutely set the data the priority is reasoned over.</p>`
    },
    {
      id: "b3f1c004-2026-4000-8000-000000000104",
      q: "Release readiness checklist — 10 things that must be true before you sign off on a customer-facing release.",
      diff: "mid",
      tags: ["release", "checklist", "governance"],
      answer: `<p>A checklist is not bureaucracy; it's a forcing function for the things that get forgotten under deadline pressure. The senior version is short, owner-attributed, and dashboards-not-claims.</p>
<table>
<tr><th>#</th><th>Item</th><th>Evidence (link)</th><th>Owner</th></tr>
<tr><td>1</td><td>All P0/P1 ACs have passing automated tests on main</td><td>traceability report — current ✓ / ✗ per AC</td><td>Feature lead + QA</td></tr>
<tr><td>2</td><td>0 open P0 / P1 defects in the affected paths</td><td>JIRA filter URL</td><td>QA</td></tr>
<tr><td>3</td><td>Performance budget met on staging at expected peak</td><td>k6 / Lighthouse dashboard snapshot</td><td>Feature lead</td></tr>
<tr><td>4</td><td>Feature flag exists and disabling it removes the new code path</td><td>flag-off test trace</td><td>Engineer + QA</td></tr>
<tr><td>5</td><td>Rollback path tested in staging (not theoretical)</td><td>release rehearsal log</td><td>Release manager</td></tr>
<tr><td>6</td><td>Observability: new endpoints have logs, metrics, traces, dashboards</td><td>Grafana folder link</td><td>SRE + Feature lead</td></tr>
<tr><td>7</td><td>Alerts wired to on-call with documented runbook</td><td>PagerDuty service + runbook URL</td><td>SRE</td></tr>
<tr><td>8</td><td>Security scan green; new dependencies have no high/critical CVEs</td><td>Snyk report URL</td><td>Security champion</td></tr>
<tr><td>9</td><td>Customer-facing communication ready (changelog, support article, in-app notice)</td><td>links to drafts</td><td>Product / customer success</td></tr>
<tr><td>10</td><td>Go/no-go meeting held with all owners present</td><td>recorded decision in ticket</td><td>Engineering manager</td></tr>
</table>
<h4>How to actually use it</h4>
<ul>
<li><strong>The links are mandatory.</strong> "Done" without a link is "claimed". 30% of the items will fail this rule on the first release; that's the value.</li>
<li><strong>Each row has ONE owner.</strong> No co-ownership — somebody has the pen. The owner is the person who pastes the evidence link.</li>
<li><strong>Items 4–8 are the ones that get skipped under pressure.</strong> When the PM says "we'll do those after launch", that's the moment to refer to the prior incident the same shortcut caused.</li>
<li><strong>Item 5 (rollback rehearsed)</strong> is non-negotiable. If you cannot demonstrate the rollback in staging, you do not ship to production. Every team that ignored this has at least one war story.</li>
</ul>
<h4>2026 additions worth considering</h4>
<ul>
<li><strong>AI-generated content fence</strong>: if the feature includes LLM output, have item 11 = "evaluation suite + guardrail prompts reviewed by domain expert".</li>
<li><strong>Accessibility (EU EAA, in force June 2025)</strong>: for B2C, "axe-core CI run passes with 0 violations on changed views" is a real legal exposure if skipped.</li>
<li><strong>Data residency</strong> for EU/regulated customers: "no new endpoint stores or transmits PII outside agreed regions".</li>
</ul>
<p><strong>Anti-pattern</strong>: a 47-item checklist that nobody reads. The wishlist + ceremony version of release governance is what gives release governance a bad name. 10 items, evidence-backed, owner-attributed beats 47 unchecked boxes every release.</p>
<p><strong>Senior signal</strong>: you propose the checklist <em>after</em> a near-miss, not before. You point at the specific item that would have caught it. Adoption follows naturally.</p>`
    },
    {
      id: "b3f1c005-2026-4000-8000-000000000105",
      q: "Design a test-metrics dashboard a senior QA reviews daily. 5 widgets, what they show, what triggers action.",
      diff: "hard",
      tags: ["metrics", "dashboards", "governance"],
      diagram: `flowchart TB
  subgraph DAILY["Senior QA daily dashboard"]
    W1["1. Defect escape rate<br/>(weekly trend)"]
    W2["2. Flakiness top-10<br/>(by test, by week)"]
    W3["3. CI lead time + DORA<br/>(p50, p95)"]
    W4["4. Coverage on changed code<br/>(diff coverage %)"]
    W5["5. Open P0/P1 + age<br/>(per area)"]
  end
  W1 -->|trend up 2 weeks| ACT1["root-cause review"]
  W2 -->|new entry top 10| ACT2["quarantine + ticket"]
  W3 -->|p95 up 25%| ACT3["pipeline owner sync"]
  W4 -->|< 70% on PRs| ACT4["block release branch"]
  W5 -->|age > 7d| ACT5["escalation"]`,
      answer: `<p>A dashboard is not a wall of charts; it's a daily decision tool. Five widgets, each with a number, a trend, and a documented action when the trend goes wrong.</p>
<h4>Widget 1 — Defect escape rate (the north star)</h4>
<ul>
<li><strong>What it shows</strong>: (defects found in production over the last N days) ÷ (defects found total over the same window). Weekly bucket, 8-week trend line.</li>
<li><strong>Healthy</strong>: ≤ 5%, stable or trending down.</li>
<li><strong>Action when it rises 2 weeks running</strong>: convene the 3 highest-cost incidents, ask "what test layer should have caught this?", report the answer at the next retro.</li>
</ul>
<h4>Widget 2 — Flakiness top-10</h4>
<ul>
<li><strong>What it shows</strong>: per-test flake rate over the last 30 days. Top 10 by rate, with their owner and the open-ticket link.</li>
<li><strong>Healthy</strong>: individual ≤ 1%, no test in the list owns &gt; 3% for two weeks running.</li>
<li><strong>Action when a NEW test enters top 10</strong>: quarantine it the same day, open a ticket with a 14-day fix-or-delete SLA. Keep the test in the list with its quarantine status until resolved — visibility is the pressure.</li>
</ul>
<h4>Widget 3 — CI lead time + DORA</h4>
<ul>
<li><strong>What it shows</strong>: PR-to-merge lead time (p50, p95). Daily deployment frequency. Change failure rate. MTTR for production incidents. Rolling 30 days.</li>
<li><strong>Healthy</strong> (per DORA's "elite" band): lead time &lt; 1 day, deploy daily, change fail rate &lt; 15%, MTTR &lt; 1 hour.</li>
<li><strong>Action when p95 lead time increases 25%</strong>: sync with the pipeline owner. Almost always a slow test, a flake-driven retry, or a stage that's been added without budget review.</li>
</ul>
<h4>Widget 4 — Coverage on changed code (not absolute coverage)</h4>
<ul>
<li><strong>What it shows</strong>: per-PR, the % of changed lines covered by automated tests. NOT total project coverage. Use diff-coverage (codecov, coveralls), not overall %.</li>
<li><strong>Healthy</strong>: ≥ 80% per PR on app code, no PR &lt; 60%.</li>
<li><strong>Action when a release candidate has &lt; 70% on changed code</strong>: block the release branch; require either more tests or an opt-out with named risk owner.</li>
<li><strong>Why diff coverage matters</strong>: a 90% overall coverage number is meaningless if every new PR adds untested code. Diff coverage catches the rot.</li>
</ul>
<h4>Widget 5 — Open P0/P1 + age</h4>
<ul>
<li><strong>What it shows</strong>: per-area, count of open P0/P1 defects and the age of the oldest one.</li>
<li><strong>Healthy</strong>: 0 P0; P1 age &lt; 7 days.</li>
<li><strong>Action when a P1 ages past 7 days</strong>: escalate to engineering manager with the age, the prior triage discussion, and a proposed resolution path (fix this sprint / re-categorise / accept and document).</li>
</ul>
<h4>What the dashboard is NOT</h4>
<ul>
<li>Not a wall of vanity metrics. No "total tests written". No "lines of test code". No "% coverage" without diff scoping.</li>
<li>Not for executives. This is the QA lead's tool. The exec dashboard is a different layer (1 widget — escape rate trend + DORA composite).</li>
<li>Not consumed weekly. <em>Daily.</em> 5 minutes with coffee. If it takes longer, simplify.</li>
</ul>
<h4>Tooling</h4>
<ul>
<li>Metabase / Grafana over the JIRA + CI + codecov APIs. Each widget = one panel, one SQL or PromQL query.</li>
<li>Alert routing: each "action when X" should also fire a Slack message to the QA channel. The dashboard catches trends; the alerts catch single events.</li>
</ul>
<p><strong>Anti-pattern</strong>: dashboards built once, never reviewed. The fix: a 10-minute Monday standup item where the QA lead screen-shares the dashboard and names this week's focus. Once the team sees the dashboard drives the agenda, they start watching it themselves.</p>`
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
      answer: `<p>Automation finds <em>known</em> bugs (regressions of behaviour you specified). Exploratory finds <em>unknown</em> bugs (behaviour nobody specified). They complement each other — and the senior move is to run exploratory with structure so the value is visible, not vibes-based.</p>
<p><strong>Lean exploratory when:</strong></p>
<ul>
<li>A feature is new and the spec is fuzzy — automation hardens after the design stabilises.</li>
<li>UX-heavy flows where "feel" matters as much as correctness.</li>
<li>Post-incident — look for sibling defects the automation can't see.</li>
<li>Charter-driven sessions ("abuse the cart for 60 minutes with focus on quantity edge cases").</li>
</ul>
<p>Output isn't pass/fail — it's <strong>findings, questions, and new test ideas</strong>. The best findings become permanent automated cases.</p>
<h4>A worked example — charter + findings doc</h4>
<pre class="code"><code># Charter: Cart edge cases on the new pricing engine

Time-box: 75 minutes
Tester:   Andrei
Build:    v3.2.0-rc1 in staging
Area:     Cart → discount-stack application
Risk:     Pricing engine was rewritten in PR #5102

Mission:
  Investigate behaviour when multiple discount conditions interact
  (member discount + promo code + bulk discount), especially around
  rounding, eligibility transitions, and currency conversion.

Inputs:
  - Spec SPEC-947 (discount stack precedence)
  - 3 prior pricing bugs from last quarter (DEF-411, DEF-422, DEF-489)
  - Test data: 4 user types × 3 currencies × 5 cart sizes

Test ideas (seed):
  - 0.99 + 0.01 quantity round-trips
  - removing the last item that qualified for bulk
  - promo code applied at 99% of cart total (negative price floor?)
  - currency switch mid-checkout
  - admin-impersonated user (should member discount apply?)

Out of scope:
  - subscription pricing (covered last week)
  - tax calculation (separate charter)</code></pre>
<pre class="code"><code># Findings — Cart edge cases — Andrei — 2026-06-07 — 73 min

Bugs filed (3):
  - DEF-571 [P1] Currency switch mid-cart leaves promo applied to wrong base
            Steps: EUR cart, apply WELCOME10, switch to USD → discount = 10% of EUR
            Expected: discount recomputed at the new currency base
            Owner: pricing-team

  - DEF-572 [P2] Bulk discount lingers after removing the qualifying item
            Steps: 10x SKU-A (bulk threshold) + apply, remove 1 item, total
                   shows bulk-discounted price
            Expected: bulk discount removed when below threshold
            Owner: cart-team

  - DEF-573 [P3] Admin-impersonated user shows member discount on non-member
            Steps: admin impersonate non-member, member discount applied
            Expected: impersonation should use target user's eligibility
            Owner: admin-team (also: spec ambiguity, see Q1)

Questions to product (2):
  Q1: When admin impersonates, whose discount eligibility applies?
      (spec is silent; current behaviour seems wrong but is consistent)
  Q2: Is "negative price floor" a hard 0.00 or 0.01? Promo at 99%+ hits
      this. (no documented expectation)

Test ideas — convert to automation:
  - Property test: discount applied amount &lt;= cart_total (always)
  - Unit test: bulk threshold transition (8 → 9 → 10 → 9 items)
  - E2E: currency switch invalidates promo
  - Contract test: impersonation header preserves discount eligibility rules

Coverage:
  Of 5 seed ideas, 4 executed. Currency switch took 30 min — 5th idea
  (admin impersonation) cut short. Charter for next session created.

Session quality:
  Bugs/hour: 2.5 (3 bugs in 73 min). Last 4-session average: 1.8/hr.
  Pricing engine area is high-yield right now; charter another session
  within the sprint.</code></pre>
<h4>Why this format works</h4>
<ul>
<li><strong>The charter is auditable</strong> — exec or manager can read it and know what was tested and why.</li>
<li><strong>The findings convert to regression tests explicitly</strong> — each idea has a destination layer. The team knows what the session produces beyond bugs.</li>
<li><strong>"Coverage" is honest</strong> — 80% of seed ideas executed, 20% deferred with reason. The session was bounded; the report says so.</li>
<li><strong>Session quality has a metric</strong> — bugs/hour over a rolling baseline. Trending high = the area is bug-rich and deserves more charters; trending low = the surface is stable and exploratory ROI is dropping (move to automation, move to another area).</li>
</ul>
<p><strong>Senior signal</strong>: you can show the charter document and the findings document from a real session. "We did exploratory testing" sounds vague; "here are the four charters from last sprint, here are the 11 bugs found, here are the 7 that became regression tests" is the evidence interviewers and managers actually want.</p>`
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
      id: "b3f1c002-2026-4000-8000-000000000201",
      q: "Session-Based Test Management (SBTM): design a 90-minute charter for a new checkout flow. What's in the charter, what's in the debrief, how do you convert findings to regression tests?",
      diff: "hard",
      tags: ["sbtm", "exploratory", "charter"],
      diagram: `flowchart LR
  CH["Charter<br/>scope, time-box, risks"] --> SES["Session (90 min)<br/>explore + notes"]
  SES --> DEBR["Debrief (10 min)<br/>what, why, gaps, ideas"]
  DEBR --> FIND["Findings<br/>(bugs, questions, charters for next time)"]
  FIND --> CONV["High-value bugs<br/>→ regression tests<br/>→ traceability matrix"]
  FIND --> BACK["Follow-up charters<br/>back to backlog"]`,
      answer: `<p>SBTM (Session-Based Test Management, Bach + Bolton) is structured exploratory testing — time-boxed, charter-led, debriefed. It turns "let me poke around" into auditable, repeatable work that produces real evidence. Standard session: 45–90 minutes.</p>
<h4>The charter — one page, written BEFORE the session</h4>
<pre class="code"><code># Charter: New checkout flow — guest payment

Time-box:    90 min
Tester:      Maria
Build:       v2.41.0-rc2 in staging
Area:        Checkout → guest payment (Stripe + 3DS)

Mission:
  Investigate the new "guest checkout" path for behaviour that
  differs from logged-in checkout, with focus on edge cases
  introduced by skipping the account-creation step.

Inputs / context:
  - PR #4421 (added skip-create-account branch)
  - Linked spec: SPEC-882
  - Risk areas flagged by team:
      * 3DS redirect with no account
      * email validation under guest mode
      * cart persistence across the auth fork
      * post-checkout email confirmation

Test ideas (seed, not exhaustive):
  - decline cards (Stripe test 4000 0000 0000 0002)
  - 3DS-required cards (4000 0000 0000 3220)
  - extra-long email (320 chars)
  - cart with 25+ items
  - browser back at the 3DS step
  - opening checkout in a 2nd tab mid-session

Out of scope:
  - logged-in checkout (covered by SES-431 last week)
  - account creation flow
  - subscription products
  - cross-browser (this is a Chromium-only session)</code></pre>
<h4>During the session — notes, not minutes</h4>
<p>Three columns running in real time:</p>
<ul>
<li><strong>Setup</strong>: what you did to get to the test condition. Useful for repro.</li>
<li><strong>Observed</strong>: what happened. Screenshots, network captures, console logs.</li>
<li><strong>Question / Note</strong>: hypotheses, follow-ups, "this feels off".</li>
</ul>
<p>Discipline: do not leave the session to triage. A finding goes in the notes; the call about whether it's a bug happens at debrief.</p>
<h4>Debrief (10–15 min, with one other person)</h4>
<ol>
<li><strong>Coverage walk</strong>: what test ideas got executed, what didn't, why.</li>
<li><strong>Bug list</strong>: findings classified into bugs (file with steps), questions (spec ambiguity to PM), and ideas (charters for next session).</li>
<li><strong>Time-on-task</strong>: rough split: setup, test design, bug investigation, reporting, blocked. Useful trend metric across sessions.</li>
<li><strong>Session output</strong>: 1 file per session in the repo (markdown), linked from the test management tool.</li>
</ol>
<h4>Converting findings into regression tests — the senior loop</h4>
<table>
<tr><th>Finding type</th><th>Convert to</th><th>Where</th></tr>
<tr><td>Crash / hard error</td><td>Component or E2E test that reproduces</td><td>existing suite, tagged with bug ID</td></tr>
<tr><td>Edge-case value bug (e.g. 320-char email)</td><td>Unit / contract test on the validator</td><td>at the lowest level that catches it</td></tr>
<tr><td>State-machine bug (browser-back at 3DS)</td><td>Playwright spec with the exact step sequence</td><td>integration / E2E</td></tr>
<tr><td>Spec ambiguity</td><td>PR comment + JIRA ticket to PM</td><td>NOT a test; the spec needs the fix</td></tr>
<tr><td>"Feels off" with no repro</td><td>Charter for next session</td><td>backlog</td></tr>
</table>
<h4>Metrics worth tracking across sessions</h4>
<ul>
<li><strong>Bugs / hour</strong>, per area. Trending. Don't use it to grade testers; use it to flag areas that yield bugs above their fair share.</li>
<li><strong>Coverage of test ideas executed</strong>: % of charter ideas that ran. Below 60% over a quarter = your charters are too ambitious for 90 min.</li>
<li><strong>Findings → tests conversion rate</strong>: of "bug" findings, how many became regression tests within 14 days? Below 70% = the loop is leaking.</li>
</ul>
<p><strong>Senior signal</strong>: SBTM is how you defend exploratory testing to a sceptical manager. "We tested for 8 hours" sounds vague; "we ran four 90-min sessions, charter and notes attached, 5 P1 bugs found, 3 already converted to regression tests" is unimpeachable.</p>
<p><strong>Anti-pattern</strong>: open-ended exploratory time without a charter. Two-hour sessions that produce two paragraphs of unstructured notes and one bug. The session was wasted not because exploration is wasted — exploration is the highest-yield testing — but because no charter means no debrief means no follow-up.</p>`
    },
    {
      id: "b3f1c003-2026-4000-8000-000000000202",
      q: "When should a test stay manual (not automated)? Name 3 scenarios and justify with the cost framing.",
      diff: "mid",
      tags: ["strategy", "automation-roi", "manual"],
      answer: `<p>Automation is the default at most modern shops. That's good for regression; bad for the cases where automation costs more than it returns. A senior names the cases explicitly and resists "automate it because we automate everything".</p>
<h4>1. High-volatility UI under active design iteration</h4>
<p><strong>The case</strong>: a screen the design team has restructured 4 times in 6 weeks. Each restructure breaks every selector, every flow.</p>
<p><strong>Cost</strong>: 8 hours per restructure to re-stabilise the automated tests, plus 2 days of flakes during the transition. The team has done this loop four times. That's a sprint of QA work and you're still chasing the next change.</p>
<p><strong>Manual instead</strong>: a 30-minute exploratory session per iteration. Findings go straight to design. When the screen stabilises (UAT, customer review with no further changes for 30+ days), <em>then</em> automate.</p>
<p><strong>Senior framing</strong>: "Automate when the surface is stable enough that the test outlives the next two changes. Until then, the test is more expensive than the bug it catches."</p>
<h4>2. One-time verification with no regression value</h4>
<p><strong>The case</strong>: a data migration. You need to verify 50M rows moved correctly. The migration runs once.</p>
<p><strong>Cost</strong>: writing a robust migration-verification test framework = 2–4 weeks. It runs once. Maintenance value = zero.</p>
<p><strong>Manual / scripted-once instead</strong>: a one-shot SQL parity script (see API & DB Testing category). Reviewed by an engineer, run during the migration window, archived. No CI integration, no test suite entry.</p>
<p><strong>Senior framing</strong>: "Automation pays back when you run it many times. A one-shot test is a script, not a test."</p>
<h4>3. Visual / UX evaluation that requires human judgement</h4>
<p><strong>The case</strong>: "does the new onboarding flow feel intuitive?" Image-rich pages with subjective layout, copy tone, animation quality.</p>
<p><strong>Cost</strong>: visual regression catches pixel differences, not "feel". An automated test that asserts "feels good" doesn't exist; it would be a measure of agreement between graders, not a property of the product.</p>
<p><strong>Manual instead</strong>: usability sessions, accessibility audits, exploratory testing by a fresh tester (recency-bias-free). Findings feed into design, not into a regression suite.</p>
<p><strong>Senior framing</strong>: "Automation answers 'did this work?' Humans answer 'is this good?' The two are different questions."</p>
<h4>The general rule, four levers</h4>
<table>
<tr><th>Lever</th><th>Favours automation</th><th>Favours manual</th></tr>
<tr><td>Stability of the surface</td><td>High — selectors stable, spec stable</td><td>Low — surface changes faster than tests can keep up</td></tr>
<tr><td>Execution frequency needed</td><td>Many times (CI, regression)</td><td>Once or twice</td></tr>
<tr><td>Oracle clarity</td><td>Yes/no answer exists</td><td>Subjective judgement needed</td></tr>
<tr><td>Cost ratio</td><td>Automation cost &lt; manual × frequency</td><td>Automation cost &gt;&gt; manual × frequency</td></tr>
</table>
<p><strong>The senior conversation to have with engineering managers who default to "automate everything"</strong>: "Automation is an investment. Investments need a return. For these N tests the return is positive — they run every release, the surface is stable, the cost amortises. For these M tests the return is negative — once-off, volatile surface, subjective oracle. We will manual-test those and revisit annually."</p>
<p><strong>Anti-pattern</strong>: writing automation for the volatile screen as a "leadership signal" while the tests fail every PR and get muted. The mute is the real outcome. Better to manual-test honestly than ship an automated test that's silenced inside two weeks.</p>`
    },
    {
      id: "b3f1c004-2026-4000-8000-000000000203",
      q: "Scenario: a feature has 50 candidate test cases. You can only automate 20 this sprint. Which 20 and why?",
      diff: "hard",
      tags: ["strategy", "prioritisation", "risk"],
      diagram: `quadrantChart
  title Risk × ROI matrix
  x-axis Low automation ROI --> High automation ROI
  y-axis Low business risk --> High business risk
  quadrant-1 Automate now (high risk, high ROI)
  quadrant-2 Manual, watch (high risk, low ROI)
  quadrant-3 Drop or batch (low risk, low ROI)
  quadrant-4 Automate when bandwidth allows (low risk, high ROI)
  "Login P0 path": [0.85, 0.95]
  "Checkout P0 path": [0.9, 0.95]
  "Payment 3DS happy": [0.7, 0.9]
  "Promo stack edge case": [0.4, 0.55]
  "i18n: Romanian only": [0.3, 0.35]
  "Edge: 1000-item cart": [0.5, 0.6]
  "UI label spelling": [0.2, 0.15]`,
      answer: `<p>This is the central senior-QA exercise: you cannot automate everything, you cannot manually-test everything, the next sprint starts Monday. You triage on two axes — business risk and automation ROI — then pick a defensible 20.</p>
<h4>Step 1 — score every case on two axes</h4>
<p><strong>Business risk (1–5)</strong> = impact × likelihood of breakage. Impact: user count, revenue, regulatory. Likelihood: complexity, recent change rate, history of bugs.</p>
<p><strong>Automation ROI (1–5)</strong> = stability of the surface × execution frequency / cost-to-automate. Stable selectors + run every release / cheap-to-write = 5. Volatile UI + run once / expensive-to-write = 1.</p>
<h4>Step 2 — the picks</h4>
<table>
<tr><th>Tier</th><th>Risk</th><th>ROI</th><th>Action</th><th>Approx count from 50</th></tr>
<tr><td>1</td><td>4–5</td><td>4–5</td><td>Automate this sprint</td><td>~12</td></tr>
<tr><td>2</td><td>4–5</td><td>2–3</td><td>Manual this release; revisit next sprint</td><td>~8</td></tr>
<tr><td>3</td><td>2–3</td><td>4–5</td><td>Automate IF time remains; otherwise next sprint</td><td>~8 → pick 5–8 if bandwidth</td></tr>
<tr><td>4</td><td>2–3</td><td>2–3</td><td>Batch test manually; consider dropping</td><td>~15 → may consolidate to 5</td></tr>
<tr><td>5</td><td>1</td><td>any</td><td>Drop. Add to "explore if a complaint surfaces" backlog</td><td>~7</td></tr>
</table>
<p>From 50 candidates: ~12 from Tier 1 + ~8 from Tier 3 = 20 automated this sprint. ~8 from Tier 2 cover the rest of the high-risk space manually. Tier 4 + 5 = ~22 cases that don't get formal coverage this release — and that's a deliberate call, not negligence.</p>
<h4>Step 3 — document the call</h4>
<p>This is the part that distinguishes senior. A page in the release notes:</p>
<ul>
<li>20 cases automated (linked).</li>
<li>8 cases manual this release (named, owner assigned).</li>
<li>22 cases not covered this release, with the rationale and the trigger for revisiting ("if a bug in this area surfaces in support tickets, escalate immediately").</li>
</ul>
<p>The document is the audit trail. When a bug ships in the uncovered 22 area, the postmortem question "why didn't QA catch this?" has an answer that's already on file — and the action is to reweight, not to blame.</p>
<h4>Worked example — a feature flag rollout to EU users</h4>
<ul>
<li><strong>Automate</strong>: P0 paths (login, purchase, refund); regulatory paths (GDPR data deletion, EU consumer-protection wording); high-frequency paths (search, dashboard load).</li>
<li><strong>Manual</strong>: 3DS variants that are expensive to spin up reliably; UAT for the new copy with native speakers.</li>
<li><strong>Drop</strong>: spelling consistency check on internal admin pages (low risk, low ROI); two-tab edge cases on a desktop-only feature.</li>
</ul>
<p><strong>Senior signal</strong>: you defend the "drop" pile out loud, in the team meeting, with numbers. Hiding it in a spreadsheet sets you up for a fight when the bug ships.</p>
<p><strong>Anti-pattern</strong>: "automate the easy ones" (a strategy optimised for ROI but not risk → high-risk gaps), or "automate the hardest ones first" (a strategy optimised for risk but not ROI → sprint runs out, low-hanging fruit goes uncovered). The matrix balances both.</p>`
    },
    {
      id: "b3f1c005-2026-4000-8000-000000000204",
      q: "Shift-left in practice: what specifically do you ask devs to unit-test so QA can focus higher up the stack?",
      diff: "mid",
      tags: ["shift-left", "developer-collaboration"],
      answer: `<p>"Shift-left" is the most overused phrase in QA discourse. As a slogan it's useless; as an explicit ask of developers it's powerful. The senior move is to be specific about <em>what</em> shifts left and what stays in QA's lane.</p>
<h4>What devs unit-test (your explicit ask)</h4>
<ol>
<li><strong>Business logic with branches.</strong> Pricing, discount stacks, eligibility checks, state-machine transitions. If the code has an <code>if</code>, an enum, or a math operator with edge cases, that's a unit test.</li>
<li><strong>Error paths and exception handling.</strong> Every <code>throw</code>, every <code>try/catch</code>. The happy path covers 60% of the code and 5% of the bugs.</li>
<li><strong>Data validation and parsing.</strong> Date formats, currency rounding, decimal precision, locale strings, regex validation. If it can come from input, it can be wrong.</li>
<li><strong>Type guards and schema validators.</strong> Zod / io-ts / class-validator etc. Every guard you ship needs a test that proves it rejects the bad shape AND accepts the good shape.</li>
<li><strong>Boundary conditions on numeric inputs.</strong> 0, 1, max, max+1, negative, NaN, Infinity. Off-by-one is still the most-shipped bug class in 2026.</li>
<li><strong>State invariants in reducers / state stores.</strong> "After action X, state[y] must satisfy Z." Unit-testable; very hard to retro-test at integration level.</li>
</ol>
<h4>What you DON'T ask devs to unit-test (it's QA's lane or a different layer)</h4>
<ul>
<li><strong>Cross-component behaviour</strong> (component A renders state from component B). That's integration / component test, not unit.</li>
<li><strong>UI interaction flows</strong> (click sequence, modal flow). That's E2E or component-level.</li>
<li><strong>Visual layout / pixel correctness</strong>. Visual regression, not unit.</li>
<li><strong>Real-API contract</strong>. Contract testing (Pact / OpenAPI), not unit.</li>
<li><strong>Race conditions across services</strong>. Integration test with controlled concurrency.</li>
<li><strong>Accessibility tree correctness</strong>. axe-core in component / E2E layer.</li>
</ul>
<h4>How to actually make the ask land</h4>
<ul>
<li><strong>PR template additions.</strong> "Did you add unit tests for new branches and error paths?" with a checkbox. Polite friction.</li>
<li><strong>Diff-coverage gate.</strong> Codecov / coveralls — block merge if changed lines have &lt; 70% coverage. <em>Diff</em> coverage, not total. The number drives behaviour.</li>
<li><strong>Mutation score on the critical path.</strong> Run Stryker nightly on payments / auth / pricing. PR-level mutation testing is too expensive; nightly with a threshold is sustainable.</li>
<li><strong>Pair-on-tests in the first week of a new feature.</strong> 30 minutes of QA + dev working through what to unit-test for the new logic. Done once, the dev internalises the pattern.</li>
<li><strong>Show the ROI back to devs.</strong> "Last quarter, 11 of 14 incident escapes had no unit test on the branch that broke." When devs see this, the next PR has the tests.</li>
</ul>
<h4>What you commit to in return</h4>
<p>Shift-left isn't a one-sided demand. QA's reciprocal commitments:</p>
<ul>
<li>QA does not duplicate unit-level assertions at E2E. If the dev tested the calculation, you don't re-test it through the UI.</li>
<li>QA focuses on cross-component flows, integration seams, exploratory testing, security paths, accessibility. The things devs cannot reliably test from their position.</li>
<li>QA reviews PRs for testability concerns — flags hard-to-test code BEFORE merge, not after. The earlier-the-better extends both ways.</li>
</ul>
<p><strong>Senior signal</strong>: "shift-left" appears in your sentence with a noun next to it ("shift the input validation tests left", "shift the schema contract assertions left"). Without the noun, it's a slogan and the dev team rolls their eyes.</p>
<p><strong>Anti-pattern</strong>: telling devs to "write more unit tests" without specifying which kind. They will write 50 tests for the getter/setter on the User class and not one test for the discount-stack logic. Specificity is the lever.</p>`
    },
    {
      id: "b3f1c006-2026-4000-8000-000000000205",
      q: "Canary deployment as a test strategy: use production monitoring to gate stages. Define the SLOs.",
      diff: "hard",
      tags: ["canary", "production-testing", "slo"],
      diagram: `flowchart TB
  DEPLOY["Deploy v2 behind flag"] --> S1["1% canary<br/>(30 min hold)"]
  S1 --> CHK1{"SLO check<br/>err rate, latency"}
  CHK1 -->|pass| S2["10% (2h hold)"]
  CHK1 -->|fail| ROLL["Auto-rollback<br/>+ alert"]
  S2 --> CHK2{"SLO check"}
  CHK2 -->|pass| S3["50% (4h hold)"]
  CHK2 -->|fail| ROLL
  S3 --> CHK3{"SLO check"}
  CHK3 -->|pass| S4["100%"]
  CHK3 -->|fail| ROLL`,
      answer: `<p>Canary deployment is a test strategy. The hypothesis under test is "<em>the new build behaves as well as the old build on production traffic</em>." Each stage is a deliberate, measurable experiment whose pass condition is the SLO holding under real load.</p>
<h4>The stages and what they test</h4>
<table>
<tr><th>Stage</th><th>% traffic</th><th>Hold time</th><th>What this stage tests</th></tr>
<tr><td>0. Smoke</td><td>0 (synthetic)</td><td>5 min</td><td>The build boots, healthchecks green</td></tr>
<tr><td>1. Canary</td><td>1%</td><td>30 min</td><td>No catastrophic regression; the obvious crashes</td></tr>
<tr><td>2. Limited</td><td>10%</td><td>2 hours</td><td>Steady-state behaviour under varied real traffic; segment-specific bugs</td></tr>
<tr><td>3. Majority</td><td>50%</td><td>4 hours</td><td>Capacity, downstream impact, cache pressure</td></tr>
<tr><td>4. Full</td><td>100%</td><td>—</td><td>Done; observe for 24h with elevated attention</td></tr>
</table>
<h4>The SLOs that gate each stage</h4>
<ul>
<li><strong>Error rate</strong>: new build error rate ≤ old build error rate × 1.1 (10% tolerance) on a 5-minute rolling window.</li>
<li><strong>Latency p95</strong>: new ≤ old × 1.2 (20% tolerance, because p95 is noisier).</li>
<li><strong>Latency p99</strong>: new ≤ old × 1.5 — the tail tells you about queue / GC / contention. Wider tolerance, harder threshold.</li>
<li><strong>Business KPI</strong>: conversion rate / checkout success / login success — within ±2% of baseline on the canaried slice.</li>
<li><strong>Downstream pressure</strong>: DB connections, cache miss rate, queue depth — must not exceed agreed ceilings during the hold.</li>
</ul>
<h4>The auto-rollback rules</h4>
<pre class="code"><code># pseudo-config for an Argo Rollouts / Flagger-style controller
analysis:
  interval: 60s
  threshold: 5      # consecutive failed checks before rollback
  failureLimit: 3
  metrics:
    - name: error-rate
      provider: prometheus
      query: |
        sum(rate(http_requests_total{job="api",status=~"5..",
          version="new"}[5m]))
        / sum(rate(http_requests_total{job="api",
          version="new"}[5m]))
      successCondition: result &lt; 0.005
    - name: latency-p95-vs-baseline
      provider: prometheus
      query: |
        histogram_quantile(0.95, ...new) /
        histogram_quantile(0.95, ...old)
      successCondition: result &lt; 1.2</code></pre>
<h4>What QA owns</h4>
<ul>
<li><strong>Defining the SLOs with engineering.</strong> The thresholds are negotiated, not handed down. QA brings the historical noise data ("p95 normally varies ±8% week-over-week, so 20% tolerance is appropriate") so the threshold isn't pulled from a hat.</li>
<li><strong>Owning the dashboard for the canary window.</strong> Watching real traffic, calling abort early if a non-SLO signal looks bad (e.g. a specific endpoint's error rate is fine in aggregate but bad on a key customer segment).</li>
<li><strong>Post-canary review.</strong> Every release with a non-trivial canary outcome gets a 15-min review: what did we learn? Should the SLOs tighten or loosen? Did the rollback trigger work?</li>
</ul>
<h4>What this replaces (and what it doesn't)</h4>
<p>Canary <em>complements</em> pre-prod testing; it does not replace it. Pre-prod catches the classes of bug whose impact you don't want to inflict on even 1% of real users (data corruption, security holes, regulatory violations). Canary catches the classes pre-prod can't reproduce: real traffic mix, real downstream pressure, real customer segment behaviours.</p>
<p>The two together are why elite teams ship to production frequently without high change-failure rates.</p>
<p><strong>Senior signal</strong>: when you describe canary, you describe specific SLO thresholds, the auto-rollback policy, the post-canary review, and what pre-prod still owns. "We do canary" is junior; "we hold at 1% for 30 min with these five metrics, auto-rollback at threshold breach, post-release review weekly" is senior.</p>
<p><strong>Anti-pattern</strong>: canary as a slow rollout with no SLO gates — the "1%, 10%, 50%, 100%" rollout where each stage is just a timer. That's a delivery cadence, not a test strategy. Real canary requires the metric and the abort.</p>`
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
    {
      id: "b3f1c001-2026-4000-8000-000000000301",
      q: "Write a Vitest unit test with mocks and spies. Show how to cover the error path.",
      diff: "mid",
      tags: ["vitest", "unit", "mocks"],
      answer: `<p>Vitest's mock + spy API mirrors Jest's almost 1:1, but the watch loop is ~3× faster because it shares Vite's transform. The senior pattern is to mock at the module boundary, never inside the unit under test.</p>
<pre class="code"><code>// src/services/orders.ts — system under test
import { paymentsClient } from './payments';
export async function placeOrder(userId: string, items: Item[]) {
  const total = items.reduce((s, i) =&gt; s + i.price * i.qty, 0);
  if (total &lt;= 0) throw new Error('Empty order');
  const res = await paymentsClient.charge({ userId, amount: total });
  if (!res.ok) throw new Error(\`Payment failed: \${res.code}\`);
  return { orderId: res.id, total };
}</code></pre>
<pre class="code"><code>// src/services/orders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentsClient } from './payments';
import { placeOrder } from './orders';

vi.mock('./payments', () =&gt; ({
  paymentsClient: { charge: vi.fn() },
}));

const charge = vi.mocked(paymentsClient.charge);

beforeEach(() =&gt; vi.resetAllMocks());

describe('placeOrder', () =&gt; {
  it('charges the payment client and returns an order id', async () =&gt; {
    charge.mockResolvedValueOnce({ ok: true, id: 'ord-1', code: 'OK' });
    const out = await placeOrder('u-1', [{ price: 10, qty: 2 }]);
    expect(out).toEqual({ orderId: 'ord-1', total: 20 });
    expect(charge).toHaveBeenCalledWith({ userId: 'u-1', amount: 20 });
  });

  it('throws on empty order WITHOUT calling payments', async () =&gt; {
    await expect(placeOrder('u-1', [])).rejects.toThrow('Empty order');
    expect(charge).not.toHaveBeenCalled();    // proves no side effect
  });

  it('propagates payment failure with the provider code', async () =&gt; {
    charge.mockResolvedValueOnce({ ok: false, id: '', code: 'CARD_DECLINED' });
    await expect(placeOrder('u-1', [{ price: 5, qty: 1 }]))
      .rejects.toThrow('Payment failed: CARD_DECLINED');
  });
});</code></pre>
<p><strong>What separates this from junior work:</strong></p>
<ul>
<li><strong>Reset between tests</strong> — <code>vi.resetAllMocks()</code> in <code>beforeEach</code>. Without it, call history leaks. The most common reason "test passes alone, fails in suite".</li>
<li><strong>Assert the NOT path</strong> — the empty-order test asserts <code>charge</code> was not called. Junior tests assert the throw; senior tests assert the absence of side effects.</li>
<li><strong>Verify the call shape</strong> — <code>toHaveBeenCalledWith</code> with the full payload. Catches drift when the function changes the API silently.</li>
<li><strong>Mock at module boundary</strong> — not inside <code>placeOrder</code>. Lets you swap implementations in integration tests without touching production code.</li>
</ul>
<p><strong>Anti-pattern</strong>: spying on internal functions of the unit under test (<code>vi.spyOn(orders, 'placeOrder')</code>). That's testing the implementation, not the behaviour. If you need to do that, the unit is too big — split it.</p>
<p><strong>2026 reality check</strong>: Vitest 2.0 is ~3.8× faster than Jest 30 on a 10k-test React suite and ~40% lower memory. On a Vite-based codebase there is no reason to start a new project on Jest. On a legacy Webpack/CRA codebase the ROI of migrating is real but the cost is non-zero (mock factories, snapshot format, custom resolvers) — usually a 2-week project for a 5k-test suite.</p>`
    },
    {
      id: "b3f1c002-2026-4000-8000-000000000302",
      q: "Testing Library: query by role vs query by CSS. Show an example that breaks on a CSS refactor.",
      diff: "mid",
      tags: ["rtl", "component", "accessibility"],
      answer: `<p>React Testing Library's guiding rule: <em>tests should resemble how users (and assistive tech) interact with the UI</em>. The query priority is documented: <code>getByRole</code> → <code>getByLabelText</code> → <code>getByText</code> → <code>getByTestId</code> → CSS as last resort.</p>
<pre class="code"><code>// LoginForm.tsx — production component (extract)
&lt;form&gt;
  &lt;label htmlFor="email"&gt;Email&lt;/label&gt;
  &lt;input id="email" type="email" className="form-input form-input--lg" /&gt;
  &lt;button type="submit" className="btn btn-primary btn-lg"&gt;Log in&lt;/button&gt;
&lt;/form&gt;</code></pre>
<pre class="code"><code>// ❌ Brittle — couples test to CSS class names
test('login fails on invalid email (CSS-coupled)', async () =&gt; {
  render(&lt;LoginForm /&gt;);
  await user.type(container.querySelector('.form-input')!, 'not-an-email');
  await user.click(container.querySelector('.btn-primary')!);
  expect(screen.getByText('Invalid email')).toBeVisible();
});

// ✅ Resilient — queries by role/label, survives CSS refactors
test('login fails on invalid email', async () =&gt; {
  render(&lt;LoginForm /&gt;);
  await user.type(screen.getByLabelText(/email/i), 'not-an-email');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email/i);
});</code></pre>
<p>The CSS-coupled test will break the moment your design system renames <code>.btn-primary</code> to <code>.button--primary</code>, or your CSS-in-JS engine generates <code>.css-xyz123</code> class hashes. The role-based test survives all of that — the only thing that breaks it is a real user-facing change.</p>
<p><strong>What query to reach for, by case:</strong></p>
<table>
<tr><th>Element</th><th>Best query</th><th>Why</th></tr>
<tr><td>Buttons, links, headings, regions</td><td><code>getByRole</code></td><td>What screen readers announce</td></tr>
<tr><td>Form fields</td><td><code>getByLabelText</code></td><td>Forces a real <code>&lt;label&gt;</code> — accessibility-by-default</td></tr>
<tr><td>Visible static text</td><td><code>getByText</code></td><td>Resilient to surrounding layout</td></tr>
<tr><td>Anything else</td><td><code>getByTestId</code></td><td>Escape hatch — but flags a missing semantic role</td></tr>
<tr><td>Dynamic, will appear later</td><td><code>findByRole</code> / <code>findByText</code></td><td>Built-in await; never <code>waitFor</code>+<code>getBy</code></td></tr>
</table>
<p><strong>Senior signal</strong>: when your test <em>cannot</em> find an element by role, that's a bug report for the dev team — the element is invisible to assistive tech. Several EU consumer-facing companies (post-EAA, in force June 2025) treat "RTL fell back to <code>getByTestId</code>" as a code-review smell that produces an a11y ticket.</p>
<p><strong>Anti-pattern</strong>: <code>act(() =&gt; { ... }); fireEvent.click(...)</code> instead of <code>await user.click(...)</code>. <code>user-event</code> wraps events the way a real browser fires them (focus, mousedown, mouseup, click, change). <code>fireEvent</code> is a low-level escape hatch; use it only when <code>user-event</code> physically can't do the thing.</p>`
    },
    {
      id: "b3f1c003-2026-4000-8000-000000000303",
      q: "MSW: intercept an API in component tests. Cover happy and error paths.",
      diff: "mid",
      tags: ["msw", "mocking", "component"],
      diagram: `flowchart LR
  TEST["Component test (Vitest + RTL)"] --> MSW["MSW Service Worker<br/>(or msw/node in jsdom)"]
  MSW -->|matched| HANDLER["Per-test handler<br/>http.get / http.post"]
  MSW -->|unmatched| WARN["console.warn<br/>(or onUnhandledRequest: 'error')"]
  HANDLER --> RES["HttpResponse.json(...)<br/>+ status"]
  RES --> COMPONENT["Component receives<br/>real fetch / axios"]`,
      answer: `<p>MSW (Mock Service Worker) intercepts requests at the network layer — same code path as production. The component under test calls <code>fetch</code> / <code>axios</code> normally; MSW returns the canned response. Unlike <code>jest.mock('axios')</code>, you are not mocking the client; you are mocking the wire.</p>
<pre class="code"><code>// src/test/server.ts — one shared server, reset between tests
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  // Default handler — overridden per test as needed
  http.get('/api/orders/:id', ({ params }) =&gt;
    HttpResponse.json({ id: params.id, status: 'PENDING', total: 0 }),
  ),
);

// src/test/setup.ts (referenced from vitest.config.ts)
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './server';

beforeAll(() =&gt; server.listen({ onUnhandledRequest: 'error' })); // explicit fail
afterEach(() =&gt; server.resetHandlers());                          // test isolation
afterAll(()  =&gt; server.close());</code></pre>
<pre class="code"><code>// OrderStatus.test.tsx
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { OrderStatus } from './OrderStatus';

it('renders shipped status when API returns SHIPPED', async () =&gt; {
  server.use(
    http.get('/api/orders/:id', () =&gt;
      HttpResponse.json({ id: 'ord-1', status: 'SHIPPED', total: 42 }),
    ),
  );
  render(&lt;OrderStatus orderId="ord-1" /&gt;);
  expect(await screen.findByRole('status')).toHaveTextContent(/shipped/i);
});

it('shows an error banner when API returns 500', async () =&gt; {
  server.use(
    http.get('/api/orders/:id', () =&gt;
      new HttpResponse(null, { status: 500 }),
    ),
  );
  render(&lt;OrderStatus orderId="ord-1" /&gt;);
  expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load/i);
});

it('handles network failure (no response at all)', async () =&gt; {
  server.use(
    http.get('/api/orders/:id', () =&gt; HttpResponse.error()),
  );
  render(&lt;OrderStatus orderId="ord-1" /&gt;);
  expect(await screen.findByRole('alert')).toHaveTextContent(/offline/i);
});</code></pre>
<p><strong>Why MSW beats <code>vi.mock('axios')</code>:</strong></p>
<ul>
<li><strong>Same handlers in tests, Storybook, and dev mode.</strong> The same <code>http.get(...)</code> definitions can run as a Service Worker in the browser during local dev — your dev environment uses the same mocks the tests do.</li>
<li><strong>Catches client-library bugs.</strong> If the component switches from <code>axios</code> to <code>fetch</code>, the test still works. Module mocks don't.</li>
<li><strong>Status codes, headers, timing</strong> — first-class. <code>HttpResponse.json(body, { status: 429, headers: { 'Retry-After': '60' } })</code> mirrors real APIs.</li>
</ul>
<p><strong>Critical config flag</strong>: <code>onUnhandledRequest: 'error'</code>. Without it, an unmatched request returns whatever the real server does (or hangs in CI). With it, every unmatched URL fails the test loudly — exactly what you want.</p>
<p><strong>Anti-pattern</strong>: defining handlers inside individual tests without <code>server.resetHandlers()</code> after each. Handlers leak across tests and you spend a Friday afternoon bisecting a flake that's actually an isolation bug.</p>`
    },
    {
      id: "b3f1c004-2026-4000-8000-000000000304",
      q: "Stryker mutation report: what do killed / survived / no-coverage / timeout mean? Fix a survived mutant.",
      diff: "hard",
      tags: ["stryker", "mutation-testing", "coverage"],
      diagram: `graph TB
  SRC["Source: total > 0"] --> MUT["Stryker generates mutants"]
  MUT --> M1["Mutant A: total >= 0"]
  MUT --> M2["Mutant B: total < 0"]
  MUT --> M3["Mutant C: true"]
  M1 --> RUN["Tests run<br/>against each mutant"]
  M2 --> RUN
  M3 --> RUN
  RUN --> K["KILLED<br/>(test caught it)<br/>✓ assertions strong"]
  RUN --> S["SURVIVED<br/>(test missed it)<br/>✗ weak assertion or<br/>missing test case"]
  RUN --> NC["NO COVERAGE<br/>(no test exercised line)<br/>→ add a test"]
  RUN --> TO["TIMEOUT<br/>(mutant caused infinite loop)<br/>usually a kill"]`,
      answer: `<p>Stryker introduces small code changes ("mutants") and re-runs your tests against each one. If a mutant survives, your tests passed on a deliberately broken program — which means an assertion is weak or a test is missing. Score = killed ÷ (killed + survived + timeout) × 100.</p>
<p>ThoughtWorks Tech Radar (April 2026) flagged mutation testing as the way to "shift focus from how much code is executed to how much code is actually verified" — meaning: 100% line coverage with a 35% mutation score is a much louder signal than the line number suggested.</p>
<h4>The four outcomes</h4>
<table>
<tr><th>Outcome</th><th>Meaning</th><th>Action</th></tr>
<tr><td><strong>KILLED</strong></td><td>≥ 1 test failed against the mutant. Your assertions caught the change.</td><td>Nothing — this is the goal.</td></tr>
<tr><td><strong>SURVIVED</strong></td><td>All tests passed against the mutant. Your tests run the line but don't assert what matters about it.</td><td>Strengthen the assertion OR add a missing case.</td></tr>
<tr><td><strong>NO COVERAGE</strong></td><td>No test exercises the mutated line at all.</td><td>Add a test. Lower priority than survived if the line is genuinely dead.</td></tr>
<tr><td><strong>TIMEOUT</strong></td><td>Mutant caused an infinite loop / hang. Stryker stops it at <code>timeoutMS</code>.</td><td>Counts as killed (the test would have failed anyway). Investigate only if your real code is timing out too.</td></tr>
</table>
<h4>Mutation operators (the most useful ones)</h4>
<ul>
<li><strong>Conditional boundary</strong>: <code>&gt;</code> → <code>&gt;=</code>, <code>&lt;</code> → <code>&lt;=</code>. Catches off-by-one assertions.</li>
<li><strong>Conditional negation</strong>: <code>if (x)</code> → <code>if (!x)</code>. Catches "I tested true but never tested false".</li>
<li><strong>Arithmetic</strong>: <code>+</code> → <code>-</code>. Catches "I asserted the result is non-zero but never asserted the correct value".</li>
<li><strong>String literal</strong>: <code>'PENDING'</code> → <code>""</code>. Catches "I check the field exists but not the value".</li>
<li><strong>Boolean</strong>: <code>return true</code> → <code>return false</code>. Catches "I called the function but never asserted the return".</li>
</ul>
<h4>Walking a survived mutant</h4>
<pre class="code"><code>// Source
function applyDiscount(total: number, code: string) {
  if (total &gt; 100 &amp;&amp; code === 'WELCOME10') return total * 0.9;
  return total;
}

// Existing test (the one that lets a mutant survive)
it('applies discount when threshold is met', () =&gt; {
  expect(applyDiscount(150, 'WELCOME10')).toBeLessThan(150);  // ⚠ weak
});

// Stryker mutates: total &gt; 100 → total &gt;= 100
// → mutant survives because we only test with 150, never 100 itself.</code></pre>
<pre class="code"><code>// Fixed test — adds boundary + asserts exact value
it('applies 10% discount above 100', () =&gt; {
  expect(applyDiscount(150, 'WELCOME10')).toBe(135);    // exact value
  expect(applyDiscount(100, 'WELCOME10')).toBe(100);    // boundary — NOT discounted
  expect(applyDiscount(101, 'WELCOME10')).toBe(90.9);   // boundary — DISCOUNTED
});
// Now both conditional-boundary and arithmetic mutants are killed.</code></pre>
<h4>CI integration</h4>
<p>Stryker is expensive (each mutant = full test re-run). Don't run on every PR. Strategy:</p>
<ul>
<li><strong>Nightly on main</strong> — full mutation run, ~30 min for 5k LOC.</li>
<li><strong>Per-PR only on changed files</strong> — <code>stryker run --since main</code> mode. ~2 min budget.</li>
<li><strong>Threshold gating</strong>: <code>mutationScore.high: 80, low: 60</code> in <code>stryker.conf.json</code>. PR fails if score drops below 60.</li>
<li><strong>Trend reporting</strong>: Stryker Dashboard or weekly digest. Watching the score trend matters more than the absolute number.</li>
</ul>
<p><strong>Anti-pattern</strong>: chasing 100% mutation score. The last 10% is usually <em>equivalent mutants</em> — semantically identical changes Stryker can't distinguish. Disable them via <code>StrykerIgnore</code> comments rather than burn a sprint on them.</p>`
    },
    {
      id: "b3f1c005-2026-4000-8000-000000000305",
      q: "Property-based testing with fast-check: write a property that catches a boundary bug a unit test would miss.",
      diff: "hard",
      tags: ["fast-check", "property-based", "unit"],
      answer: `<p>Property-based testing flips the model: instead of "test these N inputs", you assert "<em>for all</em> inputs satisfying X, property Y holds". fast-check generates 100s of random inputs per run and <em>shrinks</em> a failing case down to the minimum reproduction.</p>
<p>Where it earns its place: encoders, parsers, money math, date math, anywhere edge cases hide in the input space combinatorics.</p>
<pre class="code"><code>// System under test — naive currency rounding
export function roundCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// ❌ Example-based test — passes
it('rounds to 2 decimals', () =&gt; {
  expect(roundCents(1.234)).toBe(1.23);
  expect(roundCents(1.235)).toBe(1.24);   // happy
  expect(roundCents(0)).toBe(0);
});</code></pre>
<pre class="code"><code>// ✓ Property-based test — finds the floating-point trap
import fc from 'fast-check';

it('always rounds to at most 2 decimal places', () =&gt; {
  fc.assert(
    fc.property(fc.float({ min: 0, max: 1_000_000, noNaN: true }), (amount) =&gt; {
      const rounded = roundCents(amount);
      const decimals = (rounded.toString().split('.')[1] ?? '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    }),
    { numRuns: 1000 },
  );
});

// fast-check finds and shrinks:
// Counterexample: 1.005
// Expected: decimals &lt;= 2
// Received: 1.0049999999999999  → 5 decimal places
// Root cause: 1.005 * 100 = 100.49999... due to IEEE 754
// (use Math.round((amount * 100) + Number.EPSILON) / 100, or a decimal lib)</code></pre>
<h4>What "shrinking" buys you</h4>
<p>When a property fails, fast-check doesn't hand you the failing random input. It hands you the <em>smallest</em> input that still fails — typically 1–3 chars, a single-digit number, an empty array. That makes the bug reproducible in a debugger in under a minute.</p>
<h4>Useful arbitraries</h4>
<table>
<tr><th>Arbitrary</th><th>Use case</th></tr>
<tr><td><code>fc.integer({ min, max })</code></td><td>Bounded numeric domains</td></tr>
<tr><td><code>fc.string({ minLength, maxLength })</code></td><td>Parsers, validators</td></tr>
<tr><td><code>fc.array(fc.integer())</code></td><td>Sort, dedupe, aggregate functions</td></tr>
<tr><td><code>fc.record({ id: fc.uuid(), age: fc.nat() })</code></td><td>Domain objects</td></tr>
<tr><td><code>fc.constantFrom('EUR', 'USD', 'GBP')</code></td><td>Enums / discriminated unions</td></tr>
<tr><td><code>fc.oneof(fc.integer(), fc.string())</code></td><td>Union types — test the discriminator handles both branches</td></tr>
</table>
<h4>Property patterns to reach for</h4>
<ul>
<li><strong>Round-trip</strong>: <code>decode(encode(x)) === x</code>. Catches encoder asymmetry bugs.</li>
<li><strong>Idempotence</strong>: <code>f(f(x)) === f(x)</code>. Catches "normalize is not stable".</li>
<li><strong>Invariant</strong>: <code>sort(arr).length === arr.length</code>. Catches "we silently dropped elements".</li>
<li><strong>Commutativity</strong>: <code>add(a, b) === add(b, a)</code>. Catches order-dependent bugs.</li>
<li><strong>Monotonicity</strong>: <code>a &lt;= b → f(a) &lt;= f(b)</code>. Catches ranking/scoring bugs.</li>
</ul>
<p><strong>Trade-off</strong>: property-based tests are slower (1000 runs vs 1) and harder to debug when the property itself is wrong. Use them on <em>pure</em> functions and at <em>tight</em> boundaries. Don't try to property-test a Playwright flow — that's not what it's for.</p>
<p><strong>Anti-pattern</strong>: testing "the function returns a number" — that's the type checker's job, not a property test. Test invariants the type system cannot express: range, order, conservation, parity.</p>`
    },
    {
      id: "b3f1c006-2026-4000-8000-000000000306",
      q: "Testcontainers: spin up Postgres + Redis for integration tests, seed data, verify isolation between parallel test workers.",
      diff: "hard",
      tags: ["testcontainers", "integration", "isolation"],
      diagram: `graph TB
  W1["Vitest worker 1"] --> C1["Postgres container :random_port_1"]
  W2["Vitest worker 2"] --> C2["Postgres container :random_port_2"]
  W3["Vitest worker 3"] --> C3["Postgres container :random_port_3"]
  W1 --> R1["Redis container :random_port_4"]
  W2 --> R2["Redis container :random_port_5"]
  W3 --> R3["Redis container :random_port_6"]
  NOTE["Each worker = own ephemeral DB.<br/>No shared state. No cleanup races."] -.-> C1`,
      answer: `<p>Testcontainers launches real Docker containers (Postgres, Redis, Kafka, Mongo, anything with an image) for the duration of your test run, then tears them down. You test against the real engine, not an in-memory simulator — caught a dozen "works with H2, fails on real Postgres" bugs at every shop I've used it at.</p>
<pre class="code"><code>// src/test/db-fixture.ts
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';

let pg: StartedPostgreSqlContainer;
let redis: StartedTestContainer;
export let pool: Pool;
export let cache: RedisClientType;

export async function startInfra() {
  // Each worker gets its own pair of containers on random host ports
  pg = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('app_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  redis = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  pool = new Pool({ connectionString: pg.getConnectionUri() });
  cache = createClient({ url: \`redis://\${redis.getHost()}:\${redis.getMappedPort(6379)}\` });
  await cache.connect();

  // Schema migration — run once per worker
  await pool.query(await readFile('./migrations/001_init.sql', 'utf-8'));
}

export async function stopInfra() {
  await pool.end();
  await cache.disconnect();
  await pg.stop();
  await redis.stop();
}</code></pre>
<pre class="code"><code>// vitest.setup.ts — one set of containers per worker, not per test
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { startInfra, stopInfra, pool, cache } from './src/test/db-fixture';

beforeAll(startInfra, 60_000);  // 60s timeout — pulling images
afterAll(stopInfra);

// Per-test isolation: truncate, don't drop+recreate
beforeEach(async () =&gt; {
  await pool.query('TRUNCATE orders, users RESTART IDENTITY CASCADE');
  await cache.flushDb();
});</code></pre>
<pre class="code"><code>// example.test.ts — full-stack assertion against real engines
import { pool, cache } from './src/test/db-fixture';
import { placeOrder } from './src/orders';

it('writes the order to Postgres and caches the total in Redis', async () =&gt; {
  await pool.query("INSERT INTO users(id, email) VALUES('u1', 'a@b.c')");
  const { orderId, total } = await placeOrder('u1', [
    { sku: 'SKU-1', price: 10, qty: 3 },
  ]);

  // DB invariant
  const row = await pool.query('SELECT total FROM orders WHERE id = $1', [orderId]);
  expect(row.rows[0].total).toBe('30.00');

  // Cache invariant
  expect(await cache.get(\`order:total:\${orderId}\`)).toBe('30');
});</code></pre>
<h4>Parallel-worker isolation</h4>
<ul>
<li>Vitest runs tests in worker threads by default. Each worker gets its own port-mapped container pair — there is no sharing.</li>
<li>Truncate (not drop) between tests inside a worker — schema stays, data resets, ~10 ms vs ~1 s.</li>
<li><code>RESTART IDENTITY CASCADE</code> resets sequences so primary keys don't drift between tests.</li>
</ul>
<h4>Cost guardrails</h4>
<ul>
<li><strong>Image pull time</strong> dominates first-run cost. Pin tags (<code>postgres:16-alpine</code>, not <code>postgres:latest</code>) and let CI cache Docker layers.</li>
<li><strong>Reuse mode</strong>: <code>.withReuse()</code> + <code>testcontainers.properties</code> with <code>testcontainers.reuse.enable=true</code> keeps containers alive across runs in dev — multi-second savings per <code>npm test</code> invocation.</li>
<li><strong>CI runner sizing</strong>: each parallel worker = ~150 MB Postgres + 30 MB Redis. A 4-worker run wants 1 GB headroom.</li>
</ul>
<p><strong>When NOT to reach for Testcontainers</strong>: a pure unit test of a SQL query builder. There you mock the driver. Testcontainers earns its keep when you need real planner behaviour, real ACID, real network — i.e. when you're testing the seam between code and engine.</p>
<p><strong>Anti-pattern</strong>: one shared container for the whole test suite with manual cleanup. Cleanup races, parallelism dies, you debug "test passes alone, fails in suite" forever.</p>`
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
    {
      id: "b3f1c004-2026-4000-8000-000000000401",
      q: "MongoDB aggregation pipeline: find the top 3 best-selling products per category. Contrast with SQL window functions.",
      diff: "hard",
      tags: ["mongodb", "nosql", "aggregation"],
      answer: `<p>MongoDB's aggregation pipeline is the NoSQL counterpart to SQL's window functions, GROUP BY, and JOINs — combined into a single declarative chain. Each stage transforms the document stream and feeds the next.</p>
<pre class="code"><code>// Documents in 'orders' collection
{ _id, productId, categoryId, productName, qty, price, createdAt }</code></pre>
<pre class="code"><code>// MongoDB — top 3 best-sellers per category by units sold
db.orders.aggregate([
  // 1. Sum units per (category, product)
  { $group: {
      _id:    { categoryId: '$categoryId', productId: '$productId' },
      name:   { $first: '$productName' },
      sold:   { $sum: '$qty' },
  }},
  // 2. Sort within partition: highest sales first
  { $sort: { '_id.categoryId': 1, sold: -1 } },
  // 3. Re-group by category, push products into ordered array
  { $group: {
      _id:      '$_id.categoryId',
      products: { $push: { productId: '$_id.productId', name: '$name', sold: '$sold' } },
  }},
  // 4. Keep only the first 3 per category
  { $project: {
      categoryId: '$_id',
      top3:       { $slice: ['$products', 3] },
      _id:        0,
  }},
]);</code></pre>
<pre class="code"><code>-- SQL equivalent — window function
SELECT category_id, product_id, product_name, sold
FROM (
  SELECT
    category_id, product_id, product_name,
    SUM(qty) AS sold,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY SUM(qty) DESC) AS rn
  FROM orders
  GROUP BY category_id, product_id, product_name
) ranked
WHERE rn &lt;= 3;</code></pre>
<h4>What's different — what a tester needs to assert</h4>
<table>
<tr><th>SQL</th><th>MongoDB</th><th>Test implication</th></tr>
<tr><td><code>JOIN</code></td><td><code>$lookup</code></td><td>Test that nulls propagate correctly when the right side is missing</td></tr>
<tr><td><code>GROUP BY</code></td><td><code>$group</code></td><td>Test that missing fields aggregate to 0/null, not throw</td></tr>
<tr><td>Window functions</td><td>Multi-stage <code>$group</code> + <code>$slice</code></td><td>Test the per-partition cut, not just the global top N</td></tr>
<tr><td>Stable schema</td><td>Schema drift across versions</td><td>Test that pipelines handle documents missing optional fields</td></tr>
</table>
<h4>Test patterns specific to aggregation</h4>
<ul>
<li><strong>Empty collection</strong>: pipeline should return <code>[]</code>, not throw. <code>db.orders.deleteMany({}); expect(aggregate(pipeline)).toEqual([])</code>.</li>
<li><strong>Single-document collection</strong>: top-3 with 1 product should return that 1 product, not error on <code>$slice</code>.</li>
<li><strong>Missing field</strong>: a document without <code>qty</code> — does <code>$sum</code> treat it as 0 (yes) or skip (no)? Assert which one your business rule wants.</li>
<li><strong>Tie-breaking</strong>: two products with identical <code>sold</code> count — which is in the top 3? Deterministic? Add <code>productId ASC</code> as the tie-breaker in the <code>$sort</code> stage and assert it.</li>
<li><strong>Index usage</strong>: <code>db.orders.aggregate(pipeline, { explain: true })</code> should show <code>IXSCAN</code> on the leading <code>$match</code>, not <code>COLLSCAN</code>. CI gate on this for production-critical queries.</li>
</ul>
<p><strong>Senior signal</strong>: a junior writes the pipeline; a senior asks "what happens when this runs against 50M documents?". The answer involves <code>$match</code> as stage 1 (use the index), <code>allowDiskUse: true</code> only when necessary, and the <code>$facet</code> stage for parallel aggregations on the same input.</p>
<p><strong>Anti-pattern</strong>: testing aggregation against a single hand-curated 5-document fixture. The pipeline that works on 5 documents may melt on 5M — test data scale matters. Pair the correctness test with a Testcontainers run against a 1M-row seed for ops-critical pipelines.</p>`
    },
    {
      id: "b3f1c005-2026-4000-8000-000000000402",
      q: "DynamoDB access patterns: design a table for an order system supporting order-by-user AND order-by-status queries. Pick partition key + GSI.",
      diff: "hard",
      tags: ["dynamodb", "nosql", "access-patterns"],
      diagram: `graph TB
  PK["Base table<br/>PK: userId<br/>SK: orderId"]
  GSI1["GSI1: status-createdAt<br/>PK: status<br/>SK: createdAt"]
  PK -.indexes.-> GSI1
  Q1["Query: orders by user<br/>Q(PK=userId)"]
  Q2["Query: PENDING orders this week<br/>Q(GSI1, PK=PENDING, SK between)"]
  Q3["Query: single order<br/>GetItem(userId, orderId)"]
  Q1 --> PK
  Q3 --> PK
  Q2 --> GSI1`,
      answer: `<p>DynamoDB punishes you for thinking in SQL. There are no flexible queries — you must design the keys for every access pattern up front. The discipline is called <strong>single-table design</strong>, and the senior heuristic is: list every query you need before you create the table.</p>
<h4>The two access patterns</h4>
<ol>
<li>"All orders for user <code>u-42</code>, newest first."</li>
<li>"All <code>PENDING</code> orders across the system, oldest first (to dispatch)."</li>
</ol>
<h4>Schema</h4>
<pre class="code"><code>// Base table
{
  PK:        "u-42",                           // userId — partition key
  SK:        "ORDER#2026-06-07T10:15:00#o-1",  // composite sort key
  status:    "PENDING",
  total:     142.50,
  createdAt: "2026-06-07T10:15:00Z",
  // ... rest of the document
}

// GSI: status-createdAt-index
// PK: status, SK: createdAt</code></pre>
<h4>Query 1 — orders for a user</h4>
<pre class="code"><code>const res = await ddb.query({
  TableName: 'orders',
  KeyConditionExpression: 'PK = :u AND begins_with(SK, :prefix)',
  ExpressionAttributeValues: { ':u': 'u-42', ':prefix': 'ORDER#' },
  ScanIndexForward: false,    // newest first
  Limit: 20,
});</code></pre>
<h4>Query 2 — pending orders by age</h4>
<pre class="code"><code>const res = await ddb.query({
  TableName: 'orders',
  IndexName: 'status-createdAt-index',
  KeyConditionExpression: '#s = :s AND createdAt BETWEEN :from AND :to',
  ExpressionAttributeNames:  { '#s': 'status' },
  ExpressionAttributeValues: {
    ':s':    'PENDING',
    ':from': '2026-06-01T00:00:00Z',
    ':to':   '2026-06-07T23:59:59Z',
  },
  ScanIndexForward: true,    // oldest first
  Limit: 100,
});</code></pre>
<h4>What QA must verify</h4>
<ul>
<li><strong>Hot partition</strong>: if 80% of orders land in <code>status=PENDING</code>, your GSI partition is a hot spot. Test under load and watch CloudWatch metrics — DynamoDB will return <code>ProvisionedThroughputExceededException</code>. Mitigation: <em>write sharding</em> — append <code>#0..9</code> to the status to spread across 10 partitions.</li>
<li><strong>Sparse index</strong>: only <code>PENDING</code> needs to be queryable by status? Use a sparse index — only items with the attribute appear in the GSI. Saves storage and write costs.</li>
<li><strong>Eventually consistent reads (GSIs)</strong>: <strong>all GSI reads are eventually consistent</strong>, even if the base table read is strong. A new order may not appear in the GSI for ~100ms. Tests must poll, not assert immediately.</li>
<li><strong>Single-table joins</strong>: storing user profile and orders in the same table with <code>PK=userId</code>, <code>SK=PROFILE</code> vs <code>SK=ORDER#...</code> = one query gets both. Test the parse logic that demultiplexes them.</li>
</ul>
<h4>2026 reality check</h4>
<p>DynamoDB now supports <strong>multi-region strong consistency for global tables</strong> (announced 2024, GA 2025) — a senior should know this exists, because the historical answer "DynamoDB is eventually consistent across regions" is no longer correct for global tables. Cost ~25% premium.</p>
<p><strong>Test the eventually-consistent path anyway</strong> — most apps don't pay for global strong consistency, and your tests must validate the polling/retry behaviour at the consistency window.</p>
<p><strong>Anti-pattern</strong>: <code>Scan</code> for analytics. Scan reads every item in the table — fine on a 1k-row dev table, catastrophic on a 100M production table. If you need analytics, stream the table to S3 + Athena via DynamoDB Streams. The test discipline: <em>any test that uses <code>Scan</code> on a production-shaped table fails the review</em>.</p>`
    },
    {
      id: "b3f1c006-2026-4000-8000-000000000403",
      q: "Eventual consistency: a write to Service A appears in Service B with up to 50ms lag. Design the test that proves it.",
      diff: "hard",
      tags: ["eventual-consistency", "distributed", "async"],
      diagram: `sequenceDiagram
  participant T as Test
  participant A as Service A (writer)
  participant Q as Event bus / Outbox
  participant B as Service B (reader)
  T->>A: POST /orders (create)
  A->>A: write + emit OrderCreated
  A->>Q: publish event
  A-->>T: 201 Created (orderId)
  Q->>B: deliver event (latency ~50ms)
  B->>B: project into read model
  loop poll up to 2s
    T->>B: GET /orders/:id
    B-->>T: 404 (not yet) or 200 (consistent)
  end
  T->>T: assert eventually 200 + correct state`,
      answer: `<p>Eventual consistency is not a bug; it is a property. The bug is testing it as if it were strong consistency. The senior pattern is <strong>poll with backoff up to a documented consistency window</strong>, and treat a never-converged read as a real failure.</p>
<pre class="code"><code>// helpers/eventually.ts — generic eventually-assert helper
export async function eventually&lt;T&gt;(
  probe: () =&gt; Promise&lt;T | null&gt;,
  predicate: (value: T) =&gt; boolean,
  opts = { timeoutMs: 2000, intervalMs: 25, label: 'condition' },
): Promise&lt;T&gt; {
  const start = Date.now();
  let last: T | null = null;
  while (Date.now() - start &lt; opts.timeoutMs) {
    last = await probe();
    if (last != null && predicate(last)) return last;
    await new Promise(r =&gt; setTimeout(r, opts.intervalMs));
  }
  throw new Error(
    \`eventually(\${opts.label}) did not converge in \${opts.timeoutMs}ms. Last value: \${JSON.stringify(last)}\`,
  );
}</code></pre>
<pre class="code"><code>// orders-consistency.test.ts
import { eventually } from './helpers/eventually';

it('order created in Service A is visible in Service B within consistency window', async () =&gt; {
  // Arrange + act — single write to A
  const { orderId } = await serviceA.post('/orders', { userId: 'u-1', total: 42 });

  // Assert — poll B until it converges OR timeout fails the test
  const order = await eventually(
    () =&gt; serviceB.get(\`/orders/\${orderId}\`).then(r =&gt; r.status === 200 ? r.data : null),
    o =&gt; o.id === orderId && o.total === 42,
    { timeoutMs: 2000, intervalMs: 25, label: 'order visible in B' },
  );

  expect(order.status).toBe('NEW');
});</code></pre>
<h4>What the timeout is</h4>
<ul>
<li><strong>~4× the documented p99 lag.</strong> If your SLO says "data is consistent in B within 500ms p99", use a 2s timeout. Tight enough to fail fast on a real broken system; generous enough to absorb GC pauses.</li>
<li>If the timeout is too short, the test is flaky. If it's too long, real propagation failures look like slowness, not bugs.</li>
</ul>
<h4>What you must NOT do</h4>
<ul>
<li><strong><code>setTimeout(2000)</code> then a single assertion.</strong> That's a sleep, not a poll. Real-system convergence is much faster than your sleep — you slow CI for no reason. And when convergence is slow, the test STILL fails (the sleep didn't help).</li>
<li><strong>Read-your-own-write on B immediately after writing to A.</strong> That's testing strong consistency, which isn't the contract.</li>
<li><strong>Polling without a timeout.</strong> A broken event bus = test hangs forever in CI.</li>
</ul>
<h4>Causal consistency — the harder case</h4>
<p>If Service B fans out to C and D, a test for end-to-end propagation needs to either:</p>
<ol>
<li>Poll the <em>final</em> read model (D) — but then a failure tells you nothing about <em>where</em> propagation broke.</li>
<li>Poll each hop and report which one missed convergence. More instrumentation; better diagnosis.</li>
</ol>
<p>In a payments pipeline (auth → capture → ledger → notification) the senior choice is option 2 with metrics emitted per hop. Each hop has its own <code>eventually()</code> with its own window. A test that fails at "ledger" tells you the bug is between capture and ledger — not somewhere downstream.</p>
<p><strong>Property pattern worth knowing</strong>: <em>monotonic read consistency</em>. Once B has returned <code>status=PROCESSING</code>, it must never return <code>status=NEW</code> again. Add an assertion: in a loop of 10 reads, the status is monotonic in your defined state machine. Catches a rare class of "read replica fell behind primary" bugs.</p>`
    },
    {
      id: "b3f1c007-2026-4000-8000-000000000404",
      q: "Redis cache test: assert invalidation works, TTL is honored, and design defends against cache stampede.",
      diff: "mid",
      tags: ["redis", "caching", "stampede"],
      answer: `<p>Cache testing splits into three concerns: <em>correctness</em> (right value, right TTL), <em>invalidation</em> (stale data doesn't leak), and <em>contention</em> (the cache itself does not become a single point of failure under load).</p>
<pre class="code"><code>// src/services/orders.ts — read-through cache
import { redis } from './redis';
import { db } from './db';

const TTL_SECONDS = 60;

export async function getOrder(orderId: string) {
  const cacheKey = \`order:\${orderId}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const fresh = await db.fetchOrder(orderId);
  await redis.setEx(cacheKey, TTL_SECONDS, JSON.stringify(fresh));
  return fresh;
}

export async function updateOrder(orderId: string, patch: Partial&lt;Order&gt;) {
  await db.update(orderId, patch);
  await redis.del(\`order:\${orderId}\`);    // invalidate
}</code></pre>
<pre class="code"><code>import { redis } from './redis';
import { db } from './db';
import { getOrder, updateOrder } from './services/orders';

beforeEach(async () =&gt; {
  await redis.flushDb();
  vi.spyOn(db, 'fetchOrder');
});

it('serves from cache on the 2nd read (DB hit count = 1)', async () =&gt; {
  vi.mocked(db.fetchOrder).mockResolvedValue({ id: 'o-1', total: 42 });
  await getOrder('o-1');
  await getOrder('o-1');
  expect(db.fetchOrder).toHaveBeenCalledTimes(1);
});

it('invalidates the cache on update', async () =&gt; {
  vi.mocked(db.fetchOrder)
    .mockResolvedValueOnce({ id: 'o-1', total: 42 })
    .mockResolvedValueOnce({ id: 'o-1', total: 99 });
  await getOrder('o-1');                                  // cache miss
  await updateOrder('o-1', { total: 99 });                // del
  expect(await redis.get('order:o-1')).toBeNull();
  expect(await getOrder('o-1')).toEqual({ id: 'o-1', total: 99 });   // re-cached
});

it('TTL expires after 60s — uses fake timers', async () =&gt; {
  vi.useFakeTimers();
  vi.mocked(db.fetchOrder).mockResolvedValue({ id: 'o-1', total: 42 });
  await getOrder('o-1');
  vi.advanceTimersByTime(61_000);
  await getOrder('o-1');
  expect(db.fetchOrder).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});</code></pre>
<h4>Cache stampede — the failure mode you must defend against</h4>
<p>When a popular key expires, every concurrent request misses cache and slams the DB simultaneously. 1k requests in flight, 1k DB queries, the DB falls over, the cache stays cold. Three defences, pick at least one:</p>
<ul>
<li><strong>Single-flight lock</strong> on the cache key — first miss takes a Redis lock (<code>SET key NX PX 5000</code>), refreshes from DB, releases. Other waiters poll the cache until populated.</li>
<li><strong>Probabilistic early refresh</strong> — refresh the cache before TTL with probability proportional to the time-since-set. By the time TTL hits, the data has likely been refreshed already.</li>
<li><strong>Stale-while-revalidate</strong> — serve the stale value, kick off an async refresh. Apps where 30s-stale-data is fine (product catalogs, leaderboards) love this; payment systems hate it.</li>
</ul>
<pre class="code"><code>// Test for single-flight: 100 concurrent reads on an empty cache → 1 DB hit
it('only one DB hit when 100 concurrent reads race for a cold cache', async () =&gt; {
  vi.mocked(db.fetchOrder).mockImplementation(async () =&gt; {
    await new Promise(r =&gt; setTimeout(r, 20));   // slow DB
    return { id: 'o-1', total: 42 };
  });
  await Promise.all(Array.from({ length: 100 }, () =&gt; getOrder('o-1')));
  expect(db.fetchOrder).toHaveBeenCalledTimes(1);   // single-flight defence works
});</code></pre>
<p><strong>Anti-pattern</strong>: testing the cache with no TTL and no concurrency. Production cache bugs almost never reproduce on a single-threaded happy path; they reproduce under <em>concurrent miss</em> with a slow downstream. The 100-concurrent test above catches the bug the unit test cannot.</p>
<p><strong>Senior signal</strong>: ask "what is the latency budget on the DB?". If the cache absorbs 95% of traffic and the DB serves the rest at 50ms, your stampede risk is real. If the DB is 200μs and over-provisioned, single-flight is overkill — just expire TTLs at slightly randomized offsets to scatter the misses.</p>`
    },
    {
      id: "b3f1c008-2026-4000-8000-000000000405",
      q: "Saga pattern: payment → fulfillment → invoice across 3 services. Design tests for the happy path AND rollback.",
      diff: "hard",
      tags: ["saga", "distributed", "compensation"],
      diagram: `flowchart TB
  START["Order placed"] --> PAY["Payment Service<br/>charge card"]
  PAY -->|success| FUL["Fulfillment Service<br/>reserve inventory"]
  PAY -->|failure| END_FAIL["fail order<br/>no compensation needed"]
  FUL -->|success| INV["Invoice Service<br/>generate invoice"]
  FUL -->|failure| C_PAY["compensate:<br/>refund payment"]
  C_PAY --> END_ROLL["order rolled back"]
  INV -->|success| END_OK["✓ order complete"]
  INV -->|failure| C_FUL["compensate:<br/>release inventory"]
  C_FUL --> C_PAY2["compensate:<br/>refund payment"]
  C_PAY2 --> END_ROLL`,
      answer: `<p>A saga splits a distributed transaction into a sequence of local transactions, each with a compensating action that undoes it on failure. There is no two-phase commit — failure rollback is by explicit business logic, not by the database. The test discipline is <em>verify the compensating actions actually fire</em>.</p>
<h4>The four cases to test</h4>
<table>
<tr><th>#</th><th>Scenario</th><th>Compensation expected</th></tr>
<tr><td>1</td><td>All steps succeed</td><td>None — happy path</td></tr>
<tr><td>2</td><td>Step 1 (payment) fails</td><td>None — nothing to undo</td></tr>
<tr><td>3</td><td>Step 2 (fulfillment) fails after step 1</td><td>Refund payment</td></tr>
<tr><td>4</td><td>Step 3 (invoice) fails after steps 1 + 2</td><td>Release inventory + refund payment</td></tr>
</table>
<pre class="code"><code>// orchestrator/place-order.test.ts (using Testcontainers + nock for service mocks)
beforeEach(async () =&gt; { await resetSagaState(); nock.cleanAll(); });

it('case 4: invoice fails — both prior steps are compensated', async () =&gt; {
  // Arrange — set up successful payment + fulfillment, failing invoice
  nock(PAYMENT_URL)
    .post('/charges').reply(200, { chargeId: 'ch-1', status: 'succeeded' })
    .post('/refunds').reply(200, { refundId: 'rf-1' });

  nock(FULFILLMENT_URL)
    .post('/reservations').reply(200, { reservationId: 'rs-1' })
    .delete('/reservations/rs-1').reply(200);

  nock(INVOICE_URL)
    .post('/invoices').reply(500, { error: 'INVOICE_DB_DOWN' });

  // Act
  const result = await placeOrder({ userId: 'u-1', items: [{ sku: 'A', qty: 1 }] });

  // Assert — happy path failed
  expect(result.status).toBe('ROLLED_BACK');

  // Assert — both compensations fired, in REVERSE order
  expect(nock.isDone()).toBe(true);          // all expected mocks were called
  const audit = await getSagaAudit(result.sagaId);
  expect(audit.events.map(e =&gt; e.type)).toEqual([
    'PAYMENT_CHARGED',
    'FULFILLMENT_RESERVED',
    'INVOICE_FAILED',
    'FULFILLMENT_RELEASED',   // compensation 1
    'PAYMENT_REFUNDED',       // compensation 2 (reverse order)
  ]);
});</code></pre>
<h4>The two non-obvious things to test</h4>
<ul>
<li><strong>Idempotency of compensations.</strong> The orchestrator may retry a compensation if it crashes mid-rollback. Refunding twice is a real-money bug. Every compensation handler must accept an idempotency key.
<pre class="code"><code>it('refund is idempotent across orchestrator retries', async () =&gt; {
  nock(PAYMENT_URL).post('/refunds').times(3).reply(200, { refundId: 'rf-1' });
  // Simulate 3 crashes that each retry the same compensation
  await runCompensation({ idempotencyKey: 'saga-1-step-3', amount: 42 });
  await runCompensation({ idempotencyKey: 'saga-1-step-3', amount: 42 });
  await runCompensation({ idempotencyKey: 'saga-1-step-3', amount: 42 });
  // The DOWNSTREAM (Payment service) must dedupe by idempotency key.
  expect(await getRefundsForUser('u-1')).toHaveLength(1);
});</code></pre>
</li>
<li><strong>What happens if compensation itself fails.</strong> The refund API returns 500 forever. Saga state must end up in a manual-intervention state, not a retry loop. Tests verify the state transitions to <code>NEEDS_HUMAN</code> and emits an alert.</li>
</ul>
<h4>State persistence — non-negotiable</h4>
<p>The orchestrator's state must be persisted at every step. If the orchestrator crashes between "payment charged" and "fulfillment called", on restart it needs to know to compensate the payment. Tests verify this by force-killing the process (SIGKILL, not graceful) and asserting that on restart the saga resumes from the right state.</p>
<p><strong>Senior signal</strong>: ask "what does the audit log show for a failed saga?". If the answer is "the last step's error message", the design is wrong — you need the full event timeline (started, succeeded, failed, compensated) per step, with timestamps and correlation IDs. Forensic readability matters more than line coverage on this code.</p>
<p><strong>Anti-pattern</strong>: testing only the happy path with mocked services that always return 200. You will ship a system that has never executed a compensation in test, then a payment provider has a regional outage and you discover the compensation code throws a TypeError on second-day-of-deployment.</p>`
    },
    {
      id: "b3f1c009-2026-4000-8000-000000000406",
      q: "k6 load test: ramp 0→100 VUs over 2 min, assert p95 < 1s and error rate < 0.1%. Show the full script.",
      diff: "hard",
      tags: ["k6", "performance", "load"],
      answer: `<p>k6 is the canonical 2026 load tool because the script <em>is</em> JavaScript — your QA team can read it, reviewers understand it, and the thresholds feature turns "did the system meet its SLO?" into a pass/fail boolean in CI.</p>
<pre class="code"><code>// load/orders-place.js — full script
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const placeLatency = new Trend('place_order_ms', true);
const placeErrors  = new Rate('place_order_errors');

export const options = {
  // Stage definition: how the load shape evolves
  stages: [
    { duration: '30s', target: 20  },   // warm up
    { duration: '60s', target: 100 },   // ramp to peak
    { duration: '30s', target: 100 },   // hold peak
    { duration: '30s', target: 0   },   // cool down
  ],
  // Pass/fail criteria — CI gate
  thresholds: {
    http_req_duration:               ['p(95)&lt;1000', 'p(99)&lt;2500'],  // ms
    'http_req_failed{expected:true}':['rate&lt;0.001'],                 // < 0.1%
    place_order_ms:                  ['p(95)&lt;800'],                  // tighter for the SUT
    place_order_errors:              ['rate&lt;0.005'],
  },
  // Send the result to a dashboard
  ext: { loadimpact: { name: 'place-order daily' } },
};

const BASE = __ENV.BASE_URL || 'https://staging.api.acme.test';
const TOKEN = __ENV.LOAD_TOKEN;   // ephemeral test token, never prod credential

export default function () {
  // Each VU gets a unique payload — no cross-VU state pollution
  const idempotencyKey = \`load-\${__VU}-\${__ITER}-\${Date.now()}\`;
  const res = http.post(\`\${BASE}/orders\`, JSON.stringify({
    userId: \`u-load-\${__VU}\`,
    items:  [{ sku: 'LOAD-SKU', qty: 1 }],
  }), {
    headers: {
      'Content-Type':    'application/json',
      'Authorization':   \`Bearer \${TOKEN}\`,
      'Idempotency-Key': idempotencyKey,
    },
    tags: { expected: 'true' },
  });

  const ok = check(res, {
    'status is 201':           (r) =&gt; r.status === 201,
    'has orderId':             (r) =&gt; !!r.json('orderId'),
    'response under 1s':       (r) =&gt; r.timings.duration &lt; 1000,
  });

  placeLatency.add(res.timings.duration);
  placeErrors.add(!ok);

  sleep(1);   // think time — not a delay against the SUT
}</code></pre>
<h4>What "p95 < 1s" actually means</h4>
<ul>
<li>k6 measures from request send to response receipt. Network → load balancer → app → DB → return.</li>
<li>p95 is the 95th-percentile latency. It is <strong>not</strong> the average. A system that averages 200ms but has 6% of requests at 2s fails p95 = 1s and that's the right behaviour.</li>
<li>p95 and p99 together tell you the tail story. A system with p95=500ms / p99=600ms is healthy. p95=500ms / p99=8s is a queueing problem in disguise.</li>
</ul>
<h4>CI integration</h4>
<pre class="code"><code># .github/workflows/load-test.yml
- name: Run k6 nightly load test
  uses: grafana/k6-action@v0.3
  with:
    filename: load/orders-place.js
    flags: --quiet --out json=results.json
  env:
    BASE_URL:   \${{ secrets.STAGING_API_URL }}
    LOAD_TOKEN: \${{ secrets.LOAD_TEST_TOKEN }}
# If any threshold fails, k6 exit-codes non-zero and the workflow fails.</code></pre>
<h4>What QA must own</h4>
<ul>
<li><strong>The thresholds.</strong> They are the SLO in code. When product wants a faster p95, the threshold changes — and the test will fail until the engineering work is done. That's the lever.</li>
<li><strong>Realistic data shapes.</strong> Hitting <code>/orders</code> with the same single SKU is not load — it's a single-cache-line benchmark. Inject realistic SKU/qty/userId variety via <code>SharedArray</code>.</li>
<li><strong>Cleanup.</strong> Load tests create real rows. Either run against an ephemeral env or include a teardown that uses an idempotency-tag to delete the load-created data.</li>
</ul>
<p><strong>Anti-pattern</strong>: load testing the staging environment, then declaring the prod SLO met. Stage capacity ≠ prod capacity. The right move: run against prod-shaped infra at scaled-down load and project, or run a controlled shadow-traffic test on prod with feature-flag isolation.</p>`
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
      answer: `<p>External evidence supports judgment — it doesn't replace it. The senior move is: cite the strongest benchmark you have, attach <em>your</em> current number, propose <em>your</em> target. One paragraph beats a deck.</p>
<h4>The primary benchmark in 2026: DORA</h4>
<p>For delivery health, the DORA report (annual, published by Google's DevOps Research and Assessment team) is the single most-cited and most-respected source at the exec level. Use it as your default.</p>
<table>
<tr><th>Metric</th><th>Where you find it</th><th>Cite as</th></tr>
<tr><td>Lead time for changes</td><td>git API + CI deploy log</td><td>"DORA elite: &lt; 1 day. We are at 6.2 days p50. Target: 2 days by Q4."</td></tr>
<tr><td>Deployment frequency</td><td>release tags / feature-flag service</td><td>"DORA elite: multiple per day. We deploy 3x / week. Target: daily by EOY."</td></tr>
<tr><td>Change failure rate</td><td>incident tracker tagged "caused by deploy"</td><td>"DORA elite: 0–5%. We are at 11%. Target: &lt; 8%."</td></tr>
<tr><td>MTTR</td><td>incident tracker</td><td>"DORA elite: &lt; 1 hour. We are at 4.5 hours. Target: &lt; 2 hours."</td></tr>
</table>
<p><strong>How to extract it without a vendor tool</strong>: GitHub CLI + jq + your incident tracker's API. A weekend's work; you don't need to pay for a DORA dashboard product to start the conversation.</p>
<h4>Other benchmarks worth knowing — and when</h4>
<ul>
<li><strong>State of Testing</strong> (PractiTest, annual). Useful for "our automation coverage on critical paths is X% vs the survey median Y%". Treat as directional, not authoritative.</li>
<li><strong>ISTQB body of knowledge</strong>. Useful for regulated / EU enterprise audiences where formal certification is a baseline expectation.</li>
<li><strong>ThoughtWorks Tech Radar</strong>. Useful for tool / practice signals — "Tech Radar moved property-based testing to Adopt in 2026" is a real talking point.</li>
<li><strong>Engineering blogs from peer companies</strong>. Most credible when from a company in your sector at your scale.</li>
</ul>
<h4>The format that lands</h4>
<pre class="code"><code>One paragraph, four sentences:

"[Benchmark] reports [number] for [our band]. We are at [our number].
The gap is [X]. I propose we target [our number → new number] over
[time window] by [the one thing we will do]. Risk: [what could go wrong]."</code></pre>
<h4>Failure modes to avoid</h4>
<ul>
<li><strong>Quoting the headline number out of context.</strong> "Elite teams deploy daily" without "we are a regulated B2B with monthly release ceremonies" reads as naive. Always show you understand the gap between the benchmark's cohort and yours.</li>
<li><strong>Borrowing a label.</strong> "Let's do Spotify Squads" almost always fails — the label travels, the context doesn't. Take the principle, fit the context.</li>
<li><strong>Citing without your own number.</strong> "DORA shows elite teams have lead time &lt; 1 day" is decoration unless you say what your lead time actually is. Quote sources; lean on your own data.</li>
<li><strong>Treating one benchmark as ground truth.</strong> DORA measures delivery; State of Testing measures testing practice; the two won't always agree on a single org. Pick the one that fits the conversation.</li>
</ul>
<p><strong>Senior signal</strong>: the proposal that wins always names the benchmark, the current value, the target, the lever, and the risk — in that order. Five lines, not five slides.</p>`
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
    {
      id: "b3f1c005-2026-4000-8000-000000000501",
      q: "Calculate DORA metrics for your team from CI + git. What do the four numbers tell you, and where do they lie in 2026?",
      diff: "hard",
      tags: ["dora", "metrics", "delivery"],
      diagram: `flowchart LR
  GIT["git: commits + PRs"] --> LT["Lead Time<br/>commit → prod"]
  CI["CI: deploys"] --> DF["Deployment Frequency<br/>deploys / day"]
  INC["incidents: failures + rollbacks"] --> CFR["Change Failure Rate<br/>% deploys causing incident"]
  INC --> MTTR["MTTR<br/>incident start → resolved"]
  LT --> ELITE{"Elite vs<br/>High vs<br/>Medium vs<br/>Low"}
  DF --> ELITE
  CFR --> ELITE
  MTTR --> ELITE`,
      answer: `<p>DORA (DevOps Research and Assessment) measures four delivery outcomes. They're the most defensible "is our team healthy?" lens in 2026, because they tie engineering work to business impact (frequency × stability) instead of vanity metrics (commits, story points).</p>
<h4>The four numbers — what, where from, how</h4>
<table>
<tr><th>Metric</th><th>Definition</th><th>Source</th><th>How to compute</th></tr>
<tr><td><strong>Lead Time for Changes</strong></td><td>From commit to production</td><td>git + CI/CD audit log</td><td>per merged PR: <code>deploy_to_prod_timestamp − first_commit_timestamp</code>. Aggregate p50, p95 weekly.</td></tr>
<tr><td><strong>Deployment Frequency</strong></td><td>Successful prod deploys per day</td><td>CI/CD or feature-flag service</td><td>count of <code>release</code> events in a window; per-team, per-service.</td></tr>
<tr><td><strong>Change Failure Rate</strong></td><td>% of deploys that cause a degradation</td><td>incident tracker + CI/CD</td><td><code>(deploys_causing_incident_or_rollback) / (total_deploys)</code> over 30 days. "Caused" needs a clear tag policy.</td></tr>
<tr><td><strong>MTTR (Failed-Deployment Recovery Time)</strong></td><td>Restore time after an incident or failed deploy</td><td>incident tracker</td><td>per incident: <code>resolved_at − detected_at</code>. Median, not average (1 long incident skews the mean).</td></tr>
</table>
<h4>The 2026 performance bands (DORA's own thresholds)</h4>
<table>
<tr><th>Band</th><th>Lead Time</th><th>Deploy Freq</th><th>Change Fail Rate</th><th>MTTR</th></tr>
<tr><td>Elite</td><td>&lt; 1 day</td><td>multiple / day</td><td>0–5%</td><td>&lt; 1 hour</td></tr>
<tr><td>High</td><td>1 day – 1 week</td><td>1 / day – 1 / week</td><td>5–10%</td><td>&lt; 1 day</td></tr>
<tr><td>Medium</td><td>1 week – 1 month</td><td>1 / week – 1 / month</td><td>10–15%</td><td>1 day – 1 week</td></tr>
<tr><td>Low</td><td>&gt; 1 month</td><td>&lt; 1 / month</td><td>&gt; 15%</td><td>&gt; 1 week</td></tr>
</table>
<pre class="code"><code># Minimal extraction with GitHub CLI + jq — feed into a Grafana dashboard
# Lead time per PR (merged in last 30 days)
gh pr list --state merged --search "merged:&gt;$(date -v-30d +%Y-%m-%d)" --json mergedAt,createdAt \\
  | jq '.[] | { lead_minutes: ((.mergedAt | fromdate) - (.createdAt | fromdate)) / 60 }'

# Deployment frequency — assumes prod deploy = release tag
git log --since="30 days ago" --tags --simplify-by-decoration --pretty="format:%cI %d" \\
  | grep "prod-" | wc -l</code></pre>
<h4>Where the numbers lie — the 2026 caveat</h4>
<p>DORA itself flagged in 2025–2026 that two of the four metrics degrade under AI-assisted development:</p>
<ul>
<li><strong>Deployment Frequency rises</strong> while Change Failure Rate quietly creeps up — AI-assisted PRs ship faster than they're reviewed. Track both, not just frequency, or you'll claim "elite" while quality drops.</li>
<li><strong>Lead Time falls</strong> because PR size shrinks, while time-to-incident-detection rises (smaller PRs make root cause harder). Pair with "time to detect" if AI assistance is a meaningful share of your codebase.</li>
</ul>
<h4>How to act on them as a senior QA</h4>
<ul>
<li><strong>Change Failure Rate trending up + escape rate up = your test gate is leaking.</strong> Investigate per-area: which service is responsible for the rise? Where are the test layers thin?</li>
<li><strong>Lead Time up + Deploy Frequency down = pipeline / review bottleneck</strong>, not a quality bottleneck. Don't propose more tests.</li>
<li><strong>MTTR up = observability or runbook gap</strong>, not necessarily a test gap. Drive instrumentation investment, not test investment.</li>
</ul>
<p><strong>Senior signal</strong>: cite the DORA band you're in, the trend (improving/stable/degrading), and ONE proposed lever. Naming the metrics without the trend or the lever is just executive bingo.</p>
<p><strong>Anti-pattern</strong>: gaming the numbers. Splitting commits to inflate deploy frequency, or downgrading incident severity to lower change failure rate. Both ship a story to leadership that doesn't match reality. The metrics are most useful when they make you uncomfortable.</p>`
    },
    {
      id: "b3f1c006-2026-4000-8000-000000000502",
      q: "Design a QA community of practice: charter, cadence, deliverables, success metric. Why CoP beats centre-of-excellence in 2026.",
      diff: "mid",
      tags: ["community-of-practice", "influence"],
      answer: `<p>DORA's 2026 research is unambiguous: <em>communities of practice (CoP) outperform centres of excellence (CoE)</em> on delivery outcomes. CoEs concentrate authority, slow change, and create gatekeeping; CoPs distribute expertise, accelerate change, and create network effects.</p>
<h4>Charter — one page</h4>
<pre class="code"><code># QA Community of Practice — Charter

Purpose
  Share QA expertise across team boundaries to lift the floor and
  raise the ceiling, without becoming a gate on anyone's work.

Membership
  Open. At least one QA voice from each delivery team, with rotating
  attendance. Engineers welcome — testability is everyone's job.

Out of scope
  - Approving / blocking releases (teams own that)
  - Mandating frameworks (we recommend, teams choose)
  - Owning team test suites (teams own theirs)

Sponsorship
  Director of Engineering. Sponsor attends quarterly, defends the
  group's time investment to leadership.

Decision rights
  - Recommend: yes (e.g. "we recommend Vitest over Jest for new TS work")
  - Mandate:   no
  - Veto:      no</code></pre>
<h4>Cadence</h4>
<table>
<tr><th>What</th><th>When</th><th>Output</th></tr>
<tr><td>30-min sync</td><td>Weekly</td><td>1 lightning topic (15 min) + 1 problem brought by a team (15 min)</td></tr>
<tr><td>Deep-dive workshop</td><td>Monthly</td><td>1 hour, 1 topic with hands-on (Stryker, Pact, k6 thresholds)</td></tr>
<tr><td>Retro on the CoP itself</td><td>Quarterly</td><td>are we delivering value? what to change?</td></tr>
<tr><td>External speaker</td><td>Quarterly</td><td>30 min talk from another team / company / OSS maintainer</td></tr>
</table>
<h4>Deliverables (the non-meeting work)</h4>
<ul>
<li><strong>Living playbook</strong> in the wiki: "how we test X" for each shared concern (auth, payments, eventually-consistent reads, mobile). Owned collectively, edited freely.</li>
<li><strong>Tool recommendations</strong>: not mandates. "We recommend Vitest for new TS projects; here's why; here's a 1-day migration guide for existing Jest." Teams choose.</li>
<li><strong>Internal "test conference"</strong> once a year: half day, lightning talks from teams. Cheap to organise, builds enormous goodwill.</li>
<li><strong>Mentoring pairs</strong>: a junior in one team paired with a senior in another for 1 hr / 2 weeks. Cross-pollinates patterns better than any document.</li>
</ul>
<h4>Success metric</h4>
<p>The only honest metric: <strong>are practices spreading?</strong> Three concrete proxies:</p>
<ol>
<li><strong>Cross-team PR reviews</strong>: % of PRs reviewed by someone outside the author's team. Up = the CoP is creating relationships that produce review traffic.</li>
<li><strong>Tool adoption</strong>: of the patterns the CoP recommended, how many teams adopted within 6 months? Target ≥ 50%.</li>
<li><strong>Repeat attendance</strong>: of regulars, what % attend ≥ 60% of syncs? Below 50% means the CoP isn't earning its hour.</li>
</ol>
<h4>How a CoP fails</h4>
<ul>
<li><strong>Becomes a gatekeeper.</strong> The moment the CoP can <em>block</em> a team's choice, it's a CoE in disguise. Watch this drift carefully.</li>
<li><strong>Founder dependency.</strong> If the syncs only happen when one person calls them, you don't have a community.</li>
<li><strong>Topics get stale.</strong> Without external speakers and fresh problems, attendance collapses in ~6 months.</li>
<li><strong>No exec air cover.</strong> Without a sponsor defending the time budget, the CoP gets cut in the next planning crunch.</li>
</ul>
<p><strong>Centre-of-excellence comparison</strong>:</p>
<table>
<tr><th></th><th>CoE</th><th>CoP</th></tr>
<tr><td>Authority</td><td>Centralised, can mandate</td><td>Distributed, can only recommend</td></tr>
<tr><td>Speed</td><td>Slow — adds review gates</td><td>Fast — teams self-serve</td></tr>
<tr><td>Adoption</td><td>Compliance, often grudging</td><td>Pull-driven, sticks</td></tr>
<tr><td>Risk</td><td>Bottleneck on the experts</td><td>Drifts without active stewards</td></tr>
<tr><td>DORA finding (2026)</td><td>Net negative on delivery</td><td>Net positive on delivery</td></tr>
</table>
<p><strong>Anti-pattern</strong>: a CoP that produces meeting notes and nothing else. The output of a healthy CoP is changed behaviour in other teams — measurably. If you cannot point to a concrete adoption story, you're running a book club, not a CoP.</p>`
    },
    {
      id: "b3f1c007-2026-4000-8000-000000000503",
      q: "Blameless postmortem on a P0 escape: facilitate it so it changes systems, not people. Walk through the structure.",
      diff: "hard",
      tags: ["postmortem", "incident", "facilitation"],
      diagram: `flowchart TB
  PREP["Pre-read 24h before<br/>(timeline + raw facts)"] --> KICKOFF["Kickoff<br/>Prime Directive read aloud"]
  KICKOFF --> TIMELINE["Walk the timeline<br/>'what happened, then what?'"]
  TIMELINE --> WHY["Why × 5<br/>(systems, not people)"]
  WHY --> CONTRIB["Contributing factors<br/>(no single root cause)"]
  CONTRIB --> ACTIONS["Action items<br/>each: SMART + owner + date"]
  ACTIONS --> FOLLOWUP["30-day follow-up<br/>did actions land?"]`,
      answer: `<p>A blameless postmortem treats the incident as a property of the system, not of any individual. Done well, it changes how the system behaves. Done badly, it punishes the person on shift and the next incident is hidden.</p>
<h4>The Prime Directive</h4>
<p>Read this at the top of every postmortem, verbatim:</p>
<blockquote style="border-left: 3px solid var(--accent); padding: 0 12px; margin: 8px 0;">
"Regardless of what we discover, we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand." — Norm Kerth
</blockquote>
<p>Not decoration. It changes the room.</p>
<h4>Pre-read (24h before)</h4>
<ul>
<li>Timeline of events, raw — start of issue, detection time, escalations, mitigations, resolution. With timestamps and Slack/PagerDuty links.</li>
<li>Customer impact (count + duration + severity).</li>
<li>What was working / not working in monitoring.</li>
<li>No analysis yet. Just facts.</li>
</ul>
<h4>Facilitator's running order (60–75 min)</h4>
<ol>
<li><strong>5 min — Read the Prime Directive.</strong> Out loud. Yes, every time.</li>
<li><strong>5 min — Recap impact.</strong> Number of users, dollars, downtime. The cost we are learning from.</li>
<li><strong>20 min — Walk the timeline.</strong> Facilitator reads each event aloud, asks "what happened, then what?" — fill gaps. Resist "why" until next phase.</li>
<li><strong>20 min — Contributing factors.</strong> Plural. Five-whys per factor, applied to <em>systems</em> not people. "The deploy bypassed canary because the canary stage was skipped" → "why was it skipped?" → "because the YAML default flips when the previous stage fails" → "why does it flip silently?" → "no test covers the fallback path."</li>
<li><strong>15 min — Action items.</strong> Each must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound), with a named owner and a date. No "review later" or "look into".</li>
<li><strong>5 min — Recap + close.</strong> Reread the action list. Confirm owners agree. Schedule 30-day follow-up.</li>
</ol>
<h4>Language patterns that keep it blameless</h4>
<table>
<tr><th>Avoid</th><th>Use instead</th></tr>
<tr><td>"Alice pushed without canary"</td><td>"The deployment process allowed a push without canary"</td></tr>
<tr><td>"Why didn't anyone notice?"</td><td>"What signal would have surfaced this earlier?"</td></tr>
<tr><td>"Human error"</td><td>"What in the system led the person to that action?"</td></tr>
<tr><td>"Should have known"</td><td>"What information was visible at decision time?"</td></tr>
</table>
<h4>Action item taxonomy</h4>
<ul>
<li><strong>Preventive</strong>: changes that make the same incident impossible. Highest value. Example: <em>"add a CI check that fails any deploy YAML missing the canary stage."</em></li>
<li><strong>Detective</strong>: changes that make the same incident faster to spot. Medium value. Example: <em>"alert when canary stage is skipped, not just when it fails."</em></li>
<li><strong>Restorative</strong>: changes that make recovery faster. Medium value. Example: <em>"runbook step to roll back this deploy class added to the on-call wiki."</em></li>
<li><strong>Process</strong>: changes to how we work. Use sparingly — they're the easiest to write and the hardest to enforce.</li>
</ul>
<h4>What QA owns specifically</h4>
<ul>
<li>The "what test layer could have caught this?" question. Answer must be specific: "a contract test on the upstream payload would have caught the schema drift". If the answer is "more tests", that's not an answer.</li>
<li>The traceability from the new test back to the incident — link the test ID to the incident ID in the comment. Future you will thank present you.</li>
<li>The 30-day follow-up: did the test land? Has it been removed or quarantined? An action item that quietly dies in 60 days is a failure of the process, not the engineer.</li>
</ul>
<p><strong>Anti-pattern</strong>: postmortem-as-blame-ritual where the on-call engineer narrates their decisions while others judge. A team that does this once won't volunteer for on-call again, and the next incident gets quietly buried. The Prime Directive isn't HR theatre — it's why you'll hear about the next incident at all.</p>`
    },
    {
      id: "b3f1c008-2026-4000-8000-000000000504",
      q: "Set Q3 OKRs for the QA function: 3 Objectives, 2 KRs each, all quantified, all defensible at exec level.",
      diff: "hard",
      tags: ["okrs", "goals", "strategy"],
      answer: `<p>QA OKRs done badly read like task lists ("write more tests"). Done well, they tie testing investment to business outcomes the exec recognises: time-to-market, customer impact, infrastructure cost.</p>
<h4>The three objectives — each is a sentence about an outcome, not an activity</h4>
<h4>O1 — Ship faster without lowering the quality floor</h4>
<ul>
<li><strong>KR1.1</strong>: median PR-to-prod lead time falls from 26 hours to ≤ 12 hours.<br/>
  <em>Source</em>: GitHub API + deployment audit log. <em>Risk</em>: lead time can fall while change-fail rate rises — KR1.2 guards this.</li>
<li><strong>KR1.2</strong>: change failure rate stays ≤ 8% (current 7.2%).<br/>
  <em>Source</em>: incident tracker tagged "caused by deploy". <em>Why this matters</em>: prevents O1 from becoming a "ship faster, break more" trap.</li>
</ul>
<h4>O2 — Reduce production escapes on high-value customer journeys</h4>
<ul>
<li><strong>KR2.1</strong>: defect escape rate on top-5 user journeys (login, checkout, search, account-settings, support-ticket) falls from 6.4% to ≤ 3%.<br/>
  <em>Source</em>: monthly QA review of prod incidents tagged by journey. <em>Why specific journeys</em>: the absolute number hides the bad spots — 6.4% total may include 18% on checkout.</li>
<li><strong>KR2.2</strong>: mean-time-to-detect on these journeys falls from 47 min to ≤ 15 min.<br/>
  <em>Source</em>: detection time (first alert → first triage) in the incident tracker. <em>Why this matters</em>: catching faster is half of customer-impact reduction.</li>
</ul>
<h4>O3 — Make the test suite an asset, not a tax</h4>
<ul>
<li><strong>KR3.1</strong>: end-to-end CI time falls from 38 min p95 to ≤ 18 min p95, without reducing test count.<br/>
  <em>Source</em>: CI dashboard. <em>How</em>: parallelisation, sharding, contract tests replacing E2E coverage on stable paths.</li>
<li><strong>KR3.2</strong>: rolling 4-week flakiness rate drops from 4.1% to ≤ 1.5% on the critical-path suite.<br/>
  <em>Source</em>: CI metrics. <em>Why this matters</em>: high flakes erode test trust and ultimately get the suite ignored.</li>
</ul>
<h4>Why these work at the exec level</h4>
<ul>
<li><strong>Every KR has a number, a current value, and a source.</strong> Disagreement happens about the targets, not the existence of the metric.</li>
<li><strong>Each Objective ties to a business concern</strong> a non-QA leader cares about — speed, customer experience, cost.</li>
<li><strong>The Objectives have built-in tension</strong> (faster + safer + cheaper). Honest tension prevents goodharting any single metric.</li>
<li><strong>The metrics are tracked daily on the dashboard already.</strong> No new tooling = no excuse not to report.</li>
</ul>
<h4>The conversation when leadership says "make the targets more ambitious"</h4>
<p>Use the data you already have:</p>
<ul>
<li>"Lead time from 26h to 12h is the 75th-percentile improvement in the State of DevOps 2025 cohort for our band — moving to 4h would put us in the top 5% and requires investment we haven't budgeted."</li>
<li>"Escape rate from 6.4% to 3% halves customer impact. Going to 1% means doubling QA capacity or accepting a 40% throughput drop. Pick which trade-off you want."</li>
</ul>
<p>The senior move is not to argue against ambition — it's to make the cost of each level of ambition concrete enough that the exec picks.</p>
<h4>What NOT to put in OKRs</h4>
<ul>
<li><strong>"Achieve 90% test coverage."</strong> Vanity. Coverage can rise while assertions weaken. (Mutation score is a better metric and even that doesn't belong as an OKR.)</li>
<li><strong>"Implement framework X."</strong> Activity, not outcome. The exec doesn't care what you used; they care what changed.</li>
<li><strong>"Improve QA team morale."</strong> Important, doesn't belong here. Use eNPS in HR's domain.</li>
<li><strong>"Reduce P0 incidents."</strong> Too dependent on what the rest of the org ships. Use escape rate normalised to delivery volume instead.</li>
</ul>
<p><strong>Anti-pattern</strong>: 7 Objectives with 5 KRs each. The team can't prioritise; everything is a top priority means nothing is. Three Objectives is plenty for a quarter. If you have more, you have a list, not a focus.</p>`
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
