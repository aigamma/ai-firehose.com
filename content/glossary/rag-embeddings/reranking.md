---
title: Reranking
slug: reranking
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: reranker, cross-encoder reranking, neural reranking
related: semantic-search, embedding-model, dense-retrieval, hybrid-search, retrieval-augmented-generation, contrastive-learning
summary: A second-stage retrieval step that takes a shortlist from a fast first-stage search and reorders it with a more accurate but more expensive model, putting the truly most relevant results on top. Its rationale is that first-stage recall and final ranking want different things, so a cross-encoder that reads the query and document jointly (and therefore cannot be precomputed) is applied only to the shortlist.
---

Reranking is the precision stage of a two-stage retrieval pipeline. A first-stage retriever (semantic search over a vector database, keyword scoring, or a hybrid of both) is tuned for recall and speed: it sweeps the whole corpus and returns a shortlist, perhaps the top fifty or hundred candidates, that probably contains the best answers but is only roughly ordered. A reranker then takes that small shortlist and re-scores each candidate against the query with a slower, more accurate model, producing a final order whose top few results are genuinely the most relevant. Retrieve broadly, then rerank narrowly.

The accuracy gain comes from how a reranker reads the pair, and that is the crux. A bi-encoder embedding model encodes the query and each document separately and compares the two finished vectors, which is fast and indexable but never lets the query and document interact directly; a reranker is usually a cross-encoder, feeding the query and a candidate into the model together so every query token can attend to every document token, capturing fine relevance signals a fixed vector cannot. That joint attention is what makes it more accurate, and also why it cannot be precomputed: it runs at query time, once per candidate, which is exactly why it is applied only to a shortlist rather than the whole corpus.

Reranking matters because first-stage retrieval and final ranking want different things, and trying to get both from one stage forces a bad compromise. The shortlist guarantees the right documents are present; the reranker guarantees they sit at the top, where a language model with a limited context window will actually read them. In retrieval-augmented generation this directly raises answer quality, because the model is grounded on the few most relevant passages rather than on whatever the first stage happened to rank highest. The cost is added latency and compute per query, bounded by keeping the shortlist small.

This site applies reranking on its Explore semantic search surface: candidates pulled from the Pinecone index are reordered by Voyage's rerank-2 model before results are shown, so the first page reflects fine-grained relevance rather than raw vector distance alone. It is a clean illustration of the pattern, a cheap voyage-3 nearest-neighbor sweep for recall followed by a sharper cross-encoder pass for precision, the same division of labor that production retrieval systems rely on.
