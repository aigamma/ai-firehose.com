---
title: K-Nearest Neighbors
slug: k-nearest-neighbors
kind: technique
category: Core Machine Learning
aliases: KNN, k-NN, nearest neighbor
related: supervised-learning, decision-tree, kernel-method, dimensionality-reduction, dot-product
summary: A simple non-parametric method that classifies or predicts a point by finding its k closest examples in feature space and taking their majority vote or average; it does no real training, storing the data and deferring all work to query time.
---

K-nearest neighbors is about as direct as machine learning gets: to label a new point, find the k examples nearest to it and let them decide, by majority vote for classification or by averaging for regression. It is a lazy learner, meaning it does no training in the usual sense. There is no model to fit; the dataset itself is the model, and all the computation happens at query time when distances to the stored examples are measured.

Two choices define it. The first is the distance metric, often Euclidean, which requires that features be scaled sensibly, since a feature on a large numeric range would otherwise dominate the distance. The second is k itself: a small k follows the data closely and can be noisy, while a large k smooths the decision and can blur real boundaries, the bias-variance trade made concrete by a single knob.

It is a useful, intuitive baseline and a clean illustration of instance-based learning, and it connects to deeper ideas: the modern picture of embeddings and semantic search is essentially nearest-neighbor retrieval in a learned representation space.

Its great weakness is the curse of dimensionality. In high-dimensional spaces, distances between points become nearly uniform, so "nearest" loses meaning and the method degrades, which is part of why dimensionality reduction and learned low-dimensional representations matter. It is also slow at scale, since a naive query compares against every stored point, motivating the approximate nearest neighbor structures used in vector databases.
