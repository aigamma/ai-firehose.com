---
title: Eigenvector
slug: eigenvector
kind: technique
category: Linear Algebra for ML
aliases: eigenvectors, characteristic vector, principal direction
related: eigenvalue, matrix, linear-transformation, basis, singular-value-decomposition, vector
summary: A special direction that a matrix leaves pointing the same way, only stretched, paired with an eigenvalue saying by how much. Eigenvectors are the natural axes of a matrix, the coordinate system in which its action is simplest, which is why they power dimensionality reduction, spectral clustering, and PageRank.
---

An eigenvector of a matrix is a direction the matrix refuses to turn. Act on most vectors and the matrix both rotates and rescales them, but an eigenvector comes out pointing along the very same line it started on, only longer or shorter, and the factor it is scaled by is its eigenvalue. The pair answers a precise question: along which directions does this transformation act as nothing more than a simple stretch? Those directions are the skeleton of what the matrix does.

They are the natural axes of a matrix, the coordinate system in which its behavior is simplest. Rewrite a matrix using its own eigenvectors as the basis and it becomes diagonal, pure scaling with no mixing between axes, the eigenvalues sitting along the diagonal. This diagonalization is why eigenvectors are so useful: hard operations like raising a matrix to a high power, or running a dynamical system forward many steps, become trivial because in the eigenvector basis each axis just evolves independently by its own eigenvalue. A tangled, coupled transformation becomes a set of independent stretches.

Eigenvectors are the backbone of dimensionality reduction. Principal component analysis represents a cloud of data by the eigenvectors of its covariance matrix, the directions along which the data varies most, and projecting onto the top few gives a faithful low-dimensional summary. The same idea drives spectral methods for clustering and graph analysis, where the eigenvectors of a graph's matrix reveal its community structure, and it is literally how PageRank works: the ranking of web pages is the dominant eigenvector of the link matrix, the steady state of a random surfer.

Not every matrix has a full set of independent eigenvectors, but the important symmetric case always does, and those eigenvectors come out mutually orthogonal, forming a clean orthonormal basis, the content of the spectral theorem. For general rectangular matrices, where ordinary eigenvectors are not even defined, the singular value decomposition supplies an analogous pair of orthogonal direction sets, the left and right singular vectors, which is why it is the workhorse generalization across machine learning.
