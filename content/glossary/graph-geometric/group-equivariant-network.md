---
title: Group-Equivariant Network
slug: group-equivariant-network
kind: technique
category: Graph and Geometric Learning
aliases: G-CNN, group equivariant convolutional network, steerable network
related: equivariance, geometric-deep-learning, convolutional-neural-network, graph-neural-network, manifold, riemannian-manifold
summary: A neural network whose layers are equivariant to a chosen symmetry group such as rotations and reflections, so that transforming the input produces a correspondingly transformed output and the symmetry is guaranteed by construction rather than learned from data.
---

A group-equivariant network generalizes the convolutional neural network from translation symmetry to a richer symmetry group, most commonly the rotations and reflections of the Euclidean group. An ordinary convolution is equivariant only to shifts: move the input and the feature map moves with it. A group-equivariant convolution, by contrast, also commutes with rotations and mirror images, so a rotated input yields a correspondingly rotated set of features. The symmetry is wired into the architecture, holding exactly and for every input, rather than being approximated through data augmentation that only encourages it on the examples seen.

These networks matter wherever orientation should not change meaning. The diagnosis of a tumor in a medical scan does not depend on how the scan is rotated; the energy of a molecule does not depend on its orientation in space; a pattern on a microscope slide is the same pattern flipped. Hard-coding that invariance makes a model far more sample-efficient, because it no longer has to see every rotated copy of a pattern to recognize it, and it makes predictions consistent under transformations a less principled model would get wrong. For 3D data such as molecules and point clouds, equivariance to rotation is often essential rather than merely helpful, since physically meaningful outputs like forces and dipoles must rotate together with the input.

Mechanically, a group-equivariant network replaces the translation-only weight sharing of a CNN with weight sharing across the whole group. One way to see it: the same learned filter is applied in every rotated orientation, and the feature maps are indexed not only by position but also by group element, so each layer carries an explicit account of how features transform under the symmetry. Steerable variants achieve the same effect more efficiently by constraining filters to a basis that transforms in a known way, avoiding the cost of materializing every rotated copy. Invariant pooling at the end collapses the group dimension when a single symmetry-free answer is finally wanted.

The group-equivariant network is the clearest worked example of geometric deep learning's central claim, that architectures should be derived from the symmetry group of the data. It and the graph neural network are siblings: one builds in the continuous symmetries of Euclidean space, the other the discrete permutation symmetry of graphs, and both rest on the single principle of equivariance. Extending the idea from flat Euclidean space to curved domains gives gauge-equivariant networks, which respect the local coordinate freedom of a manifold or Riemannian manifold and so let the same symmetry-first design operate on surfaces and meshes rather than only on grids.
