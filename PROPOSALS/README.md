# Proposals

Short, structured write-ups that argue for a change to how we work.
The goal is to make "let's do this differently" cheap to write, easy to
review, and possible to measure after the fact.

## Template

Every proposal follows the same five-section shape. Keep each section to
a few sentences; this is a memo, not a design doc.

1. **Current state.** What we do today and how it works on this repo.
   Cite specific files, commits, or metrics so the reader can verify
   without asking.
2. **Problem.** What's wrong, and what evidence makes it a problem.
   Friction, incidents, metrics, or escaped defects — not personal
   preference.
3. **Proposed change.** The smallest thing that addresses the problem.
   Code-level if it's a code change, process-level if it's a process
   change.
4. **Expected impact.** What gets better and (honestly) what might get
   worse. Order-of-magnitude estimates beat false precision.
5. **How we'd measure it.** The metric, the baseline, and the threshold
   that means "this worked." If you can't measure it, say so and
   explain why it's still worth doing.

External benchmarks (ISTQB material, state-of-testing reports, talks,
postmortems from other orgs) belong inline — link them where they back
a specific claim.

## Naming

Files are numbered chronologically: `001-short-slug.md`. The slug stays
short enough to fit in a PR title.

## Index

- [001 — Fix `onConflict` mismatch in `useQuestionMeta`](./001-onconflict-mismatch.md)
