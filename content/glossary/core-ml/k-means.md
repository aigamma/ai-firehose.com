---
title: K-Means
slug: k-means
kind: technique
category: Core Machine Learning
aliases: k-means clustering, kmeans, k means
related: unsupervised-learning, clustering, principal-component-analysis, kernel-method
summary: A clustering algorithm that splits data into k groups by alternating two steps: assign each point to its nearest center, then move each center to the mean of its members. It is fast and ubiquitous, and the simplicity hides a strong assumption, that clusters are round, separate blobs of similar size.
---

k-means answers one question, where does the data concentrate, with one of the simplest loops in machine learning. Pick a number of clusters k, scatter k centers, then repeat two steps until nothing moves: assign every point to its nearest center, and move every center to the average of the points that chose it. Each cluster ends up summarized by its centroid, the mean of its members, and every point belongs to exactly one, all discovered from the data with no labels. It is a default first move in unsupervised learning for a reason: it is fast, it scales, and you can explain it in a sentence.

The two-step dance is not arbitrary. It is coordinate descent on a single objective, the total squared distance from each point to its center, and each step provably lowers that objective, which is why the algorithm always converges. The catch is that it converges to a local optimum, not necessarily the best one, and which local optimum you land in depends entirely on where the centers started. That is why k-means is run several times from different seeds, with the k-means++ scheme spreading the initial centers apart so a single unlucky start does not produce a bad clustering.

Because it is cheap and its centroids double as a compact summary, k-means turns up everywhere: segmenting customers, grouping documents or images, quantizing the colors of an image down to a small palette, and producing prototype features for downstream models. Whenever you want a fast, rough map of where a dataset clumps, it is the natural tool, and its centroids hand you that map in a form you can store and reuse.

What the one-sentence description hides is a strong assumption about what a cluster even is. Because every point is judged only by straight-line distance to a single center, k-means can carve space only into convex, roughly spherical cells of similar size, the Voronoi regions around the centroids. Hand it crescents, nested rings, or clusters of very different density and it will split them confidently and wrongly, because the shape it is hunting for is not the shape that is there. You must also fix k in advance, before you know how many groups exist. The lesson generalizes past this one algorithm: every clustering method smuggles in a definition of "similar," and k-means just makes the cost of that hidden choice unusually easy to see.
