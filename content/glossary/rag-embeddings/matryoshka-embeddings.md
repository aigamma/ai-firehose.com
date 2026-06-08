---
title: Matryoshka Embeddings
slug: matryoshka-embeddings
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: Matryoshka representation learning, MRL, nested embeddings
related: embedding-model, dense-retrieval, vector-database, approximate-nearest-neighbor, semantic-search, contrastive-learning
summary: An embedding training method that packs information into a vector in order of importance, so a single high-dimensional embedding can be truncated to a shorter prefix and still work, letting one model serve many sizes and enabling cheap coarse-to-fine retrieval. The trick is the training objective: applying the loss to nested prefixes at once forces the most important information into the earliest coordinates.
---

Matryoshka embeddings solve a practical tension in dense retrieval: higher-dimensional vectors usually capture meaning more faithfully, but they cost more to store and slower to search, and the right size depends on the corpus and the latency budget. Normally choosing a dimension means retraining a separate embedding model for each size, because an ordinary embedding spreads its information across all coordinates with no particular ordering, so chopping it down destroys it. Matryoshka representation learning instead trains one model whose vectors degrade gracefully when shortened, named for the nested Russian dolls because a smaller useful vector sits inside the larger one.

The trick is in the training objective. A standard contrastive or similarity loss is applied not only to the full vector but simultaneously to a series of nested prefixes of it, for example the first 64, 128, 256, and full dimensions. Optimizing all of these at once forces the model to load the most important, coarsest-grained information into the earliest coordinates and push finer detail into the later ones. The result is a single embedding that can be truncated to any of the trained lengths and still function as a coherent representation, with accuracy trading off smoothly against size.

This enables an adaptive, coarse-to-fine retrieval strategy that a fixed-size embedding cannot. A system can do a fast first pass using only a short prefix of every vector, which is cheap to store and quick to search, to shortlist candidates, then rerank that shortlist using the full-length vectors for precision. It also lets one stored vector serve different deployments, a memory-constrained device truncating aggressively while a server uses the full dimension, without maintaining multiple models or re-embedding the corpus.

The payoff is flexibility at almost no extra training cost, since the nested losses are computed from the same forward pass. The trade is that a truncated vector is still less accurate than a full one, so the shortest prefix is best used for recall-oriented shortlisting rather than final ranking. Several widely used embedding models now ship Matryoshka-trained vectors, exposing a dimension parameter that maps directly onto where the prefix is cut.
