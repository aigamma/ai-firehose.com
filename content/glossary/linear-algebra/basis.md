---
title: Basis
slug: basis
kind: technique
category: Linear Algebra for ML
aliases: bases, basis vectors, orthonormal basis
related: vector, vector-space, linear-transformation, dot-product, eigenvector, matrix
summary: A minimal set of independent directions from which every vector in a space can be built uniquely by scaling and adding, serving as the coordinate system that turns abstract vectors into concrete number lists.
---

A basis for a vector space is a set of vectors with two properties: they are independent, meaning none of them can be built from the others, and they span the space, meaning every vector in the space can be written as a combination of them. Together these properties make the representation unique: each vector corresponds to exactly one recipe of how much of each basis vector to add. The number of vectors in a basis is the dimension of the space, a fixed quantity no matter which basis you pick.

A basis is what makes coordinates possible. When you write a vector as a list of numbers, those numbers are implicitly the amounts of each standard basis direction, and changing the basis re-expresses the same underlying vector as a different list without moving the vector itself. This freedom is powerful: a problem that looks tangled in one basis can become simple in another, which is the entire strategy behind diagonalization, where switching to a basis of eigenvectors turns a complicated matrix into pure scaling along independent axes.

The most convenient bases are orthonormal: the basis vectors are mutually perpendicular and each has length one. In such a basis the geometry is as clean as it gets, because the coordinate of a vector along any basis direction is just its dot product with that direction, and lengths and angles are computed by simple coordinate formulas. The Fourier basis, the wavelet basis, and the principal components of a dataset are all orthonormal bases chosen to make some structure, frequency content or directions of variance, line up with the axes.

Bases are central to machine learning representation. Learning good features is, in effect, learning a useful basis in which the data's structure becomes linearly accessible. Dimensionality reduction keeps only the most informative basis vectors and discards the rest. The change-of-basis operation is itself a linear transformation represented by a matrix, and recognizing that a model is implicitly working in some learned basis often clarifies what it has actually discovered about the data.
