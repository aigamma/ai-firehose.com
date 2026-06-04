---
title: Norm
slug: norm
kind: technique
category: Linear Algebra for ML
aliases: norms, vector length, magnitude, L2 norm
related: vector, dot-product, vector-space, basis
summary: A function that assigns a length to every vector, formalizing size and distance. There is more than one way to measure length, and the choice has real consequences: the L2 norm gives ordinary straight-line distance, while the L1 norm, by making its unit ball a diamond, is what drives models toward sparse solutions.
---

A norm answers a simple question, how big is this vector, but the interesting fact is that there is more than one honest answer. A norm is any rule that takes a vector and returns a single nonnegative number, its length, subject to three conditions: only the zero vector has length zero, scaling a vector scales its length by the same factor, and the length of a sum never exceeds the sum of the lengths, the triangle inequality. Any rule meeting these behaves like a genuine notion of size, and it immediately gives a notion of distance, since the distance between two vectors is the norm of their difference.

The most common norm is the Euclidean, or L2, norm, ordinary straight-line length, the square root of a vector's dot product with itself. But it is far from the only one. The L1 norm sums the absolute values of the coordinates, the distance you would walk along a grid of city streets, and the L-infinity norm takes the single largest coordinate. Each induces a different shape for the set of vectors at distance one: a round sphere for L2, a diamond for L1, a cube for L-infinity. That shape is not a curiosity, it has real consequences for how models behave.

Norms are everywhere in machine learning because so much of it is measuring magnitude and distance. A loss function reports the norm of the gap between predictions and targets, with mean squared error being a squared L2 norm. Regularization penalizes the norm of the weight vector to keep a model simple, and here the choice of norm shows its teeth: penalizing the L2 norm shrinks weights smoothly toward zero, while penalizing the L1 norm drives many of them exactly to zero, producing sparse models that use only a few features. That sparsity comes directly from the diamond shape of the L1 ball, whose corners poke out along the axes. Gradient clipping caps the norm of the gradient to keep training stable.

Norms also make vectors comparable by stripping out scale. Dividing a vector by its norm yields a unit vector that keeps only direction, the step behind cosine similarity and behind the normalization layers that rescale activations to a controlled magnitude so signals neither vanish nor explode through a deep network. Any norm gives a vector space a geometry of distance, and when that norm comes from a dot product the space also gains angles, which is why the Euclidean norm is the one most often paired with the geometric reasoning of linear algebra.
