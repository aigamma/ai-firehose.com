---
title: Linear Transformation
slug: linear-transformation
kind: technique
category: Linear Algebra for ML
aliases: linear map, linear transformations, linear operator
related: matrix, vector, matrix-multiplication, basis, eigenvector, vector-space
summary: A function between vector spaces that preserves addition and scaling, which forces a rigid geometry: it can rotate, scale, shear, and project, but it can never bend a straight line or move the origin. Every such map is a matrix, and a stack of them is exactly a neural network layer, which is why the nonlinearity between layers is essential.
---

A linear transformation is a function so constrained that it can only do a few things, and that constraint is the whole point. It maps vectors to vectors while respecting two operations: the transformation of a sum equals the sum of the transformations, and the transformation of a scaled vector equals the scaling of its transformation. These conditions sound abstract but carry a sharp geometric consequence. A linear transformation keeps the origin fixed, sends straight lines to straight lines, and keeps parallel lines parallel and evenly spaced. It can rotate, scale, shear, reflect, and project space, but it can never bend a line or move the origin. That is the entire menu.

The crucial fact is that every linear transformation between finite-dimensional spaces is a matrix, and applying it is matrix multiplication. Once you know where the transformation sends each basis vector, you know where it sends every vector, because any vector is a combination of basis vectors and the transformation respects combinations. Stack those images as columns and you have the matrix; the abstract idea and the concrete grid of numbers are two views of one object, and composing transformations is multiplying their matrices.

Linear transformations are the skeleton of deep learning, and their rigidity is exactly why deep learning needs something more. Each layer of a network applies a linear transformation, its weight matrix, to its input, and then a nonlinear activation bends the result. Without that bend, the composition of many linear layers would collapse into a single linear transformation, and the network could express nothing a one-layer model could not, no matter how deep. The nonlinearity exists precisely to escape the menu of things a linear map can do, which is why understanding what linearity forbids is understanding why the nonlinearity is there at all.

The structure of a linear transformation is read off from special vectors and subspaces. Its eigenvectors are the directions it merely stretches, the axes along which it acts most simply. Its null space is the set of vectors it crushes to zero, and its range is the set it can produce, the two together governing what information it preserves and what it discards. For transformations that are not square or not invertible, the singular value decomposition lays the geometry bare as a rotation, a set of axis scalings, and another rotation, the cleanest possible picture of what any linear map does.
