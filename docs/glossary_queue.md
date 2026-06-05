# Glossary Candidate Queue (agent-curated proposals)

> A running queue of glossary candidates that an agent's JUDGMENT flagged as important: the
> complement to the corpus-derived `docs/glossary_backlog.md`. The backlog is what the data mining
> surfaced from the trending firehose; this queue is what an agent noticed was missing during any
> work. A human or agent expansion pass authors durable entries from BOTH.
>
> **Adding a term (the rule, also stated in `CLAUDE.md`):** when you meet a concept, tool, or
> technique important to AI or AI engineering that lacks a glossary entry, append a row here, but
> dedup-check it first. It must NOT already be (1) a durable entry (a file under `content/glossary/`,
> or `durable: true` in `public/data/glossary/index.json`), (2) a prospect in
> `docs/glossary_backlog.md`, or (3) already queued below. When a queued term is authored as a durable
> entry, delete its row. Authoring follows the procedure and voice in `docs/GLOSSARY_ONBOARDING.md`.

## Queue

| term | kind | why it matters (one line) | proposed |
|---|---|---|---|
| Structured Output | technique | Constraining a model to emit valid JSON or a schema, the backbone of reliable tool use and pipelines. | seed 2026-06-05 |
| Semantic Caching | technique | Caching model responses by meaning rather than exact match, a major cost and latency lever. | seed 2026-06-05 |
| LLM Observability | tool | Monitoring, tracing, and debugging LLM applications in production, the ops layer agentic systems now need. | seed 2026-06-05 |
