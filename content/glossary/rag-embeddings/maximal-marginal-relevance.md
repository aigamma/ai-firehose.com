---
title: Maximal Marginal Relevance
slug: maximal-marginal-relevance
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: MMR, maximal-marginal-relevance reranking, diversity reranking
related: semantic-search, reranking, dense-retrieval, embedding-model, retrieval-augmented-generation, chunking
summary: A selection method that builds a result set one item at a time, each step choosing the candidate most relevant to the query while least redundant with what is already chosen, so the set is on-topic and diverse instead of a cluster of near-duplicates. A single relevance-vs-diversity knob tunes the balance, and in a RAG pipeline it stops the context window being wasted on three slices of the same source.
---

Maximal marginal relevance addresses a failure mode of pure relevance ranking: when results are ordered by similarity to the query alone, the top of the list is often several near-duplicates of the single best match. For a search interface this wastes slots, and for retrieval-augmented generation it wastes a model's limited context window on passages that all say the same thing, starving the answer of the other facts it needs. MMR fixes this by trading a little relevance for diversity, so the chosen set covers more of what the query touches on.

The method is greedy and incremental. Starting from a candidate pool (already shortlisted by semantic search), it repeatedly selects the next item to add by scoring each remaining candidate on two terms: how similar it is to the query, and how similar it is to the items already selected. The score rewards query similarity and penalizes the maximum similarity to anything chosen so far, and a tunable weight sets the balance between the two. Pick the highest-scoring candidate, add it to the result set, and repeat. The first pick is just the most relevant item; every later pick is the best compromise between being relevant and being new.

That weight is the single knob, the keeper. Tuned all the way toward relevance, MMR collapses to ordinary similarity ranking and may return redundant results; tuned toward diversity, it spreads the picks across distinct subtopics at the cost of putting some less-relevant items high in the list. The right setting depends on the use: a fact lookup wants relevance, while a survey query or a context pack assembled from many chunks benefits from coverage. Because it operates on already-retrieved candidates and their embeddings, MMR is a lightweight reranking-style post-step, not a replacement for the first-stage retriever.

In a RAG pipeline MMR is a common way to assemble the final context after retrieval. Pulling the top passages by raw similarity can return three slices of the same source document; running MMR over those candidates instead gives the generator a set that is still on-topic but draws from different sources and angles, which tends to produce more complete and less repetitive answers. It is an old idea from document summarization and search that transfers cleanly to embedding-based retrieval.
