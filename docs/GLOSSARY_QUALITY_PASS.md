# Glossary Quality Pass: Fresh Full Re-Pass of the Durable Layer (ACTIVE CAMPAIGN)

> **Resuming in a fresh session? Start here.** Read this whole file, then `content/glossary/README.md`
> (the voice contract) and Sessions 13 and 15 in `LESSONS_LEARNED.md`, then continue from **Status** at
> the bottom. The work is **linear, main-thread, full Opus 4.8 strength, NO subagents for drafting**
> (the one carve-out: a subagent may run the adversarial opening-sentence audit, which is verification,
> not writing). **Commit per category sub-batch.** The git log ("fresh-pass <category>" subjects) and
> the checklist below are the durable progress ledger that survives a session cap or hardware fault.

## What This Is, and How It Differs From Onboarding

Two glossary campaigns exist, with opposite shapes:

- **This campaign (the quality pass)** RE-PASSES the existing durable entries: re-read every one and
  re-elevate it to the earned-vividness bar. It does not change the durable count.
- **Onboarding** (`docs/GLOSSARY_ONBOARDING.md`) AUTHORS net-new entries for corpus-discovered concepts
  that have none. It raises the durable count.

Eric's decision: run the quality pass over all existing entries first (Phase A), then resume onboarding
(Phase B). This file owns Phase A. `docs/GLOSSARY_ONBOARDING.md` owns Phase B.

## Why This Exists

The prior full enhancement of the durable layer completed on 2026-06-04 for the **551** entries that
existed then (Sessions 13 and 15; see the 81 "fully enhance" commits in the git log). Since then the
onboarding campaign added **49 entries** (now **600 durable**) that were never put through the Session 15
bar, and they cluster in `ai-engineering` and `industry`. The triage oracle (`scripts/glossary_triage.mjs`)
on the current 600 shows the thin and copular-lead entries concentrated in exactly those onboarding-era
clusters. So the highest-yield work is to bring the post-2026-06-04 entries up to the bar, then re-read
the rest with fresh eyes, pushing each further where it can honestly improve.

## The Method (distilled from Sessions 13 and 15; full voice contract in `content/glossary/README.md`)

- **Open on the problem, tension, consequence, concrete instance, or misconception.** Never a copular or
  provenance lead ("X is a type of ...", "X, introduced by Y in YYYY, is ..."). The term may be defined
  inside paragraph one, just not as the first move.
- **Mechanism as deliberate engineering choices with reasons**, not a neutral feature list.
- **Exactly one memorable keeper** that does real explanatory work (an analogy, a surprising consequence,
  or an honestly named limit). Deleting it should make the concept harder to grasp.
- **End on a tension, a limit, or the deepest structural insight**, never a "see also" or applications
  roll-call. The last sentence should be worth remembering out of context.
- **Distinct-keeper discipline across a cluster:** hold the whole category in mind; where an insight
  recurs across `related` neighbors, make it the explicit keeper of exactly ONE entry and reference it
  lightly in the others, so no two neighbors land the same thesis. This is the load-bearing craft.
- **No em dash (U+2014)** anywhere. **Title Case** title and `##` subheadings. 3 to 6 paragraphs; vary
  structure across entries.
- **Read to decide, never regex-verdict:** `scripts/glossary_triage.mjs` is a prioritization hint
  (about 90 percent false-positive on the dict-lead flag), not a verdict.
- **Quality over motion:** the bar is "did I add one thing a smart reader keeps." Where an entry already
  holds its keeper and cannot be honestly improved, leave it byte-identical rather than churn it.
- **Capture sources** consulted into `content/glossary/sources.json` as you go, and verify any quotation
  against a primary source (the apocryphal Arthur Samuel quote was caught this way last time).

## The Procedure (repeat per category sub-batch)

1. Read the whole category (frontmatter plus openings at least) to map the keepers before rewriting, so
   the distinct-keeper discipline can hold.
2. Edit `content/glossary/<category>/*.md` in sub-batches of about 6.
3. `npm run glossary` to rebuild the served artifacts.
4. `npm test` and `npm run check:generated`: all gates green, no artifact diff after the rebuild. Fix
   every failure (em dash, dangling `related`, ambiguous alias) before committing.
5. Run the adversarial opening-sentence audit for the sub-batch (subagent allowed here): quote each
   opener, judge whether it would appear near-verbatim in the encyclopedia lede, fix any that would.
6. `git add content/glossary public/data`, then commit. Subject:
   `Glossary: fresh-pass <category> part N (slugA, slugB, ...)`. **Do NOT push** until a milestone or stall.
7. Tick the category in the checklist below in the same commit when it is fully re-passed.

## Gotchas

- A re-pass keeps `durable_count` at 600, so the `check_doc_accuracy` count gate does NOT fire in Phase A.
  But the rewritten bodies regenerate `public/data/glossary`, so commit those artifacts alongside the
  content or `check_generated_fresh` fails.
- The rewrites change embeddings; the worker re-embeds `glossary::` vectors on its next run, so the static
  prose is live immediately while semantic-search ranking lags. Expected, not a bug.
- PowerShell mangles inline `node -e` quotes and embedded double-quotes in `git commit -m`. Use single
  quotes, a throwaway `.mjs`, or `git commit -F <tempfile>` for multi-line messages.

## Category Checklist (33 categories, 600 entries; tick when fully re-passed)

**Wave 1, highest headroom (onboarding-era and thin-heavy):**
- [x] ai-engineering (25; 24 never audited, 2 thin) done 2026-06-07
- [ ] industry (5; wholly onboarding-era)
- [ ] evaluation (26; 2 new, 4 thin)
- [ ] nlp (22; 1 new, 5 thin)
- [ ] agents (22; 4 new, 1 thin)
- [ ] alignment (30; 6 new)
- [ ] generative-models (21; 2 new)
- [ ] rag-embeddings (21; 1 new)
- [ ] systems (21; 2 new)
- [ ] optimization (21; 2 thin)

**Waves 2 and on (the Session-15-enhanced categories; push further or leave byte-identical):**
- [ ] foundations (14)
- [ ] core-ml (31)
- [ ] linear-algebra (15)
- [ ] calculus (12)
- [ ] probability (16)
- [ ] probabilistic-ml (12)
- [ ] geometry (14)
- [ ] graph-geometric (12)
- [ ] advanced-math (14)
- [ ] optimization-advanced (13)
- [ ] learning-theory (13)
- [ ] dl-theory (13)
- [ ] deep-learning (19)
- [ ] transformers (30)
- [ ] training (22)
- [ ] inference (27)
- [ ] reinforcement-learning (19)
- [ ] vision (19)
- [ ] interpretability (15)
- [ ] frontier (15)
- [ ] cognitive-science (13)
- [ ] philosophy (14)
- [ ] philosophy-advanced (14)

## Status (UPDATE PER CATEGORY)

As of **2026-06-07**: **1 of 33 categories re-passed** (ai-engineering). Nothing pushed yet. Resume from
the first unticked Wave 1 category (industry). After Phase A completes, switch to `docs/GLOSSARY_ONBOARDING.md`
for Phase B (the ~304 genuinely-new concepts).

Per-category notes:
- **ai-engineering** (2026-06-07): found already at the bar (authored recently at Opus strength), so the pass
  was sharpening, not wholesale rewrite. Rewrote the six coding-cluster entries (code-generation,
  ai-assisted-coding, ai-driven-development, claude-code, software-engineering, qa-testing) to give each a
  distinct keeper and remove cross-entry collisions: the review-bottleneck line and the harness-versus-weights
  thesis had each been landed by two entries. De-collided the context-management and token-optimization closes
  (both had ended on "a million-token window does not mean fill it"). Deepened the two thin vendor entries
  (ollama, openrouter) with a concrete-mechanism paragraph. Reviewed and left the other sixteen byte-identical
  as already at-bar.
