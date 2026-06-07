# Feedback Coverage — Interview-Validated Definition of Done

This file maps the **5 feedback points** you received from a senior QA
interview to the specific questions in the app that close each gap.

When you re-interview, you can point at this file as evidence that the
feedback was taken seriously and addressed concretely.

---

## Source feedback (verbatim)

> 1. Basic test management practices.
> 2. Increase confidence in the testing strategy as an overall practice,
>    not just automation.
> 3. Be eager to research a wider range of frameworks and libraries that
>    could be used for automation to support lower validation levels.
> 4. Enhance knowledge of API testing and database testing (SQL & NoSQL).
> 5. Boost confidence to enable improvements in testing approaches, not
>    limiting to the team's processes.

Result: **+26 new questions, 5 targeted rewrites**, corpus moved
155 → 181 Qs. Hard cap was 190; finished under it.

---

## Point 1 — Basic test management practices

**Hosts these new + updated questions in `Growth: Test Management`:**

| # | Q | Diff | Type |
|---|---|---|---|
| 1 | Define measurable exit criteria for a payment feature release | mid | NEW |
| 2 | You inherit 5,000 test cases, 1,200 ran — clean it up | hard | NEW |
| 3 | Severity vs priority: rubric + defending a P1 call | mid | NEW |
| 4 | Release readiness checklist — 10 things | mid | NEW |
| 5 | Test-metrics dashboard the senior QA reviews daily | hard | NEW |
| 6 | Requirements traceability (now with a worked matrix + gaps) | mid | REWRITE |

Coverage now spans: planning, atomic case design, traceability matrix
(with worked gap example), defect lifecycle + severity rubric, exit
criteria, portfolio hygiene, release governance, metrics. CTAL-TM
v4.0 syllabus areas all touched.

---

## Point 2 — Testing strategy beyond automation

**Hosts these new + updated questions in `Growth: Testing Strategy`:**

| # | Q | Diff | Type |
|---|---|---|---|
| 1 | SBTM — design a 90-min charter + debrief + findings doc | hard | NEW |
| 2 | When should a test stay manual — 3 scenarios + cost framing | mid | NEW |
| 3 | 50 cases, automate 20 — risk × ROI matrix | hard | NEW |
| 4 | Shift-left in practice — what specifically devs unit-test | mid | NEW |
| 5 | Canary deployment as a test strategy — SLOs + auto-rollback | hard | NEW |
| 6 | Exploratory testing value (now with a real charter + findings) | mid | REWRITE |

Coverage now spans: pyramid + alternatives, risk-based, exploratory
with structure (SBTM, BBST-aligned), manual-vs-automate cost framing,
prioritisation under constraint, shift-left in code-specific terms,
canary as a deliberate test strategy with measurable SLOs.

---

## Point 3 — Wider frameworks at lower validation levels

**Hosts these new + updated questions in `Growth: Automation Frameworks`
and `Testing Theory`:**

| # | Q | Diff | Type |
|---|---|---|---|
| 1 | Vitest unit test with mocks and spies — error path | mid | NEW |
| 2 | RTL: query by role vs CSS, brittle vs resilient | mid | NEW |
| 3 | MSW: intercept API in component tests, happy + error | mid | NEW |
| 4 | Stryker mutation report — killed/survived/timeout + fix | hard | NEW |
| 5 | Property-based testing with fast-check — boundary bug catch | hard | NEW |
| 6 | Testcontainers: Postgres + Redis, isolation between workers | hard | NEW |
| 7 | Mutation testing (now with operators + heuristic + scoring) | hard | REWRITE |

External sources cited: Vitest 2.0 benchmarks vs Jest 30
(reintech.io), MSW canonical setup, ThoughtWorks Tech Radar
(April 2026) on mutation testing, fast-check GitHub.

Lower-validation-level coverage is now broad: unit (Vitest), component
(RTL + MSW), property-based (fast-check), mutation (Stryker),
integration (Testcontainers).

---

## Point 4 — API + DB testing (SQL + NoSQL)

**Hosts these new + updated questions in `Growth: API & DB Testing`
and `REST API`:**

| # | Q | Diff | Type |
|---|---|---|---|
| 1 | MongoDB aggregation pipeline — top-3 per category | hard | NEW |
| 2 | DynamoDB access patterns — partition key + GSI | hard | NEW |
| 3 | Eventual consistency — bounded-poll test pattern | hard | NEW |
| 4 | Redis cache: invalidation, TTL, stampede defense | mid | NEW |
| 5 | Saga pattern across 3 services — happy + rollback | hard | NEW |
| 6 | k6 load test with p95 + error-rate thresholds | hard | NEW |
| 7 | REST response validation beyond status (now deeper) | mid | REWRITE |

SQL was already strong (12 senior-grade Qs). This pass closes the
NoSQL gap (MongoDB aggregation, DynamoDB single-table design, Redis
caching), the distributed-systems gap (eventual consistency, Saga
compensation), and the performance gap (k6 with real thresholds).

External sources cited: Bytebase 2026 MongoDB vs DynamoDB comparison,
ScyllaDB eventual-consistency glossary, k6 thresholds documentation.

---

## Point 5 — Drive improvements beyond team processes

**Hosts these new + updated questions in `Growth: Driving Improvements`:**

| # | Q | Diff | Type |
|---|---|---|---|
| 1 | Calculate DORA metrics — what the four numbers say in 2026 | hard | NEW |
| 2 | QA Community of Practice — charter, cadence, success metric | mid | NEW |
| 3 | Blameless postmortem — facilitation that changes systems | hard | NEW |
| 4 | Set Q3 OKRs for QA — 3 Objectives, 2 KRs each, quantified | hard | NEW |
| 5 | Anchor proposals in external benchmarks (now DORA-led) | mid | REWRITE |

Coverage now spans: change management, DORA literacy, community
patterns (CoP > CoE per DORA 2026 research), incident learning, and
goal-setting at the function level. Each Q has at least one concrete
artefact (charter, OKR set, postmortem structure, dashboard).

External sources cited: DORA Insights 2026 research program
(dora.dev), "DORA Metrics Are Not Enough in 2026" (oobeya.io) for
the AI-throughput caveat.

---

## How to use this file in your next interview

When the same five gap areas come up — and they will, because they
are the standard CTAL-TM + senior-SDET signal set — you can:

1. Reference the Q titles by name in your answer (interviewers
   respect specificity).
2. Walk one of the worked examples (the traceability matrix, the
   SBTM debrief, the OKR set) from memory — they're concrete enough
   to discuss in detail.
3. Cite the external sources where appropriate (DORA, ThoughtWorks
   Tech Radar, ISTQB CTAL-TM v4.0) — shows you read the field, not
   just the JD.

---

## Cap discipline reminder

Corpus: **181 Qs** across 18 categories. Hard cap: 190.

We're under cap by 9 Qs. Resist filling the cap unless the next
interview surfaces a *new* gap not in this list. If it does, add to
this file as Point 6, propose Qs, then write them — same process as
this round.
