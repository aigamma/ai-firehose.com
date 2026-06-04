---
title: Covariance
slug: covariance
kind: technique
category: Probability and Information Theory
aliases: covariance matrix, correlation, cross-covariance
related: variance, expectation, gaussian-distribution, principal-component-analysis, linear-regression
summary: A measure of how two random variables move together, positive when they rise and fall in step, negative when they trade off. Gathered for many variables into the covariance matrix, it is the shape of a multivariate Gaussian and the object PCA decomposes, but it sees only linear relationships, so zero covariance does not mean independence.
---

Covariance measures the joint variability of two random variables: the degree to which they move together. It is defined as the expectation of the product of each variable's deviation from its own mean. When two variables tend to be above their means together and below them together, their covariance is positive; when one tends to be high while the other is low, it is negative; and when knowing one tells you nothing about the direction of the other, it is zero. Covariance is the natural two-variable generalization of variance, and indeed the covariance of a variable with itself is exactly its variance.

The raw number is hard to interpret because it carries the units of both variables and scales with their spread, so it is often normalized into the correlation coefficient, covariance divided by the product of the two standard deviations, which lives between minus one and one. But a crucial caveat governs both: they measure only linear association. Two variables can be strongly dependent in a nonlinear way, such as a variable and its square, yet have zero covariance, so zero covariance does not mean independence. Independence implies zero covariance, but the converse fails in general, the lone exception being jointly Gaussian variables, for which uncorrelated and independent do coincide.

For a collection of variables the pairwise covariances are gathered into the covariance matrix, a symmetric matrix whose diagonal holds the individual variances and whose off-diagonal entries hold every pairwise covariance. This matrix is always symmetric and positive semidefinite, with nonnegative eigenvalues, and it behaves like a notion of squared spread in every direction at once. It is the central object of multivariate statistics: it fully specifies the shape of a Gaussian distribution in many dimensions, stretching and rotating the probability cloud, and its inverse, the precision matrix, encodes conditional independence structure.

Covariance is everywhere in machine learning because so much of learning is about relationships between features. Principal component analysis is precisely the eigendecomposition of the data covariance matrix: its eigenvectors are the directions of greatest variance and its eigenvalues are the variances along them, which is how the method finds the axes worth keeping. Linear regression estimates coefficients from the covariances between predictors and the target. Whitening transforms data so its covariance becomes the identity, decorrelating features before training. The expectation and variance of linear combinations, the propagation of uncertainty through models, and the behavior of optimizers all route through covariance, making it one of the most load-bearing quantities in applied probability.
