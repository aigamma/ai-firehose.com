---
title: K-Means
slug: k-means
kind: technique
category: Core Machine Learning
aliases: k-means clustering, kmeans, k means
related: unsupervised-learning, principal-component-analysis, kernel-method
summary: An unsupervised clustering algorithm that partitions data into k groups by alternately assigning each point to its nearest cluster center and recomputing each center as the mean of the points assigned to it.
---

K-means is the most widely used clustering algorithm and a staple of Unsupervised Learning. Given a dataset and a chosen number of clusters k, it partitions the points into k groups so that points within a group are close together and points in different groups are far apart. Each cluster is summarized by its center, the centroid, which is the mean of the points belonging to it. The output is an assignment of every point to one of the k clusters, discovered from the data alone with no labels.

K-means matters because clustering is a fundamental way to find structure in unlabeled data, and k-means is fast, simple, and scales to large datasets. It is the default tool for tasks like customer segmentation, grouping documents or images by similarity, compressing color palettes, and quantizing data into representative prototypes. Its centroids also serve as a compact summary of a dataset, useful as features for downstream models or as a quick map of where the data concentrates.

The algorithm alternates two steps until the assignments stop changing. In the assignment step, each point is attached to the nearest centroid by Euclidean distance. In the update step, each centroid is recomputed as the mean of the points now assigned to it. These steps iteratively reduce the total within-cluster squared distance, and the procedure is guaranteed to converge, though only to a local optimum, not necessarily the best possible clustering. Because the result depends on where the centroids start, k-means is run several times from different initializations (the k-means++ seeding scheme spreads the starting centers apart) and the best run is kept.

K-means carries assumptions worth knowing, which connect it to the rest of core machine learning. It tends to find round, similarly sized clusters and struggles when the true clusters are elongated, nested, or of very different densities, because it relies on straight-line distance to a single center. The number of clusters k must be chosen in advance, often guided by heuristics like the elbow method or the silhouette score. When clusters are not linearly separable, a Kernel Method extends the idea to kernel k-means, and Principal Component Analysis is frequently applied first to reduce dimensionality so distances are more meaningful before clustering.
