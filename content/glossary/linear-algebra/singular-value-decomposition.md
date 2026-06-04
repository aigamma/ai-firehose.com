---
title: Singular Value Decomposition
slug: singular-value-decomposition
kind: technique
category: Linear Algebra for ML
aliases: SVD, singular values, singular vectors
related: matrix, eigenvalue, eigenvector, matrix-multiplication, linear-transformation, basis
summary: The factorization that breaks any matrix into a rotation, a set of axis stretches, and another rotation, revealing that every linear transformation, however complicated it looks, is really just those three steps. Keeping only the largest stretches gives the best low-rank approximation, the single fact behind PCA, recommender systems, and parameter-efficient fine-tuning.
---

The singular value decomposition says something almost too clean to believe: every linear transformation, no matter how tangled it looks, is really just a rotation, a stretch along the axes, and another rotation. Concretely, it factors any matrix, of any shape, into three simpler ones multiplied together: an orthogonal rotation, a diagonal matrix of nonnegative stretches called singular values, and a second orthogonal rotation. Read as a sequence of actions on a vector, that is the whole story of what the matrix does. It is the most universal and revealing factorization in linear algebra, because unlike eigen-decomposition it works for rectangular and non-invertible matrices too.

The singular values are the heart of it. They are the stretch factors along the transformation's principal axes, always nonnegative and listed from largest to smallest. The largest is the most the matrix can stretch any unit vector; the smallest measures how close the matrix comes to collapsing a direction to nothing. The number of nonzero singular values is the rank, the true dimensionality of the matrix's action, and the spread between largest and smallest tells you how numerically dangerous it is to invert. For a symmetric positive matrix the singular values coincide with the eigenvalues.

The SVD's most important use is approximation, and it is the reason the decomposition is everywhere. Keep only the largest few singular values and zero the rest, and you get the best possible low-rank approximation of the matrix, the closest simpler matrix in a precise sense, the content of the Eckart-Young theorem. This single fact powers a great deal of machine learning: principal component analysis is the SVD of centered data, latent semantic analysis compresses word-document matrices, recommender systems factor a sparse ratings matrix into user and item factors, and image and model compression discard the small singular values that carry little signal. Even parameter-efficient fine-tuning, which adapts a giant model through a small low-rank update, rests on the premise the SVD formalizes, that the change a matrix needs lives in a few dimensions.

Conceptually, the SVD ties the whole subject together. The columns of its two rotation matrices are the left and right singular vectors, orthonormal bases for the output and input spaces that play, for any matrix, the role eigenvectors play for symmetric ones. Reading a transformation through its SVD turns an opaque grid of numbers into a clear geometric story of which directions it amplifies, which it suppresses, and which it ignores entirely, which is why it recurs throughout numerical computing, statistics, and modern machine learning.
