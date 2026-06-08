---
title: Cross-Encoder
slug: cross-encoder
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: cross encoder, joint encoder
related: reranking, dense-retrieval, embedding-model, late-interaction, semantic-search
summary: A relevance model that takes a query and a candidate document together as a single input and outputs one relevance score, the most accurate way to judge relevance because full attention runs across both texts, but too slow to scan a corpus since it can precompute nothing. It makes the exact opposite trade from a bi-encoder, which is why the two are paired as retrieve-then-rerank.
---

A cross-encoder scores how well a document answers a query by feeding both into the model at once, joined as a single sequence, and letting full attention run across every query token and every document token before producing one relevance number. This is the most accurate way to judge relevance, because the model can directly compare the two texts term by term rather than through a lossy summary.

The contrast is with the bi-encoder, the design behind dense retrieval, and the opposite trade is the lesson. A bi-encoder embeds the query and each document separately into single vectors and scores by their similarity, and that separation is what makes it fast and scalable: document vectors can be computed once, indexed, and searched with approximate nearest neighbor over millions of items. But encoding each text in isolation, with no chance for the query and document to interact, sacrifices accuracy. The cross-encoder makes the opposite trade: it never encodes anything in isolation, so it is precise, but it must run the full model for every query-document pair and cannot precompute or index anything, which makes scanning a large corpus with it hopeless.

The two are therefore used together in the standard two-stage pipeline. A fast bi-encoder retrieves a shortlist of candidates, the top K by vector similarity, and then a cross-encoder reranks just those K to pick the best N. This is exactly what a reranker is, and it captures most of the cross-encoder's accuracy at a cost bounded by K rather than the corpus size.

Late interaction sits between the two extremes, keeping per-token vectors to recover much of the cross-encoder's precision while remaining indexable, which is why it is sometimes chosen when reranking every query with a full cross-encoder is too slow.
