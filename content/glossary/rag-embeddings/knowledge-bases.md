---
title: Knowledge Bases
slug: knowledge-bases
kind: tool
category: RAG, Embeddings, and Retrieval
aliases: knowledge base, AI knowledge base
related: retrieval-augmented-generation, vector-database, semantic-search, reranking, agentic-rag, agent-memory, large-language-model
summary: A curated, queryable store of an organization's or agent's knowledge, documents, facts, and structured records, built so a model can retrieve the right piece on demand rather than relying on what it memorized in training. The knowledge layer that grounds a model in specific, current, citable truth.
---

A model's parametric memory, what it absorbed during training, is vast but frozen, generic, and unattributable: it cannot cite where a fact came from, cannot be updated without retraining, and does not contain your specifics at all. A knowledge base is the deliberate external memory that fills those gaps, a curated store of documents and facts an agent can query at the moment it needs them, so its answers rest on a source you can point to rather than a weight you cannot inspect.

Building one is a sequence of choices about how knowledge is stored and found. Documents are split into chunks small enough to retrieve precisely but large enough to stay meaningful. Each chunk is embedded into a vector so it can be found by meaning rather than exact words, and often indexed for keyword search too, since the two catch different queries. Retrieval pulls the candidates, and a reranker sharpens which few actually reach the model. The craft is in the chunking and the curation, because a knowledge base full of noise retrieves noise.

The non-obvious truth is that a knowledge base is a curation problem dressed as a search problem. The retrieval machinery is largely solved and commoditized; what determines whether the system gives good answers is the quality, freshness, and deduplication of what went in. Garbage in the base is not filtered by the model, it is retrieved and cited with full confidence, which makes a stale or contradictory knowledge base worse than none, because it launders bad information into authoritative-sounding answers.

The knowledge base is what lets a general model become a specific expert without retraining: swap the base and the same model speaks authoritatively about a new domain. That separation, a frozen reasoner plus a living, swappable knowledge layer, is one of the most practical ideas in applied AI, because it puts the part that must stay current under your control and on your update schedule, not the model provider's.
