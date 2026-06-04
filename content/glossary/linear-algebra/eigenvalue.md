---
title: Eigenvalue
slug: eigenvalue
kind: technique
category: Linear Algebra for ML
aliases: eigenvalues, characteristic value, spectrum
related: eigenvector, matrix, linear-transformation, singular-value-decomposition, vector
summary: A number that captures the pure stretching a matrix does along one of its special, unrotated directions. Most directions get rotated and rescaled by a matrix; an eigenvector is one that only gets rescaled, and its eigenvalue is by how much, a single number that often decides whether a repeated process settles or blows up.
---

Act on most vectors with a matrix and they come out both turned and rescaled. But almost every matrix has a few special directions that come out pointing exactly the way they went in, only longer or shorter, and an eigenvalue is the number that says by how much. Those special directions are the eigenvectors, and along them the matrix does nothing but stretch: an eigenvalue of two doubles vectors in that direction, one half shrinks them, a negative value flips and rescales them, and an eigenvalue of one leaves that direction completely untouched. The eigenvalue is the matrix's pure scaling action, stripped of all rotation.

Eigenvalues matter because they expose what a transformation really does, independent of the coordinate system you happened to write it in. The full set of them, the spectrum, summarizes a matrix's behavior compactly, and their magnitudes carry a consequence that shows up everywhere: they tell you which directions a repeated application of the matrix will amplify and which it will damp, which is exactly what decides whether an iterative process converges to something or explodes to infinity. Their product equals the determinant, the factor by which the transformation scales volume, and their sum equals the trace.

In machine learning eigenvalues surface wherever a problem reduces to a symmetric matrix. Principal component analysis finds the directions of greatest variance by taking the eigenvectors of the covariance matrix, and their eigenvalues say how much variance each direction carries, which is what lets you keep the few that matter and discard the rest. The eigenvalues of the Hessian, the matrix of a loss function's second derivatives, describe the local curvature of the loss landscape: large ones mean steep, narrow valleys and small or negative ones mean flat regions or saddle points, both of which shape how optimization behaves.

Computing eigenvalues means finding the scalars that make the matrix, minus that scalar times the identity, collapse some direction to zero, the characteristic equation. Real symmetric matrices are especially well behaved: their eigenvalues are always real and their eigenvectors form a clean orthogonal basis, which is the content of the spectral theorem and the reason so much of machine learning works with symmetric matrices like covariances and kernels. For non-square or non-symmetric matrices the natural generalization is the singular value decomposition, whose singular values play the role eigenvalues play for symmetric ones.
