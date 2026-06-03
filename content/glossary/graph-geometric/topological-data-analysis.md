---
title: Topological Data Analysis
slug: topological-data-analysis
kind: technique
category: Graph and Geometric Learning
aliases: TDA, persistent homology
related: manifold-hypothesis, manifold, dimensionality-reduction, curvature, node-embedding, geometric-deep-learning
summary: A family of methods that extract the shape of data, its connected pieces, loops, and higher-dimensional voids, using tools from topology to find structure that is robust to noise and invariant to bending or stretching.
---

Topological data analysis, or TDA, studies the shape of data. Where most analysis asks where points sit and how far apart they are, topology asks coarser, more durable questions: how many separate clusters are there, are there loops or holes, are there enclosed voids in higher dimensions. These features survive continuous deformation, so stretching, bending, or mild distortion of the data does not change them, which makes them a stable summary of structure that exact coordinates and distances do not provide.

TDA matters because real data often has global organization that local, pointwise methods miss. A loop in a dataset might signal a periodic or cyclic process; a cluster count reveals discrete regimes; a void can indicate a forbidden region of the feature space. Because topological features are invariant to the specific embedding and tolerant of noise, they give a robust fingerprint of a dataset's structure, useful for exploration, for comparing datasets, and as features fed into downstream models.

The central tool is persistent homology. The method builds a graph or a higher-dimensional complex on the data by connecting points that fall within a distance threshold, then grows that threshold from zero upward and watches topological features appear and disappear. Features that persist across a wide range of thresholds are treated as real structure; those that flicker in and out briefly are treated as noise. The result is summarized in a persistence diagram or barcode, a compact, comparable signature of the data's shape across all scales at once. A second well-known TDA tool, the Mapper algorithm, builds a simplified graph that compresses a high-dimensional cloud into a navigable skeleton of its shape.

Topological data analysis connects naturally to the geometric view of machine learning. The manifold hypothesis holds that data lies on a low-dimensional curved surface, a manifold, and TDA is one of the few approaches that can measure that surface's global topology, its number of components and holes, directly from samples, complementing the local picture that curvature and metric give. It pairs with dimensionality reduction, which lays a manifold out in few coordinates while TDA certifies which holes and components are genuine rather than artifacts of the layout. And topological summaries can be turned into features or differentiable losses for models, a bridge to geometric deep learning that lets a network be guided by, or made aware of, the shape of its data.
