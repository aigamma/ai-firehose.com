---
title: Determinant
slug: determinant
kind: technique
category: Linear Algebra for ML
aliases: determinants, det
related: matrix, eigenvalue, linear-transformation, singular-value-decomposition, jacobian
summary: A single number squeezed from a square matrix that measures how much the transformation scales volume, with a sign for whether it flips orientation. Its most important value is zero, which means the transformation collapses space into a lower dimension, the exact condition for a matrix to be singular and have no inverse.
---

The determinant compresses everything a square matrix does to volume into a single number. Apply the matrix to a unit cube and it maps to a slanted box, a parallelepiped; the determinant is the signed volume of that box. A determinant of three means the transformation triples volumes, one half shrinks them by half, and a negative determinant means the transformation also flips orientation, turning a right-handed frame into a left-handed one. This geometric reading, volume scaling with a sign for orientation, is by far the most useful way to understand what the determinant is, far more than the tangle of cofactors used to compute it.

The most important fact about the determinant is what its being zero means. A determinant of zero says the transformation collapses space into a lower dimension, squashing volume to nothing, which happens exactly when the matrix is singular: its columns are linearly dependent, its rank is deficient, and it has no inverse. So the determinant is a direct test of invertibility, nonzero if and only if the matrix can be undone. A determinant merely close to zero is a warning that the matrix is nearly singular and that inverting it will be numerically unstable, amplifying small errors enormously, which matters constantly in practice.

The determinant is tightly bound to the rest of linear algebra. It equals the product of the matrix's eigenvalues, which makes sense because eigenvalues are the stretch factors along the eigen-directions and volume scaling is their product. It is multiplicative, the determinant of a product is the product of the determinants, and the determinant of an inverse is the reciprocal. These properties let it serve as a compact summary of how a transformation distorts space, and they connect it to the singular value decomposition, whose singular values multiply to its magnitude.

In machine learning the determinant shows up most prominently through the change-of-variables formula, which says how a probability density transforms when its variable is pushed through an invertible map: the new density is the old one divided by the absolute value of the determinant of the map's Jacobian. This is the mathematical core of normalizing flows, which build flexible distributions by composing invertible transformations and must compute log-determinants efficiently to evaluate likelihood. The log-determinant of a covariance matrix appears in the log-density of a Gaussian distribution and in the objective of Gaussian processes. Because a naive determinant is expensive and unstable, practitioners work with log-determinants and exploit structure such as triangular or low-rank forms to keep these terms tractable.
