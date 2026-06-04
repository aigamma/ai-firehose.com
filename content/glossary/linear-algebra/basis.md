---
title: Basis
slug: basis
kind: technique
category: Linear Algebra for ML
aliases: bases, basis vectors, orthonormal basis
related: vector, vector-space, linear-transformation, dot-product, eigenvector, matrix
summary: A minimal set of independent directions from which every vector in a space can be built in exactly one way, the coordinate system that turns abstract vectors into concrete number lists. Choosing the right basis is often the whole difference between a problem that looks tangled and the same problem made simple.
---

The numbers in a vector are not absolute; they are answers to a question you chose to ask. That question is the basis: a set of reference directions, and the coordinates of a vector are just the recipe for how much of each direction to add up to build it. A basis has to do two jobs, be independent, so no direction is redundant, and span the space, so every vector is reachable, and together those make the recipe unique. The count of directions in any basis is the dimension of the space, a number that does not change no matter which basis you choose.

The freedom to choose that basis is one of the quietly powerful ideas in all of mathematics, because a problem that looks hopeless in one coordinate system can become trivial in another. The same vectors and the same underlying geometry, re-expressed along better-chosen directions, can turn a tangle into a set of independent, simple pieces. This is the whole strategy behind diagonalization, where switching to a basis of eigenvectors turns a complicated matrix into pure scaling along each axis, and behind the Fourier basis, where a messy signal resolves into a clean list of frequencies.

The most convenient bases are orthonormal: the directions are mutually perpendicular and each has length one. In such a basis the geometry is as clean as it gets, because the coordinate of a vector along any direction is simply its dot product with that direction, with no equations to solve, and lengths and angles fall out of plain coordinate formulas. The Fourier basis, the wavelet basis, and the principal components of a dataset are all orthonormal bases chosen so that some structure you care about, frequency content or directions of variance, lines up with the axes.

This is why a basis is not an abstraction to file away but a lens on what machine learning actually does. Learning good features is, in effect, learning a useful basis, one in which the structure of the data becomes linearly accessible, so that a simple model laid on top can succeed. Dimensionality reduction keeps the most informative basis directions and discards the rest. A change of basis is itself a linear transformation, a matrix. Recognizing that a model is implicitly working in some learned basis is often the clearest way to see what it has really discovered about its data.
