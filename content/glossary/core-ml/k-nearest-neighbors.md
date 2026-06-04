---
title: K-Nearest Neighbors
slug: k-nearest-neighbors
kind: technique
category: Core Machine Learning
aliases: KNN, k-NN, nearest neighbor
related: supervised-learning, decision-tree, kernel-method, dimensionality-reduction, dot-product
summary: About the most direct idea in machine learning: to label a new point, find the handful of most similar stored examples and let them vote. It does no real training, the dataset itself is the model, and that simple idea is exactly what powers modern embeddings and vector search, nearest-neighbor lookup in a learned space.
---

K-nearest neighbors is machine learning stripped to its barest instinct: to decide what something is, find the things most like it and copy their answer. To label a new point you find the k stored examples nearest to it and let them vote, by majority for classification or by averaging for regression. There is no model to fit in the usual sense; it is a lazy learner, doing no work at training time and deferring everything to query time, when distances to the stored examples are finally measured. The dataset is the model.

Two choices define its behavior. The first is the distance metric, usually Euclidean, which enforces a discipline easy to forget: the features must be scaled sensibly, because a feature measured in large numbers will otherwise dominate the distance and drown out the rest. The second is k itself, and it is the bias-variance tradeoff turned into a single visible knob: a small k follows the data closely and is noisy, while a large k smooths the decision and can blur real boundaries. Turning k is turning the dial between memorizing and over-smoothing.

Its real significance today is that it never went away, it just moved into a learned space. The entire modern picture of embeddings and semantic search is k-nearest neighbors performed not on raw features but on vectors a model has learned, where geometric closeness encodes meaning. When a retrieval system finds the documents most relevant to a query, or a recommender finds the users most like you, it is doing nearest-neighbor lookup in a representation space. The oldest, simplest idea in the book turns out to be the engine of one of the most important modern ones.

Its classic weakness is the curse of dimensionality: in very high-dimensional spaces, distances between points become nearly uniform, so "nearest" loses its meaning and the method degrades, which is part of why dimensionality reduction and good learned representations matter so much. It is also slow at scale, since a naive query compares against every stored point, which is exactly why the approximate nearest neighbor structures inside vector databases exist, trading a sliver of accuracy for the speed to search billions of vectors in milliseconds.
