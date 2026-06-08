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
- **Remove the leaked "the keeper" meta-label (the single most common concrete fix).** About 293 of the 600
  entries (the Session-15-enhanced ones; the onboarding-era `content/glossary/ai-engineering` and
  `content/glossary/industry` have none) wrote the authoring flag "the keeper" straight into the published
  prose ("That gap is the point, the keeper: ...", "The keeper is the division of labor: ..."). Find them by
  searching `content/glossary` case-insensitively (rg -i), since sentence-initial "The keeper" is easy to miss. Rephrase per entry with varied wording (the crux, the point,
  what matters, the key insight) or restructure the sentence. Do NOT blanket-replace to a single word (it
  flattens 293 entries into monotony) and do NOT script the predicate cases ("X is the keeper"); this is
  main-thread craft, one entry at a time.

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

## Category Checklist (33 categories, 600 entries; [x] = keeper-leak purged and prose at-bar)

**Wave 1, highest headroom (onboarding-era and thin-heavy):**
- [x] ai-engineering (25; 24 never audited, 2 thin) done 2026-06-07
- [x] industry (5; wholly onboarding-era) done 2026-06-07
- [x] evaluation (26; 2 new, 4 thin) done 2026-06-07
- [x] nlp (22; 1 new, 5 thin)
- [x] agents (22; 4 new, 1 thin)
- [x] alignment (30; 6 new)
- [x] generative-models (21; 2 new)
- [x] rag-embeddings (21; 1 new)
- [x] systems (21; 2 new)
- [x] optimization (21; 2 thin)

**Waves 2 and on (the Session-15-enhanced categories; push further or leave byte-identical):**
- [x] foundations (14)
- [x] core-ml (31)
- [x] linear-algebra (15)
- [x] calculus (12)
- [x] probability (16)
- [x] probabilistic-ml (12)
- [x] geometry (14)
- [x] graph-geometric (12)
- [x] advanced-math (14)
- [x] optimization-advanced (13)
- [x] learning-theory (13)
- [x] dl-theory (13)
- [x] deep-learning (19)
- [x] transformers (30)
- [x] training (22)
- [x] inference (27)
- [x] reinforcement-learning (19)
- [x] vision (19)
- [x] interpretability (15)
- [x] frontier (15)
- [x] cognitive-science (13)
- [x] philosophy (14)
- [x] philosophy-advanced (14)

## Status (UPDATE PER CATEGORY)

As of **2026-06-08**: **all 33 categories de-leaked; the "the keeper" meta-label is purged from the entire
durable layer** (a case-insensitive scan of `content/glossary` returns zero). That was the dominant Phase A
defect, about 287 entries across 25 categories, each rephrased with varied wording on the main thread. The
three Wave-1 leaders (ai-engineering, industry, evaluation) additionally got cross-entry collision-resolution
and thin-entry deepening; the remaining categories were Session-15-enhanced prose already at the bar, so the
de-leak was the substantive change there. **Remaining Phase A polish:** deepen the handful of thin (under 250
word) entries flagged by `node scripts/glossary_triage.mjs`. Then Phase B: onboard the genuinely-new corpus
concepts per `docs/GLOSSARY_ONBOARDING.md`.

Per-category notes:
- **ai-engineering** (2026-06-07): found already at the bar (authored recently at Opus strength), so the pass
  was sharpening, not wholesale rewrite. Rewrote the six coding-cluster entries (code-generation,
  ai-assisted-coding, ai-driven-development, claude-code, software-engineering, qa-testing) to give each a
  distinct keeper and remove cross-entry collisions: the review-bottleneck line and the harness-versus-weights
  thesis had each been landed by two entries. De-collided the context-management and token-optimization closes
  (both had ended on "a million-token window does not mean fill it"). Deepened the two thin vendor entries
  (ollama, openrouter) with a concrete-mechanism paragraph. Reviewed and left the other sixteen byte-identical
  as already at-bar.
- **industry** (2026-06-07): re-passed all five. De-collided ai-agency-strategy from market-dynamics (both had
  closed on the same value-migrates-to-what-stays-scarce thesis; market-dynamics keeps it, ai-agency-strategy
  now owns the it-is-an-ordinary-services-business keeper). Deepened the thin deepseek entry with concrete
  substance (sparse mixture-of-experts, multi-head latent attention, the RL-trained R1, the market reaction).
  Left ai-operating-systems, market-dynamics, and open-models byte-identical as already at-bar.
- **evaluation** (2026-06-07, two commits): de-collided benchmark from evaluation (they shared a "cannot
  improve what you cannot measure" opening; benchmark now opens on the scoreboard); removed the keeper leak
  from all 22 affected entries with varied per-entry phrasing; deepened the four thin benchmarks (gpqa,
  reward-bench, chatbot-arena, lm-evaluation-harness) past the threshold with concrete substance. Left the
  already-strong metrics and the two clean entries (calibration, roc-auc) byte-identical apart from the de-leak.

## Phase C: The Enrichment Pass (ACTIVE, started 2026-06-08)

Phase A de-leaked and held the prose bar; Phase B cleared onboarding. Phase C is the deeper enrichment
Eric asked for: **re-read every durable entry and make every honest improvement**, leaving at-bar entries
byte-identical (churn is forbidden). The full rubric and procedure live in the approved plan; the four levers:

1. **Opening move** (no copular/dictionary lead). The 19 triage-flagged openers are the priority worklist:
   `agentic-workflow, workflow-orchestration, spiking-neural-network, kernel-method, elo-rating, hyena,
   greedy-decoding, logit-lens, activation-steering, linear-transformation, dot-product, hidden-markov-model,
   central-limit-theorem, maximum-likelihood-estimation, markov-chain, temporal-difference-learning, q-learning,
   frontier-model, feature-pyramid`. Triage is ~90% false-positive on this flag, so read to decide.
2. **Keeper + close** (end on a structural insight worth remembering, not a "see also" or a self-plug).
3. **Inline link integration** (name a neighbor in prose where the logic warrants, so the wiki-linker auto-links
   it; do NOT pad tight prose to manufacture links; frontmatter `related:` density is already high, median 6).
4. **Figure**: embed where a clean openly-licensed one is found; otherwise it stays on the flag-list.

**Image work (parallel hunt, Eric opted in):** 220 entries lack a figure. Read-only Explore subagents run the
repo's sanctioned, license-filtering search (`node scripts/glossary_images.mjs search|wiki`) and propose
candidates; the main thread adjudicates, writes the teaching `alt`/`caption`, stages a row in
`content/glossary/_img_stage/<batch>.json`, and runs `finalize` (the non-LLM oracle that downloads,
sniffs bytes, size-checks, and license-validates). Concrete concepts (algorithms, architectures, plots) are
huntable; abstract ones (most of `alignment`, `philosophy`, `ai-engineering`) stay on the wishlist as
AI-generation candidates. Regenerate `docs/glossary_image_wishlist.md` from `glossary_images.mjs gaps` at
each wave boundary so the recognized flag-list reflects the shrinking gap.

This ledger is a **failsafe, not a stop signal**: when categories remain, keep going in the same turn. Commit
per category; push at wave boundaries; confirm `HEAD == origin` after each push.

### Phase C Category Ledger ([x] = re-read, improved where improvable, images embedded or flagged)

Annotation: `(entries; dict-lead flags; image gaps)`.

**Wave 1, highest headroom (onboarding-era prose + heavy image gaps):**
- [x] agents (27; 1; 12): agentic-workflow opener de-copulared; other 26 read, all at-bar; image gaps abstract (AI-gen candidates)
- [x] ai-engineering (26; 1; 26): all 26 read, all at-bar (workflow-orchestration's "is a function" opener is a triage false-positive, genuinely a concrete-contrast lead); image gaps are abstract concepts, AI-gen candidates
- [x] industry (7; 0; 7): all 7 read, all at-bar (deepseek deepened in Phase A holds); image gaps abstract, but ai-adoption (adoption curve) and market-dynamics (compute-growth) are real-data-chart candidates (OWID/Epoch)
- [x] alignment (32; 0; 20): all 32 read, all at-bar (a tightly cross-linked safety mesh, Session-15 quality holds); 20 image gaps all abstract safety concepts, AI-gen candidates
- [x] evaluation (26; 1; 13): elo-rating opener de-provenanced (now problem-first); other 25 at-bar (Phase A fresh-pass holds); image gaps are metrics/benchmarks, no clean open figure on Wikimedia for bleu/rouge/perplexity/mmlu (AI-gen candidates)

**Wave 2, scattered flags + moderate gaps:**
- [x] nlp (23; 0; 9): all 23 read, all at-bar (strong NLP-foundations cluster); glove image (king-queen analogy) confirmed apt for the entry; 9 gaps (tf-idf/n-gram image candidates rejected on review as off-emphasis)
- [x] generative-models (21; 0; 9): all 21 read, all at-bar (excellent diffusion/flow cluster); rectified-flow image (straight-vs-curved transport paths) confirmed apt; 9 gaps
- [x] rag-embeddings (22; 0; 8): all 22 read, all at-bar (excellent, each tied to the site's own voyage-3/Pinecone/rerank-2 architecture); 8 gaps
- [x] reinforcement-learning (23; 2; 12): temporal-difference-learning (provenance lead) and q-learning (significance lead) openers fixed to lead on mechanism; other 21 at-bar (superb cluster); 12 gaps abstract algorithm concepts (AI-gen)
- [x] transformers (31; 1; 9): frontier-model opener de-copulared and the weak site-plug close replaced with a structural insight (also lifts it past the thin threshold); other 30 at-bar; 9 concrete gaps (RoPE, kv-cache, attention-sink) but only non-redistributable arXiv figures exist (flagged)
- [x] inference (27; 1; 7): all 27 read, all at-bar (greedy-decoding flag is a false positive, mechanism stated in sentence 1); 7 gaps abstract sampling/serving concepts
- [x] interpretability (16; 2; 3): all 16 read, all at-bar (outstanding mech-interp cluster); both flags (logit-lens, activation-steering) false positives (vivid/contrastive openers); 3 gaps (data-attribution, linear-representation-hypothesis, probing-classifier)
- [x] frontier (16; 1; 7): all 16 read, all at-bar (hyena flag false positive, clean functional opener); 7 gaps concrete architectures but only non-redistributable arXiv figures (flagged)
- [x] vision (25; 1; 6): all 25 read, all at-bar (feature-pyramid flag false positive); noted image-tokenization and visual-tokenization are near-duplicates (future de-dup candidate, both at-bar individually so left); 6 concrete gaps (arXiv-license figures)
- [x] core-ml (33; 1; 9): all 33 read, all at-bar (kernel-method flag false positive, "elegant sleight of hand... nonlinear power without the nonlinear work"); 9 gaps
- [x] deep-learning (22; 0; 7): all 22 read, all at-bar (foundational DL cluster, lstm "constant error carousel" framing superb); 7 gaps (batch-norm, layer-norm, etc.; D2L candidates were tangential, rejected)
- [x] probability (19; 3; 3): central-limit-theorem opener reworked to lead with the bell-curve mystery (dropped ranking filler); other 18 at-bar, the other 2 flags (maximum-likelihood-estimation, markov-chain) false positives (keeper surfaces in sentence 1); 3 gaps abstract
- [x] linear-algebra (16; 2; 1): all 16 read, all at-bar; both flags (dot-product, linear-transformation) are false positives (thesis/hook openers, not taxonomic leads), left byte-identical; 1 gap (low-rank-approximation)
- [x] probabilistic-ml (16; 1; 6): all 16 read, all at-bar (hidden-markov-model flag false positive, "infer the hidden from its observable shadow" surfaces in sentence 1); 6 gaps abstract
- [x] cognitive-science (13; 1; 2): spiking-neural-network opener reworked to lead on the continuous-vs-spike contrast (its category peers all use active framings); other 12 at-bar; 2 gaps (cell-assembly, dual-process-theory)

**Wave 3, strongly enhanced already (mostly read-and-leave + image flag):**
- [x] foundations (14; 0; 4): all 14 read, all at-bar (some of the best entries in the glossary: AI-effect, "we know more than we can tell", submarine/swim); 4 gaps historical concepts
- [x] calculus (12; 0; 0): all 12 read, all at-bar (clean math exposition, derivative through autodiff); 0 gaps (fully imaged)
- [x] advanced-math (14; 0; 0): all 14 read, all at-bar (sophisticated, deep math: measure-theory through RKHS); 0 gaps (fully imaged)
- [ ] geometry (14; 0; 1)
- [ ] graph-geometric (12; 0; 1)
- [ ] optimization (21; 0; 3)
- [ ] optimization-advanced (13; 0; 3)
- [ ] learning-theory (14; 0; 4)
- [ ] dl-theory (14; 0; 2)
- [ ] training (24; 0; 6)
- [ ] systems (22; 0; 3)
- [ ] philosophy (14; 0; 10)
- [ ] philosophy-advanced (15; 0; 7)

### Phase C Status

As of **2026-06-08**: **Wave 1 complete** (agents, ai-engineering, industry, evaluation, alignment: 118
entries read in full). Findings: the durable layer is overwhelmingly already at-bar. Of 118 entries only 2
needed a prose fix (the `agentic-workflow` and `elo-rating` openers, a copular lead and a provenance lead);
the other 116 were left byte-identical. The triage dict-lead flag confirmed its ~90% false-positive rate
(`workflow-orchestration`, several others flagged but genuinely problem-first on a read). Images: parallel
Wikimedia + D2L hunts over ~32 concrete concepts yielded only 2 embeddable figures (`glove`, `rectified-flow`);
the rest were wrong-concept, tangential, or simply absent, which confirms the residual gaps are genuinely hard
and mostly need AI generation. Every image was viewed before embedding (the oracle validates bytes and license,
not pedagogy): that caught a neuroimaging-GUI screenshot mislabeled as batch-norm and a value-distribution
scatter for tf-idf, both rejected. The flag-list is regenerated to the true **218** gaps via the new
`scripts/build_image_wishlist.mjs`. Next: Wave 2 (nlp, generative-models, rag-embeddings, reinforcement-learning,
transformers, inference, interpretability, frontier, vision, core-ml, deep-learning, probability, linear-algebra,
probabilistic-ml, cognitive-science), where the remaining dict-lead flags and the more concrete image gaps cluster.

As of **2026-06-08**: **Wave 2 complete** (all 15 categories, 323 entries read). All 19 triage dict-lead flags are
now resolved across Waves 1 and 2: **7 were genuine and fixed** (agentic-workflow, elo-rating,
temporal-difference-learning, q-learning, frontier-model, central-limit-theorem, spiking-neural-network), and
**12 were confirmed false positives** (the opener already carried a thesis, contrast, or keeper in sentence 1, so
the "is/are" only tripped the regex). Every other entry was at-bar and left byte-identical. Running totals across
Waves 1+2: **441 of 644 entries read; 7 opener reworks** (frontier-model also re-closed and deepened past the thin
threshold) **and 2 embedded figures** (glove, rectified-flow), the honest measure of how at-bar the Session-15
durable layer already was. The image hunt's low yield is itself a finding: the residual gaps are genuinely hard,
mostly abstract or arXiv-non-redistributable, and belong on the wishlist as AI-generation candidates. Next:
**Wave 3** (foundations, calculus, advanced-math, geometry, graph-geometric, optimization, optimization-advanced,
learning-theory, dl-theory, training, systems, philosophy, philosophy-advanced; 203 entries), the most strongly
Session-15-enhanced categories, expected to be almost entirely read-and-leave.
