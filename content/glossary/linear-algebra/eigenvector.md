---
title: Eigenvector
slug: eigenvector
kind: technique
category: Linear Algebra for ML
aliases: eigenvectors, characteristic vector, principal direction
related: eigenvalue, matrix, linear-transformation, basis, singular-value-decomposition, vector
summary: A special direction that a matrix leaves pointing the same way, stretching or shrinking it but never rotating it, paired with an eigenvalue that says by how much.
---

An eigenvector of a square matrix is a nonzero vector whose direction the matrix preserves. When the matrix acts on most vectors it both turns and rescales them, but an eigenvector comes out pointing along the very same line it started on, only longer or shorter. The factor by which it is rescaled is its eigenvalue. Together the pair answers a precise question: along which directions does this linear transformation act as nothing more than a simple stretch?

These directions are the natural axes of a matrix, the coordinate system in which its behavior is simplest. If you rewrite a matrix using its own eigenvectors as the basis, the matrix becomes diagonal, a pure scaling with no mixing between axes, with the eigenvalues sitting on the diagonal. This diagonalization is what makes eigenvectors so useful: hard operations like raising a matrix to a high power, or running a dynamical system forward many steps, become easy because in the eigenvector basis each axis just evolves independently by its own eigenvalue.

Eigenvectors are the backbone of dimensionality reduction. Principal component analysis represents a cloud of data by the eigenvectors of its covariance matrix, the principal directions along which the data varies most, and projecting onto the top few gives a faithful low-dimensional summary. The same idea drives spectral methods for clustering and graph analysis, where the eigenvectors of a graph's matrix reveal its community structure, and PageRank, where the ranking of web pages is the dominant eigenvector of the link matrix.

Not every matrix has a full set of independent eigenvectors, but the important symmetric case always does, and those eigenvectors are mutually orthogonal, forming a clean orthonormal basis. For general rectangular matrices, where ordinary eigenvectors are not defined, the singular-value-decomposition supplies an analogous pair of orthogonal direction sets, the left and right singular vectors, which is why it is the workhorse generalization across machine learning.
