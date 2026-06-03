# AI Firehose: A Guided Tour

A human-friendly reference to what this project is, what you can do with it, and how it works underneath. If you want the one-paragraph version, read "The Idea" and "By the Numbers" and stop. If you are presenting it, the whole document is meant to be read top to bottom as talking points.

For the canonical technical guide, see [`CLAUDE.md`](CLAUDE.md); for the document map, [`STEERING_DOCS.md`](STEERING_DOCS.md). This file is the warm tour that sits above both.

## The Idea

AI moves faster than any one person can track. Every day brings new papers, models, tools, techniques, and arguments, and the feeling is less "I am informed" and more "I am drowning." AI Firehose exists to turn that flood into something navigable and conquerable.

It is a personal AI-industry intelligence dashboard. It ingests the most salient signal across the field every day, organizes it with an embedding and retrieval substrate, and surfaces two things clearly: what is *new*, and what is *breaking out*, across four nested time depths, Day, Week, Month, and Quarter. The north star is not to build one more noisy feed. It is to bottle the firehose so its reader can face the day organized, courageous, and on the bleeding edge.

It is personal first. It is the third in a trilogy: aigamma.com was built to learn PhD-level mathematics by working directly with models, worldthought.com to learn philosophy and how major thinkers connect, and AI Firehose to stay the best at AI. If others find it useful, good.

## What You Can Do on the Site

The site is built as an editorial intelligence service, not a dashboard of charts. Each surface answers a real question a busy expert has.

- **Home, the daily brief.** An editorial front page led by an agentic daily briefing: a cited, severity-aware prose summary of the moment, written at full strength by Claude Opus. Below it, a "Breaking Out" callout, the "What Moved" trend boards (the topics that gained or lost the most attention this window versus the one before), and a "Fresh Off the Wire" grid of the newest cited items. A reader can switch the whole page between Day, Week, Month, and Quarter.

- **The four time depths.** Day, Week, Month, and Quarter are nested windows inside a single rolling quarter. The same machinery answers "what happened today" and "what has been building all quarter," so you can zoom from the pulse to the trend without changing tools.

- **The Glossary, the crown jewel.** A durable, Opus-authored knowledge base of foundational, advanced, and exotic AI concepts (more below). This is the part built to last for years, not a day.

- **The Atlas.** A view of the Glossary as a navigable constellation: the 31 knowledge categories drawn as linked nodes, sized by how many concepts they hold and connected by how densely they cross-reference each other. It makes the shape of the whole field legible at a glance, and clicking a category drops you into its concepts.

- **Concept hubs.** Every concept, foundational or trending, has its own page: the authored explanation with wiki-style links to related ideas, a mesh of related concepts, and, where the live corpus is discussing it, its current momentum and the recent items that mention it.

- **Review, for active recall.** A flashcard study surface over the Glossary, with a kind filter and keyboard flip, so the knowledge base doubles as a way to actually learn and retain.

- **Learn, the guided paths.** Curated, ordered walks through the Glossary (19 of them), from "Transformers, From Attention to LLMs" and "How a Modern LLM Is Trained" through "Mechanistic Interpretability" and "The Philosophy of Mind and AI." A reader who wants a subject, not a single term, follows a path.

- **For You, the personal lens.** A reader follows the concepts they care about, and the site narrows the trend boards and the new-items grid to that personal slice. This is the "bottled just for you" promise made literal. It is opt-in and off by default; the briefing always stays global.

- **Watch.** A surface that spotlights favorite YouTube teachers, joining each video to the corpus for a cited summary and links into the relevant concept hubs, with a click-to-play facade so the page stays fast. (Currently seeded with a first featured teacher, designed to expand.)

- **Explore.** Live semantic search over the whole corpus and knowledge base, powered by the same embedding substrate, plus themed views, spectrums, and connections.

- **Methodology and About.** A plain-language account of how the site works, with live statistics, and the story behind it.

Every concept name in any prose on the site is a link into its hub, so dense writing reads as a navigable, color-coded mesh rather than a wall of text.

## The Knowledge Base, in Depth

This is the layer built to endure, and it is the most substantial single thing in the project.

- **453 authored concepts across 31 categories**, from foundations and history through advanced mathematics (linear algebra, calculus, probability, geometry and manifolds), deep learning, reinforcement learning, generative models, retrieval and embeddings, agents, systems and infrastructure, evaluation, alignment and safety, mechanistic interpretability, and into cognitive science and the philosophy of mind. Each entry is written at full strength by Claude Opus: a clear definition and a few paragraphs of genuine explanation, not a dictionary stub.

- **It is a graph, not a list.** Every concept cross-links to related ones, and that mesh is dense (no concept is an island). The Atlas visualizes it; the wiki-style auto-linker uses it to turn every mention into a link.

- **Cited images** are attached to concept hubs from a curated, credited sidecar of Wikimedia diagrams (15 so far, growing). Every image links to its source as the citation.

- **Learning paths and flashcards** sit on top, so the knowledge base is not just a reference but a place to study.

- **It never expires.** The trending material turns over every quarter (see below), but the authored knowledge base is permanent. A concept with no current news simply shows no live momentum; it never drops off.

## Under the Hood

In plain terms, here is the machine behind the surfaces.

- **Ingestion.** A worker pulls from seven kinds of source behind one aggregator: YouTube (the primary signal, with a transcript path), Hacker News, arXiv, GitHub, blogs and newsletters, Hugging Face daily papers, and Reddit. Roughly 258 items populate the current window.

- **Classification without guessing.** Each item is classified by Claude against a strict schema into one of three kinds, a *technique* (how to do something), a *tool* (a thing you can use), or an *opinion* (an argument), with a factual summary, the concepts it touches, and, for opinions, a stance. The kind is decided by the model reading the content, never assumed from the source.

- **An AI-grown taxonomy.** Concepts are not a fixed vocabulary. The classifier discovers candidate concepts, the model names and defines genuinely new ones, and every candidate is fitted to the existing taxonomy by embedding similarity so near-duplicates collapse onto one concept with aliases instead of fragmenting.

- **The embedding and retrieval substrate.** Everything is embedded with Voyage (voyage-3, 1024 dimensions) into a Pinecone vector store, which powers the semantic search, the concept neighbors, the clusters and spectrums, and the influence maps. Live search reranks results for quality.

- **A self-expiring corpus.** Nothing older than about one quarter (100 days) is kept. A prune stage deletes aged items and their vectors, so the maps always depict the current frontier and the running cost stays flat no matter how long the site runs. The durable knowledge base is the deliberate exception.

- **The right model for the stakes.** Three tiers of Claude are used by cost and permanence: Haiku for high-volume per-item classification, Sonnet for the middle tier, and Opus 4.8 for the low-volume, high-stakes, enduring prose a smart reader keeps, the daily briefing and the glossary definitions. Cheap work gets the cheap model; permanent work gets the strongest one.

## Why It Is Trustworthy

A lot of care went into making sure the system cannot quietly lie to itself, which is unusual for a personal project and worth highlighting.

- **Determinism and idempotency.** Re-running the pipeline on unchanged data is a no-op. Content is hashed, vector ids are deterministic, and the precompute uses pinned, seeded, RNG-free math, so the same input always yields the same maps.

- **Cited claims.** Every AI-written summary and definition traces to the item or concept it describes. Source titles are kept verbatim as quotes.

- **An anti-staleness harness.** The project's own documentation and knowledge graph are protected by code, not goodwill. Three CI gates, run by the test suite on every change, fail the build rather than letting things drift:
  1. Documentation freshness: every file path and command named in the docs must actually exist.
  2. Knowledge-graph integrity: every cross-link and every learning-path step must resolve to a real concept, and no alias is ambiguous enough to mislink.
  3. Writing rules: the project's house style (for one, no em dashes in generative text) is enforced automatically.
- **76 automated tests pass**, and continuous integration runs the suite and a production build on every change.

The discipline behind it is simple: a claim is not a result. "It works" is a story; the test that passes, the build that exits clean, the byte on disk, those are evidence. The system is built to prefer evidence.

## By the Numbers

| Thing | Count |
|---|---|
| Authored, durable knowledge-base concepts | 453 |
| Knowledge categories | 31 |
| Total concepts (durable plus live trending) | 845 |
| Cross-category links in the Atlas | 475 |
| Curated learning paths | 19 |
| Cited concept images (growing) | 15 |
| Items in the current rolling-quarter corpus | ~258 |
| Source families behind the aggregator | 7 |
| Time depths (Day, Week, Month, Quarter) | 4 |
| Claude model tiers by stakes | 3 |
| Anti-staleness CI gates | 3 |
| Automated tests passing | 76 |

## Status and Roadmap

- **Live and deployed.** The site is feature-complete and deployed on Netlify with continuous deploy, a working semantic-search function, and DNS switched over with its certificate issued. The repository is public and MIT-licensed.
- **The one pending piece.** The Fly.io ingestion worker is not yet deployed, so the daily data refresh is the last thing to turn on. Until then the site runs on a real, committed snapshot of a pipeline run.
- **Natural next steps.** Deploy the worker (turns on the daily firehose), deepen and illustrate more of the knowledge base, expand the featured-creators surface, and a few stretch ideas like an X (Twitter) adapter.

## How It Was Built

AI Firehose is built by an ensemble of AI agents working against a deterministic, idempotent contract, under a human north star. The conventions every agent follows live in one auto-loaded document so they cannot drift, and durable insight from each session is absorbed back into the repository's documentation rather than lost to chat history. The knowledge base is AI-authored at full strength, but the judgment about what matters, and the standard that it be genuinely useful to a smart reader rather than cheesy or shallow, is human. That collaboration, machine labor under human taste, is the project in miniature.
