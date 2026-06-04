---
title: Orthogonality
slug: orthogonality
kind: technique
category: Linear Algebra for ML
aliases: orthogonal, orthonormal, orthogonal matrix
related: dot-product, basis, norm, singular-value-decomposition, vector-space
summary: The generalization of perpendicularity to any number of dimensions: two vectors are orthogonal when their dot product is zero, sharing no component along each other. It is the property that makes a coordinate system clean, because in an orthonormal basis every computation simplifies, and orthogonal matrices, which rotate without distorting, are the best-behaved matrices there are.
---

Orthogonality is perpendicularity freed from three dimensions. Two vectors are orthogonal when their dot product is zero, which in ordinary space means they meet at a right angle, but the definition extends cleanly to any number of dimensions and to abstract inner-product spaces where geometric intuition runs out. What it captures is independence of direction: moving along one orthogonal vector does nothing to your position along another, they share no component. A set of vectors that are mutually orthogonal and each of unit length is orthonormal, the cleanest possible kind of coordinate system.

An orthonormal basis is the reason orthogonality matters so much in practice, because in one every computation simplifies. When the basis vectors are mutually perpendicular and normalized, the coordinate of a vector along any direction is just its dot product with that direction, with no system of equations to solve; lengths and angles follow from plain coordinate formulas; and projecting a vector onto a subspace reduces to summing its projections onto the individual directions. This is why orthonormal bases are the preferred frame for nearly every computation, and why the Gram-Schmidt process, which turns any basis into an orthonormal one, is such a fundamental tool.

A square matrix whose columns form an orthonormal set is an orthogonal matrix, and these are the rigid motions of space: rotations and reflections. An orthogonal matrix preserves the norm of every vector and the angle between every pair, so it moves points around without stretching, shearing, or distorting any structure. Its inverse is simply its transpose, which makes orthogonal matrices exceptionally cheap and numerically stable to work with, since transposing never amplifies error the way inverting a general matrix can. The rotation matrices in the singular value decomposition are orthogonal, which is exactly why that factorization is so well behaved.

Orthogonality is woven throughout machine learning. Principal component analysis produces orthogonal directions of variance, so the components are uncorrelated and each captures a distinct slice of the data. Orthogonal weight initialization keeps signal magnitudes stable as they pass through a deep network, mitigating vanishing and exploding gradients by ensuring each layer neither inflates nor shrinks the norm of its input. Decorrelating or whitening features relies on orthogonal transforms, and the numerical stability of least-squares solvers comes from QR factorization into an orthogonal matrix and a triangular one. Wherever a method needs to change coordinates without distorting the geometry, or to keep distinct components from interfering, orthogonality is the property it leans on.
