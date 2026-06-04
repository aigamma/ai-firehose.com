---
title: Positive Definite Matrix
slug: positive-definite-matrix
kind: technique
category: Linear Algebra for ML
aliases: positive definiteness, positive semidefinite, symmetric positive definite
related: eigenvalue, hessian, convexity, matrix, gaussian-distribution
summary: A symmetric matrix that acts like a positive number: its quadratic form is always positive, equivalently all its eigenvalues are positive. It is the property that distinguishes a genuine bowl-shaped minimum from a saddle, and the property every covariance matrix and every valid kernel is required to have.
---

A positive definite matrix is the matrix version of a positive number. The precise condition is that its quadratic form is always positive: take any nonzero vector, multiply it on both sides of the matrix, and the resulting scalar is strictly greater than zero. Geometrically the matrix carves out a bowl that curves upward in every direction, never flat and never downhill. The slightly weaker positive semidefinite condition allows the form to be zero in some directions but never negative, a bowl with flat-bottomed valleys. These conditions capture what it means for a matrix to represent an unambiguous notion of squared length or energy, always nonnegative.

Several different-looking tests for positive definiteness all coincide, and knowing they are the same is much of understanding the concept. A symmetric matrix is positive definite if and only if all of its eigenvalues are strictly positive, and positive semidefinite when they are all nonnegative. Equivalently, it admits a Cholesky factorization into a lower triangular matrix times its transpose, which is both a test and the standard efficient way to exploit the structure in computation. And because the eigenvalues are positive, the determinant, their product, is positive too, so the matrix is guaranteed invertible. The quadratic form, the spectrum, and the factorization are three lenses on one property.

Positive definiteness is central to optimization because it is exactly what distinguishes a true minimum from the other places a gradient vanishes. At a stationary point of a smooth loss, the Hessian of second derivatives tells you the local shape: if the Hessian is positive definite the point is a genuine minimum, a bowl curving up in all directions; if its eigenvalues have mixed signs the point is a saddle. A function whose Hessian is positive definite everywhere is strictly convex, which is why convexity and positive definiteness are so often discussed together, and why second-order methods that step using the inverse Hessian assume or enforce it to point reliably downhill.

The property is equally indispensable, and not optional, in probabilistic and kernel methods. Every covariance matrix is symmetric positive semidefinite, since variance in any direction cannot be negative, and a valid covariance for a non-degenerate Gaussian distribution must be strictly positive definite so its inverse and log-determinant exist. The kernel matrix that defines a support vector machine or a Gaussian process must be positive semidefinite for the method to correspond to an inner product in some feature space, which is the content of Mercer's condition. Whenever a matrix is meant to encode similarity, energy, or squared distance, positive definiteness is the property that makes that meaning coherent.
