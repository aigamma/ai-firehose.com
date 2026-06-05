---
title: HNSW
slug: hnsw
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: Hierarchical Navigable Small World, HNSW graph
related: approximate-nearest-neighbor, vector-database, semantic-search, embedding-model, dense-retrieval
summary: Hierarchical Navigable Small World, a graph-based index for approximate nearest neighbor search that connects vectors into a layered proximity graph and finds neighbors by greedily hopping toward the query. It turns search into navigation across a network rather than a scan of a list, and the small-world edges plus hierarchical layers give it the logarithmic-like scaling that makes it most vector databases' default.
---

HNSW, short for Hierarchical Navigable Small World, is the index structure that most modern vector databases reach for to do approximate nearest neighbor search. It organizes the stored vectors into a graph whose edges connect each vector to a handful of its near neighbors, then searches that graph by starting at an entry point and repeatedly stepping to whichever connected vector sits closer to the query, until no closer neighbor remains. Search becomes navigation across a network rather than a scan of a list, which is what makes it fast.

Two ideas combine in the name, and together they are the keeper. A "small world" graph mixes mostly-local edges with a few long-range ones, so any two nodes are reachable in a small number of hops, the same property that makes social networks navigable; the "hierarchical" part stacks several such graphs in layers, sparse upper layers with long-range links letting a search cover huge distances in a few steps, and progressively denser lower layers refining the result down to the true local neighborhood. A query enters at the top, descends layer by layer, and lands precisely, giving the structure its characteristic logarithmic-like scaling with corpus size.

HNSW matters because it sits at a strong point on the recall-versus-latency curve and does so with a graph that supports incremental inserts, which production systems need as their corpus grows. Its behavior is governed by a few parameters: the number of neighbors stored per node, an effort setting used while building the graph, and a search-time effort that widens or narrows the explored frontier. Raising them lifts recall and quality at the cost of memory and speed. The main trade-offs are memory, since the graph's edges must be held in RAM for fast traversal, and the cost of deletions, which graph indexes handle less gracefully than inserts.

On this site, HNSW (or a close relative) is the machinery inside Pinecone that answers every similarity query over the voyage-3 vectors: each Explore search, concept-neighbor lookup, and related-item fetch traverses such a graph rather than comparing against the whole corpus. The site does not tune the index by hand, but it benefits from HNSW's strengths directly, and the rolling-quarter retention that keeps the corpus small also keeps the graph compact, which is exactly the regime where this structure performs best.
