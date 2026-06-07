# Task 2 — Technical Plan: Design Patterns + Domain-Specific Test Strategy

## Why this exists

After the Task 1 cut (261 → 243 Qs), two real gaps remain in the corpus:

1. **No design-patterns category for automation frameworks.** The
   `frameworkArch` and `automationFrameworks` categories talk about *which
   framework* to pick and *how to organise files*, but never name the
   GoF / Fowler patterns that senior interviews probe (Page Object,
   Screenplay, Builder, Strategy, Factory, Singleton-trap, Decorator,
   Adapter, Observer, Command, etc.) or contrast them with their actual
   trade-offs.
2. **No domain-specific test-strategy material.** A senior QA in
   logistics, healthcare, payments, e-commerce, or medical/regulated
   tests *very* differently from a SaaS QA. The corpus is generic — it
   teaches "test the pyramid" but never "this is what testing looks like
   when downtime costs €40k/min in payments, or when you need
   ISO 13485 traceability in medical."

This plan adds both in **6 small chunks** so each can land independently,
each ships ≤ 12 questions, and the corpus stays under ~310 Qs total —
not back to the bloated 297 we started with.

---

## Scope guardrails

- **Cap total Qs at ~310** post-Task-2 (currently 243). That's ~67 new Qs
  spread across 6 chunks. Hard ceiling — if a chunk threatens it, trim
  before merging.
- **No new top-level categories beyond two:** "Design Patterns &
  Architecture" (new) and "Domain Playbooks" (new). Everything else
  extends existing categories.
- **One PR / one commit per chunk.** Easier to review, easier to roll
  back if one chunk's quality is off.
- **Quality gate:** every new Q includes at least one of {code example,
  diagram, decision table, anti-pattern callout}. Pure prose Qs don't
  ship.

---

## Chunk 1 — Design Patterns for Test Frameworks (Part A: Creational + Structural)

**New category: `designPatterns` (~10 Qs)**

Authoring focus: GoF-style patterns *as they appear in test code*, not as
academic OOP exercises. Each Q shows the pattern, the test-code use case,
and the anti-pattern.

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | Page Object Model — pure form vs. what real POMs become at scale | mid | Pure POM, fluent POM, fixture-backed POM. Anti-pattern: assertions inside POM methods. |
| 2 | Screenplay pattern — when does it earn its overhead over POM? | hard | Actor / Task / Question / Ability. Pros for complex workflows, cons for simple smoke. |
| 3 | Builder pattern for test data — fluent vs. partial-override | mid | `UserBuilder.with(...).build()`. Compare to plain factory function. |
| 4 | Factory pattern — when do you actually need it in test code? | mid | Often over-applied. Plain functions usually beat a factory class for fixtures. |
| 5 | Singleton — the test-code trap | mid | A shared driver/page singleton looks elegant, kills parallelism. Show fix with worker-scoped fixtures. |
| 6 | Decorator — adding retry / timing / logging without polluting test code | hard | Higher-order function wrappers. TS generic preservation. |
| 7 | Adapter — wrapping a flaky third-party SDK behind a stable test interface | mid | Insulates tests from vendor churn (Stripe SDK 2 → 3). |
| 8 | Composite — building scenario suites from atomic steps | mid | BDD step composition without Cucumber overhead. |
| 9 | Facade — a single test-API surface over messy infra (DB seed + API auth + UI nav) | mid | The "TestContext" pattern. |
| 10 | Prototype — cloning a base test state for variants | easy | `structuredClone` for fixture variants. Avoids cross-test contamination. |

**Definition of done:** category appears in sidebar with progress
tracking; each Q has a working TS/Playwright code example.

---

## Chunk 2 — Design Patterns for Test Frameworks (Part B: Behavioral + Best Practices)

**Extends `designPatterns` (~10 more Qs)**

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | Strategy pattern — switching auth strategies (fast/login UI/storage state) | mid | One test, three strategies, picked by env. |
| 2 | Observer / Event-driven — listening to test events for custom reporters | hard | Playwright reporter API; Datadog/Allure integration. |
| 3 | Command pattern — recording + replaying test actions | hard | Useful for cross-browser parity testing. |
| 4 | Chain of Responsibility — graceful test-failure handlers | mid | Screenshot → trace → notify → log. |
| 5 | Template Method — base class for shared test setup, hook overrides | mid | When this beats a fixture; when it doesn't. |
| 6 | State pattern — modeling a UI under test (logged-out → logging-in → logged-in) | hard | Tests that traverse the state machine explicitly. |
| 7 | SOLID applied to test code: which principle bites hardest? | hard | Open/closed for POM extension; single-responsibility for fixtures. |
| 8 | DRY vs DAMP in tests — when duplication is actually correct | mid | Tests are read more than refactored. |
| 9 | "Arrange, Act, Assert" — formal version vs. real-world variations | easy | Given/When/Then mapping; multi-act anti-pattern. |
| 10 | The "Test Pyramid of Patterns" — which patterns belong at which test level | hard | Unit: Factory/Builder. Integration: Adapter/Facade. E2E: POM/Screenplay. |

**Definition of done:** the 20 design-pattern Qs together cover every
pattern a senior interviewer is likely to probe, each with a working
example.

---

## Chunk 3 — Test Plan Authoring (How to actually write one)

**Extends `testManagement` (~8 Qs)**

The category currently has 10 Qs on what *belongs* in a test plan but
not enough on the actual authoring craft. Add:

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | The IEEE 829 / ISO 29119 test-plan template — what to keep, what to skip in 2026 | mid | Old standard, still pragmatic for sections to include. |
| 2 | Test plan vs. test strategy — write the same project as both, contrast | mid | Strategy = stable policy; plan = per-release. |
| 3 | RACI for a multi-team test plan | mid | Who's Responsible / Accountable / Consulted / Informed. |
| 4 | Entry & exit criteria — concrete numeric examples (not "code is stable") | mid | Coverage %, escape rate, P0 count, perf budget. |
| 5 | Test estimation — three techniques (analogous, three-point PERT, capacity-based) | hard | When each fits. Reality of QA estimates. |
| 6 | The "1-page test plan" — when senior QA writes nothing more | mid | For small feature releases; what makes the cut. |
| 7 | Test plan reviews — how to run one without it becoming theatre | mid | Pre-read, focused agenda, action items. |
| 8 | Living test plans — how to keep one alive in an agile environment | mid | Anti-pattern: the test plan written once, never opened. |

**Definition of done:** a QA candidate could write an end-to-end test
plan from the corpus alone, in any of the standard templates.

---

## Chunk 4 — Domain Playbook: Payments + E-commerce

**New category: `domainPlaybooks` (~10 Qs, first batch)**

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | Payments: what's different about testing money? | hard | Idempotency, exact decimals, fraud signals, PCI scope. |
| 2 | Payments: 3DS / SCA flows — testing the redirect dance | hard | Sandbox creds, success/failure/timeout, regulatory edge. |
| 3 | Payments: refund + chargeback + reversal — three states people confuse | mid | When each fires, who initiates, test data setup. |
| 4 | Payments: testing across a payment-method matrix (cards / wallets / SEPA / BNPL) | hard | Why "one card" smoke isn't enough; tooling (Stripe test cards). |
| 5 | Payments: settlement vs. authorization — the bug class that ships every year | mid | Auth succeeds, capture fails, customer sees double charge. |
| 6 | E-commerce: cart + inventory race conditions | hard | Two users, one item; FOR UPDATE locks; testing concurrency. |
| 7 | E-commerce: pricing / promo / coupon interactions | mid | Decision table — multi-promo stacking is the bug source. |
| 8 | E-commerce: search relevance testing | hard | Not "did search return results" but "did it return the *right* results". Synonyms, typo tolerance. |
| 9 | E-commerce: international taxes & currencies | mid | Rounding rules per country; tax-inclusive vs exclusive display. |
| 10 | E-commerce: GDPR data deletion across order history | mid | "Right to be forgotten" — what stays (legal), what goes. |

**Definition of done:** any QA candidate interviewing at Stripe, Adyen,
Klarna, Mollie, Zalando, eMAG, or Shopify can use these 10 Qs as their
primary domain prep.

---

## Chunk 5 — Domain Playbook: Healthcare + Medical Devices

**Extends `domainPlaybooks` (~8 Qs)**

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | Healthcare regulated software (IEC 62304) — what changes for QA? | hard | Class A/B/C, doc requirements, traceability obligation. |
| 2 | ISO 13485 quality system — how QA evidence is collected differently | hard | Records, audit trails, immutability. |
| 3 | HIPAA / GDPR-Health — test data must never be real PHI | mid | Synthetic data generators, masking, audit. |
| 4 | Medical UI: the "do no harm" assertion — testing safety alarms | hard | Critical alarms must fire even under DB failure; chaos test. |
| 5 | EHR / FHIR API testing — schema validation against HL7 standards | mid | Required fields per profile; backward compat across FHIR versions. |
| 6 | Medical devices: hardware-in-the-loop testing — when emulators lie | hard | Sensor noise, real timing, fail-safe states. |
| 7 | Clinical decision support: testing without practising medicine | mid | Edge cases without claiming therapeutic outcomes. |
| 8 | Healthcare release cycles — why they're slow and how QA fits | mid | Validation runs, formal approval gates; no "hotfix to prod". |

**Definition of done:** any QA candidate interviewing at Roche, Siemens
Healthineers, Philips Health, Babylon, Doctolib, or a medical-devices
startup has domain-specific prep.

---

## Chunk 6 — Domain Playbook: Logistics + (Stretch) Automotive Safety

**Extends `domainPlaybooks` (~8 Qs)**

| # | Question | Diff | Notes |
|---|---|---|---|
| 1 | Logistics: testing route optimisation — the oracle problem | hard | "Did the route get *better*?" — no perfect oracle. Property-based testing. |
| 2 | Logistics: time-zone bugs at scale — pickup vs. delivery windows | mid | DST transitions; cross-border. Concrete data. |
| 3 | Logistics: tracking / event sourcing — testing immutable event streams | hard | Out-of-order events, late arrivals, replays. |
| 4 | Logistics: warehouse barcode / RFID scan testing | mid | Misreads, duplicates, scanner offline; reconciliation. |
| 5 | Logistics: last-mile delivery — testing real-world failures (no signal, address wrong) | mid | Graceful degradation; retry strategies. |
| 6 | Automotive (ISO 26262): ASIL ratings and how QA maps to them | hard | ASIL-D vs ASIL-A test rigour; V-model in safety context. |
| 7 | Automotive: HIL (hardware-in-the-loop) vs SIL (software-in-the-loop) | hard | Where each finds bugs; cost trade-off. |
| 8 | Automotive: AUTOSAR / SOME-IP message testing | hard | Why you can't test these from a web stack mindset. |

**Definition of done:** the `domainPlaybooks` category totals ~26 Qs
across 3 domains. Candidate can speak credibly to logistics
(DHL/FedEx/Maersk/Cargus), automotive (Continental/Bosch/Stellantis),
and the prior payments + healthcare verticals.

---

## What this plan deliberately does NOT include

- **No new "ISTQB Fundamentals" path.** Decided "pause until target job
  is clear" in the previous session. If automotive is the target, this
  chunk is added; otherwise skipped.
- **No "Deep Automation Engineering" path as a *separate* category.** The
  design-patterns Chunks 1–2 cover the architectural depth a senior SDET
  interview probes. Adding a third category here would re-widen the
  corpus exactly when we just narrowed it.
- **No accessibility / mobile / security-beyond-auth Qs.** Real gaps,
  but per the finalopinion.md decision they belong in a follow-up
  audit, not in the Task 2 scope.
- **No retroactive rewrite of the AUDIT.md top-10 thin answers.** That's
  a separate quality-polish pass; tracked but not in this plan.

---

## Execution order & estimated effort

| Chunk | Effort (writing + verify) | Net Qs added |
|---|---|---|
| 1. Design Patterns A | 3–4 hr | +10 |
| 2. Design Patterns B | 3–4 hr | +10 |
| 3. Test Plan Authoring | 2 hr | +8 |
| 4. Payments + E-commerce | 3–4 hr | +10 |
| 5. Healthcare | 2–3 hr | +8 |
| 6. Logistics + Automotive | 2–3 hr | +8 |
| **Total** | **~16–20 hr** | **+54** |

Final corpus size: 243 + 54 = **297 Qs across 20 categories** — back to
roughly the pre-cut size but with the bloat replaced by targeted senior
material, not generic JS fundamentals.

---

## Per-chunk verification

Every chunk's PR/commit must pass:
1. `npm run typecheck` clean
2. `npm test` 43/43 (integrity invariants)
3. `npm run build` succeeds
4. Sidebar shows the new category with the right Q count
5. At least 3 random Qs in the new chunk are spot-read by the user
   before merge — quality gate, not just shape gate.

---

## Open decisions before Chunk 1 starts

1. **Naming.** Confirm `designPatterns` and `domainPlaybooks` as category
   IDs. They become URL slugs / state keys forever.
2. **Chunk 1 priority.** Start with Design Patterns (cross-domain
   value) or with Payments domain (concrete, urgent for some target
   roles)? Recommend Design Patterns A.
3. **Hand-pick anchor frameworks.** All examples in TS/Playwright, or
   include one Cucumber/Selenium contrast Q per chunk? Recommend
   TS/Playwright primary, single contrast Q only where it changes the
   pattern's shape.

Answer these three when you're ready to start Chunk 1; everything else
is in the plan.
