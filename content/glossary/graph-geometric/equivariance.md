---
title: Equivariance
slug: equivariance
kind: technique
category: Graph and Geometric Learning
aliases: equivariant, equivariant network
related: geometric-deep-learning, group-equivariant-network, graph-neural-network, convolutional-neural-network, manifold, message-passing
summary: A property whereby transforming the input produces a correspondingly transformed output, so symmetries of the data pass through the computation rather than being destroyed by it. Invariance, where the output does not change at all, is the special case; equivariance is the more useful general condition, and it is the formal language for telling a network which transformations of the world to treat as not mattering.
---

Equivariance means the output of a function transforms in step with its input: rotate the input and the output rotates the same way. Formally, applying a symmetry transformation to the input and then running the function gives the same result as running the function first and then applying the corresponding transformation to the output. Invariance is the special case where the output does not change at all under the transformation; equivariance is the more general and often more useful condition, because it preserves structure instead of discarding it.

Equivariance matters because the symmetries of a problem are prior knowledge a model should not have to relearn from data. If the meaning of an image does not change when it shifts a few pixels, a network equivariant to translation gets that fact for free, which is exactly why a convolutional neural network shares one filter across all positions: convolution is translation-equivariant by construction. Building the right symmetry into the architecture is a powerful inductive bias that improves sample efficiency and generalization, because the model spends its capacity on the genuine variation in the data rather than on memorizing every shifted, rotated, or relabeled copy of the same pattern.

The most consequential symmetries differ by data type, and each motivates a class of architectures. Permutation symmetry, the fact that a graph has no canonical node ordering, makes the graph neural network and its message passing permutation-equivariant; translation symmetry on a grid gives the CNN; rotation and reflection symmetry in physical space, the Euclidean group, motivates the group-equivariant network and steerable models used for molecules and 3D point clouds, where a rotated molecule must yield a correspondingly rotated prediction; and on a curved domain the relevant symmetry is the freedom to change coordinates on a manifold, which gauge-equivariant networks respect.

The connection to geometry runs to the foundation of the field, and what equivariance is for is the key. Geometric deep learning is the program of designing models around the symmetry group of the data, and equivariance is its central organizing principle: choose the group that leaves your data's meaning unchanged, then constrain the network so every layer commutes with that group. The transformer fits the same scheme, since self-attention is permutation-equivariant over its tokens, which is precisely why it needs positional encoding to break that symmetry when order actually matters. Equivariance, in short, is the formal language for telling a network which transformations of the world to treat as not mattering.
