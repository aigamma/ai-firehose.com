# Glossary Onboarding: the Discovered-Concept Backlog (ACTIVE CAMPAIGN)

> **Resuming in a fresh session? Start here.** Read this whole file, then `docs/GLOSSARY.md`
> and the Session 17 entry in `LESSONS_LEARNED.md`, then continue from **Status** at the bottom.
> The work is **linear, main-thread, full Opus strength, NO subagents** (they are weaker for this
> prose and burn the weekly budget fast). **Commit per batch.** This session's work is already pushed
> to `origin/main` and deployed (GitHub is the durable store across a machine rebuild, so a fresh
> machine just re-clones); push completed, gated-green batches the same way. This file is the source of
> truth for what is done and what is next.

## What to call this work (terminology for instructing a fresh agent)

- **The onboarding backlog** is the whole job: the corpus-discovered concepts that still lack a durable
  authored entry (the "genuinely-new" concepts). The campaign as a whole is **glossary onboarding**.
- **Board-visible concepts** (the "visible head") are the high-attention concepts that surface on the
  trend boards (Techniques, Tools, Opinions at Day, Week, Month, Quarter) and the Home statistics. These
  are what a reader actually sees and clicks, so they are the PRIORITY, and are mostly done.
- **The long tail** (the "low-attention gaps") are the low-attention concepts, roughly `attention` 5 and
  below, that do not surface on any board. Lower priority; fine to defer to a future week.

The one instruction that suffices to restart this work: **"Resume the glossary onboarding backlog from
`docs/GLOSSARY_ONBOARDING.md`: finish the board-visible head, then the long tail."**

## The goal

Every corpus-discovered trending concept (the techniques, tools, and opinions that appear on the
trend boards) must open onto a real, educational glossary entry, not a statistics page. Roughly
**360** of them had `attention` but no authored body or image, so clicking a trending tag gave
momentum and cosine neighbors instead of an explanation, which fails the site's whole purpose: it
is first and foremost an educational site where people learn by exploring. Onboard them **all** as
durable, authored entries, to the same bar as the existing 552.

## Why this exists (the diagnosis)

The AI-grown resolver (`worker/pipeline/concepts.mjs`) dedupes a discovered concept only against the
corpus taxonomy, and `scripts/build_glossary.mjs` merges a corpus hub into an authored entry only on
an exact slug match. So surface variants of an authored concept spawned their own thin hubs. The
**fold keystone** (`scripts/fold_corpus_concepts.mjs`, matcher in `scripts/lib/fold.mjs`, both done and
committed) already collapsed ~30 duplicates onto their durable hubs and de-fragmented the boards. What
remains are the **genuinely-new** concepts, which need real authoring. (The lasting fix, making the
worker resolve against the durable layer, is tracked in `docs/ROADMAP.md`.)

## The procedure (repeat per batch, ~6 concepts)

1. **Find the backlog.** The full, explicit prospect list is committed at `docs/glossary_backlog.md`
   (regenerate it after authoring with `node scripts/build_glossary_backlog.mjs`). It is derived from
   `public/data/glossary/index.json`: every concept without `durable: true`, sorted by `attention`.
   To pull the top ones with their corpus grounding (a throwaway `.mjs` run from the repo root, because
   PowerShell mangles inline `node -e` quotes):
   ```js
   import { readFileSync } from "node:fs";
   const idx = JSON.parse(readFileSync("public/data/glossary/index.json", "utf8"));
   const todo = idx.concepts.filter(c => !c.durable).sort((a,b)=>(b.attention||0)-(a.attention||0));
   for (const c of todo.slice(0, 30)) {
     let items = [];
     try { items = (JSON.parse(readFileSync("public/data/glossary/c/"+c.id+".json","utf8")).top_items||[]).slice(0,3).map(i=>i.title); } catch {}
     console.log(c.attention, c.kind, c.id, "=", c.label); for (const t of items) console.log("   -", t);
   }
   ```
2. **Pick ~6** of the highest-attention concepts that have **no** authored file under `content/glossary/`.
3. **Dedup check.** If a concept is really a synonym of an existing durable concept (for example
   `orchestration` vs `workflow-orchestration`, `memory-systems` vs `agent-memory`), do NOT author a
   redundant page: add it as an `alias` in that durable entry's frontmatter, then run
   `node scripts/fold_corpus_concepts.mjs` to fold it.
4. **Author each** as `content/glossary/<category-folder>/<slug>.md`. Frontmatter:
   `title` (Title Case), `slug` (the index `id`, verbatim), `kind` (`technique` | `tool` | `opinion`),
   `category` (reuse an existing label exactly, see below), `aliases` (surface variants),
   `related` (5 to 8 slugs that MUST resolve, validate against the index first), `summary` (2 to 3
   factual sentences, no em dash). Then the body, 4 to 5 paragraphs. Ground it in what is actually being
   discussed using the corpus hub's `top_items` at `public/data/glossary/c/<slug>.json`. No image
   (visuals are backfilled later via `scripts/glossary_images.mjs`; never hotlink).
5. **Gate.** `npm run glossary` then `npm test`. Fix every failure before committing: dangling
   `related` slugs (`check_glossary`), em dashes (`check_no_emdash`), ambiguous aliases (an alias also
   claimed by another concept, reassign or drop it).
6. **Commit per batch.** `git add content/glossary public/data` then
   `git commit -m 'Glossary: onboard 6 trending concepts (slugA, slugB, ...)'`.
   **Single quotes only** in `-m` (PowerShell mangles embedded double-quotes; for multi-line use
   `git commit -F <tempfile>`). **Do NOT push.**
7. **Update the Status block** at the bottom of this file in the same commit.

## The voice contract (the bar; full version in `content/glossary/README.md`)

Earned vividness. **Open on the problem, tension, or consequence** the concept resolves, NEVER a copular
dictionary definition ("X is a type of ..."). Present the mechanism as **deliberate choices with reasons**.
Carry **exactly one memorable keeper** a smart reader would not already hold. **End on an insight or an
honestly-named limit**, not a list. **No em dashes** (U+2014) anywhere; use commas, colons, semicolons,
parentheses, or "and". Title Case titles. This is permanent content read for years, written at full
strength; the author will do later quality passes, but do not cut corners.

## Conventions and gotchas

- **Category labels (reuse exactly, do not invent near-duplicates):** Advanced Mathematics; Advanced
  Optimization; Agents and Tool Use; AI Engineering; Alignment and Safety; Calculus and Analysis;
  Cognitive Science and Neuroscience; Computer Vision; Core Machine Learning; Deep Learning Architectures;
  Deep Learning Theory; Evaluation and Benchmarks; Foundations and History; Frontier Architectures;
  Generative Models; Geometry and Manifolds; Graph and Geometric Learning; Inference and Sampling;
  Learning Theory; Linear Algebra for ML; Mechanistic Interpretability; NLP Foundations; Optimization;
  Philosophy and AI, Advanced; Philosophy of Mind and AI; Probabilistic Machine Learning; Probability and
  Information Theory; RAG, Embeddings, and Retrieval; Reinforcement Learning; Systems and Infrastructure;
  Training and Fine-Tuning; Transformers and LLMs. **AI Engineering** is the new category seeded for the
  applied agentic-coding and LLM-ops cluster that dominates this corpus; put applied build/ops concepts there.
- The folder name is the kebab slug of nothing in particular; what groups the Glossary is the `category`
  string, so the LABEL must match. Existing folders: `content/glossary/<agents|ai-engineering|nlp|...>`.
- A `related` slug resolves if it is any concept id in the index (durable or a corpus hub). Validate a
  candidate list against the index before authoring to avoid gate churn.
- The fold keystone is idempotent and `build_glossary` preserves the folded state, so re-running the
  build is always safe.
- **Count-claim gate (`scripts/check_doc_accuracy.mjs`), added 2026-06-05.** When the durable, total, or
  category count changes, this gate fails `npm test` until the exact numbers in `README.md`, `OVERVIEW.md`,
  `docs/GLOSSARY.md`, and `CLAUDE.md` are synced to the live artifacts (`durable_count` and `count` in
  `index.json`, `categoryCount` in `atlas.json`, and the number of committed gate scripts). Authoring a new
  entry does NOT change the total (the corpus concept just flips to durable), so usually only the durable
  count and, if a new category was added, the category count need updating. Run
  `node scripts/check_doc_accuracy.mjs` to see exactly which doc lines are stale.

## Status (UPDATE PER BATCH)

As of **2026-06-05**: **600 durable entries**, ~**304 genuinely-new remaining**. Everything below is
**pushed to `origin/main` and deployed to Netlify**. The substantive board-visible head is largely
covered. The full, explicit list of the ~310 remaining prospects is committed at `docs/glossary_backlog.md`
(auto-generated by `scripts/build_glossary_backlog.mjs`; regenerate after each batch). Vendor and product
tools (Ollama, OpenRouter, DeepSeek) ARE in scope, written as short educational entries; only pure
non-AI dev terms (for example form-submission, react-native) are skipped. Beyond the corpus backlog,
agents propose judgment-flagged terms to `docs/glossary_queue.md` (the rule is in `CLAUDE.md`);
expansion passes author from both the backlog and the queue.

Done so far this campaign:
- `4e8c96d` header/nav redesign (primary pills + a right-anchored Menu, broken search removed, interior
  pages centered) and the new `agentic-harness` concept.
- `b4a9fee` keystone fold: 30 duplicates collapsed onto durable hubs, 12 boards de-fragmented.
- `678176d` batch 1 (AI Engineering): code-generation, automation, workflow-orchestration,
  context-management, claude-code, video-generation.
- `6f63dfd` batch 2: agentic-ai, ai-assisted-coding, benchmark, skills, mathematical-reasoning,
  token-optimization.
- `91739cb` this handoff doc and the CLAUDE.md resume pointer.
- `ca4e478` batch 3: recursive-self-improvement, agent-design, data-integration, knowledge-bases,
  generative-ai, ai-operating-systems (seeded the Industry and Markets category).
- `1a4bb2c` batch 4: market-dynamics, autoresearch, task-parallelization, ai-regulation,
  local-inference, compute-efficiency.
- `580e77b` batch 5: cybersecurity, evaluation, personalization, model-agnostic, ai-agency-strategy,
  yaml-workflows.
- `039b8e2` dedup pass: folded 8 more duplicates (agent-wrapper, orchestration, memory-systems,
  context-stacking, plus 4 plural variants) and added the `check_doc_accuracy` count gate.
- batch 6: scheduling, multi-model-workflow, prompt-chaining, async-agents, adversarial-ai,
  agent-optimization.
- batch 7: ai-risk, open-models, software-engineering, rpa, qa-testing, ai-driven-development.
- batch 8: ollama, openrouter, deepseek, ai-ethics, ai-research-automation, agent-teams.

Net so far: **49 authored entries** (agentic-harness plus 48 across eight batches) and **38 folded
duplicates**, all in the board-visible head. What remains is mostly the **long tail** (attention 9 and
below): re-run the backlog query for the current top, for example scheduling, multi-model-workflow,
prompt-chaining, async-agents, adversarial-ai, agent-optimization, software-engineering, and downward.
Author highest attention first; the very-low-attention tail (attention 1 to 3) is the lowest priority.

The weekly budget resets ~Sunday 2026-06-07 morning. Paused near the weekly limit for a planned Windows
rebuild; resume from this file after the reset.
