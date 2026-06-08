---
title: Embedding Model
slug: embedding-model
kind: technique
category: RAG, Embeddings, and Retrieval
aliases: embedder, text embedding model, sentence embedding
related: semantic-search, vector-database, dense-retrieval, contrastive-learning, retrieval-augmented-generation, reranking
summary: A model that maps a piece of text (or an image, or audio) to a fixed-length vector so that semantically similar inputs land close together, turning meaning into geometry. It is the single component every retrieval and organization feature depends on, and a long-lived commitment: swapping it invalidates every vector already stored, since vectors from two different models are not comparable.
---

An embedding model converts an input into a dense vector, a list of a few hundred to a few thousand real numbers, chosen so the geometry of the vector space mirrors meaning. Two sentences that say nearly the same thing map to nearby points; two that are unrelated map far apart. This turning of meaning into geometry is the bridge that lets a computer compare meaning by comparing coordinates, and it is the foundation under semantic search, clustering, recommendation, and retrieval-augmented generation.

The model is almost always a transformer encoder trained so that distance in the output space tracks similarity of meaning. The usual recipe is contrastive learning: the model is shown pairs that should be close (a question and its answer, two paraphrases) and pairs that should be far, and its parameters are nudged until the learned space respects those relationships. After training, the encoder is run once per document to fill an index and once per query to search it. Similarity is read off with a cheap geometric measure, most often cosine similarity, the cosine of the angle between two vectors, which ignores their length and compares only direction.

Embedding models matter because they are the workhorses that make a corpus searchable by meaning instead of by keyword, and one consequence stands out. The choice of model fixes several downstream properties at once: the dimensionality of every stored vector, the distance metric the vector database must use, the maximum input length, and how well the space generalizes to domains the model did not see in training. Swapping the embedding model invalidates every vector already stored, because vectors from two different models are not comparable, so the model is a long-lived commitment for any production index.

On this site the embedding model is Voyage's voyage-3, producing 1024-dimensional vectors under cosine similarity, and the same model embeds both the corpus and every live query so the two are comparable. Those embeddings do more than power search: they drive the AI-grown taxonomy, where a new candidate concept is bound to an existing one when their embeddings are close enough, and they feed the rotation and clustering math that lays out the dashboard. The embedding model is therefore the single component every other retrieval and organization feature here depends on.
