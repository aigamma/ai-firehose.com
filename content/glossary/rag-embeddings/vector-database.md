---
title: Vector Database
slug: vector-database
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: vector store, vector index, vector search engine
related: embedding-model, approximate-nearest-neighbor, hnsw, semantic-search, retrieval-augmented-generation, dense-retrieval
summary: A datastore built to index and query high-dimensional vectors by similarity, returning the stored vectors nearest a query vector quickly, usually via approximate nearest neighbor search plus metadata filtering. It is the storage layer beneath semantic search, and its one silent trap is the distance metric: it must match the metric the embedding model was trained for, or every result quietly degrades.
---

A vector database stores the output of an embedding model and answers one core question fast: given a query vector, which stored vectors are closest. A relational database is built to match exact values and ranges; it has no efficient way to ask for the nearest points in a 1024-dimensional space. A vector database is purpose-built for exactly that, making it the storage layer beneath semantic search and retrieval-augmented generation.

The central difficulty is scale. Comparing a query against every stored vector, an exact brute-force scan, costs time linear in the corpus and becomes infeasible at millions of items. So vector databases lean on approximate nearest neighbor search, which trades a little recall for orders-of-magnitude speed by navigating an index structure instead of scanning. The dominant structure is HNSW, a navigable graph that lets a search hop toward the query's neighborhood in logarithmic-like time. On top of similarity, production systems layer metadata filtering, so a query can be constrained to a date range, a source, or a content kind while still ranking by vector distance.

Vector databases matter because they make embeddings usable at production scale and latency. They handle the operational concerns a raw index does not: upserts and deletes as the corpus changes, persistence, sharding, and the bookkeeping that keeps the index consistent. The subtle trap is one of those details that silently breaks results: most enforce a chosen distance metric (cosine, dot product, or Euclidean) that must match the one the embedding model was trained for, since a mismatch degrades every result without raising any error. Idempotent writes keyed on a deterministic id are what let a pipeline re-run safely, skipping unchanged content and pruning what no longer belongs.

This site uses Pinecone as its vector database, a single index named ai-firehose holding voyage-3 vectors at 1024 dimensions under cosine, in one namespace with metadata filters. Every chunk is upserted under a deterministic id derived from a content hash, so re-running the pipeline on unchanged data is a no-op and orphaned vectors are pruned. The retention rule, nothing older than a rolling quarter, is enforced as deletes against this database, which keeps both the index and its query cost flat no matter how long the site runs.
