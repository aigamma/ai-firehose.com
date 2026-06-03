---
title: Hybrid Search
slug: hybrid-search
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: hybrid retrieval, fusion retrieval
related: dense-retrieval, sparse-retrieval, semantic-search, reranking, embedding-model, retrieval-augmented-generation
summary: Retrieval that combines dense (semantic) and sparse (keyword) methods and fuses their results, so the system captures both meaning-based matches and exact-term matches that either method alone would miss.
---

Hybrid search runs dense retrieval and sparse retrieval together and merges their rankings into one result list. The motivation is that the two methods fail in opposite ways. Dense retrieval matches meaning and bridges vocabulary mismatch but can miss a rare proper noun, an exact code, or a precise identifier. Sparse retrieval nails those exact terms but is blind to synonyms and paraphrases. Each covers the other's blind spot, so combining them yields retrieval that is both semantically aware and lexically precise, which is why hybrid search is a common default in production retrieval systems.

The engineering problem is fusion: how to combine two ranked lists whose scores are not on the same scale. A cosine similarity from an embedding model and a BM25 score are not directly comparable, so they cannot simply be added. The standard rank-based answer is Reciprocal Rank Fusion, which ignores the raw scores and combines results by their positions in each list, rewarding documents that rank highly in either. Score-based alternatives normalize each method's scores into a common range first, then take a weighted sum, with the weight set by how much the use case favors semantic recall versus exact matching. Either way, the fused shortlist is frequently handed to a reranking stage that re-scores the merged candidates for a final, sharper order.

Hybrid search matters because real query streams are mixed. The same system is asked fuzzy conceptual questions, where semantics win, and pinpoint lookups for an exact string, where keywords win, often within the same session. Committing to one retrieval method forces a permanent compromise that one class of query will always pay for; hybrid search refuses that compromise by paying a modest cost (running two retrievers and fusing them) to serve both well. In retrieval-augmented generation this lifts the floor on retrieval quality, since the passages handed to the model are less likely to miss either a semantic or a literal match the answer depends on.

This site's Explore surface is dense-first, voyage-3 embeddings in Pinecone followed by a rerank-2 pass, rather than a full hybrid, which is a deliberate fit to a small, meaning-oriented corpus where conceptual recall matters more than exact-token lookup. Hybrid search is the natural next step if exact-identifier queries (a specific model name, a precise repository) ever start slipping past pure semantic search: add a sparse scorer and fuse, and the precision gap closes without sacrificing the semantic recall the site already relies on.
