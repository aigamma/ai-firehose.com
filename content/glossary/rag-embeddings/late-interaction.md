---
title: Late Interaction
slug: late-interaction
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: ColBERT, late-interaction retrieval, token-level retrieval
related: dense-retrieval, reranking, embedding-model, semantic-search, approximate-nearest-neighbor, retrieval-augmented-generation
summary: A retrieval method that encodes a query and a document into per-token embeddings and scores relevance by summing each query token's best match against the document tokens (MaxSim), keeping the fine-grained term interactions a single pooled vector discards. It is the middle path, cross-encoder-like precision while staying indexable, bought with the cost of storing a vector per token rather than per document.
---

Late interaction is a middle path between the two classic ways to retrieve text. Ordinary dense retrieval encodes a whole query and a whole document each into one pooled vector and scores them by a single dot product; that is fast and lets a vector database do the search, but compressing a passage into one vector loses detail, so a document that matches the query on one crucial term can be outranked because its average meaning drifts. A cross-encoder fixes the detail problem by feeding query and document together through a model, but it must rerun the model for every query-document pair, so it cannot scale to a large corpus on its own.

Late interaction, introduced by ColBERT, keeps per-token detail without paying the cross-encoder's price at query time, the keeper. It encodes the query into a vector per query token and each document into a vector per document token, independently, and relevance is then scored with a late step, after encoding, often called MaxSim: for each query token, find its best-matching document token by similarity, and sum those best matches over the query. Because the document vectors are computed and stored ahead of time, only the query is encoded live, and the scoring is cheap arithmetic over precomputed vectors.

The name captures the design: the interaction between query and document happens late, at scoring time, rather than early inside a shared encoder. This preserves term-level signal, so late interaction tends to retrieve with accuracy closer to a cross-encoder while staying far more scalable, and it is robust on rare terms and out-of-domain text where single-vector dense retrieval can wash out.

The trade is storage and engineering. Keeping a vector for every token, rather than one per document, inflates the index by one to two orders of magnitude, so practical systems compress those vectors and use approximate nearest neighbor search to shortlist candidates before the MaxSim scoring. In a retrieval-augmented generation stack it often serves as a strong first-stage retriever or a scalable alternative to a separate reranking pass.
