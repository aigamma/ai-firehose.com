---
title: Retrieval-Augmented Generation
slug: retrieval-augmented-generation
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: RAG
related: embedding-model, vector-database, semantic-search, chunking, reranking, dense-retrieval, hybrid-search
summary: A technique that grounds a language model's output in external documents by retrieving relevant passages at query time and supplying them to the model as context, rather than relying only on the knowledge baked into its weights.
---

Retrieval-augmented generation, or RAG, couples a language model with a search system so the model answers from documents it is shown rather than from memory alone. A parametric model knows only what its training captured, frozen at a cutoff date and impossible to inspect or update without retraining. RAG separates the knowledge from the model: facts live in an external corpus that can be edited, versioned, and grown, while the model supplies the reasoning and fluent prose. This is why RAG has become the default architecture for question answering over private or fast-moving data.

The mechanism is a two-stage pipeline. At indexing time, documents are split into passages by chunking, each chunk is turned into a vector by an embedding model, and the vectors are stored in a vector database. At query time, the user's question is embedded with the same model, semantic search finds the chunks whose vectors sit nearest the query, an optional reranking pass reorders the shortlist for precision, and the top passages are concatenated into the model's prompt. The model then generates an answer conditioned on that retrieved context, ideally citing the passages it used.

RAG matters because it attacks three weaknesses of bare language models at once. It curbs hallucination by giving the model real text to ground in. It keeps answers current, since updating the corpus is cheaper and faster than retraining. And it makes a system auditable: every claim can trace to a retrieved source, which is essential anywhere a wrong answer carries cost. The trade is added moving parts, a retrieval layer whose quality now bounds the quality of the whole, and a hard limit on how much retrieved text fits in the model's context window.

This site is itself a RAG substrate, which makes the abstraction concrete. Every ingested item (a YouTube transcript, a paper, a blog post) is chunked, embedded with voyage-3, and upserted into a Pinecone index keyed by deterministic content hashes. The Explore page runs semantic search against that index and applies a rerank-2 reranking pass before showing results. The daily briefing is generated the same way: the relevant window of corpus is retrieved, then synthesized into cited prose. Crucially, there is no chatbot here; RAG powers organization, search, and grounded summaries, not open-ended conversation, which shows that retrieval-augmented generation is a pattern for grounding any generation step, not only a dialogue trick.
