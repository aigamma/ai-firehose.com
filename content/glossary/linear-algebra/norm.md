---
title: Norm
slug: norm
kind: technique
category: Linear Algebra for ML
aliases: norms, vector length, magnitude, L2 norm
related: vector, dot-product, vector-space, basis
summary: A function that assigns a nonnegative length to every vector, formalizing magnitude and distance, and underpinning loss functions, regularization, and normalization in machine learning.
---

A norm is a rule that takes a vector and returns a single nonnegative number, its length or magnitude. To count as a norm the rule must satisfy three properties: only the zero vector has length zero, scaling a vector multiplies its length by the same factor, and the length of a sum is never more than the sum of the lengths, the triangle inequality. These properties guarantee that the norm behaves like an honest notion of size, and they let it define distance, since the distance between two vectors is simply the norm of their difference.

The most common norm is the Euclidean or L2 norm, the ordinary straight-line length, which is the square root of the dot product of a vector with itself, the familiar root of the sum of squared coordinates. It is far from the only one. The L1 norm sums the absolute values of the coordinates, the distance you would travel along a grid of streets, and the L-infinity norm takes the single largest coordinate. Each norm induces a different shape for the set of vectors at distance one, a sphere for L2, a diamond for L1, and a cube for L-infinity, and that shape has real consequences for how models behave.

Norms are everywhere in machine learning because so much of it is about measuring magnitude and distance. A loss function reports the norm of the gap between predictions and targets, with mean squared error being a squared L2 norm. Regularization penalizes the norm of the weight vector to keep a model simple: penalizing the L2 norm shrinks weights smoothly toward zero, while penalizing the L1 norm drives many of them exactly to zero, producing sparse models that use only a few features. Gradient clipping caps the norm of the gradient to keep training stable.

Norms also make vectors comparable by removing scale. Dividing a vector by its norm yields a unit vector that keeps only direction, the step behind cosine similarity and behind normalization layers that rescale activations to a controlled magnitude so that signals neither vanish nor explode as they pass through a deep network. Any norm gives a vector space a geometry of distance, and when that norm comes from a dot product the space also gains angles, which is why the Euclidean norm is the one most often paired with the geometric reasoning of linear algebra.
