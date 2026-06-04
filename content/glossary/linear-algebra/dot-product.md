---
title: Dot Product
slug: dot-product
kind: technique
category: Linear Algebra for ML
aliases: inner product, scalar product, dot products
related: vector, norm, matrix-multiplication, basis, vector-space
summary: An operation that multiplies two vectors into a single number measuring how much they point the same way. It is the most-used arithmetic in machine learning, the atom of similarity, projection, a neuron's firing, and the attention inside a transformer, because it turns "how aligned are these two things" into one number.
---

The dot product is the most important multiplication in machine learning, and it produces just one number. Take two vectors of equal length, multiply them coordinate by coordinate, and sum the results into a single scalar. That number is dense with geometry: it equals the product of the two vectors' lengths times the cosine of the angle between them, so it is large and positive when they point the same way, zero when they are perpendicular, and negative when they point apart. The dot product is, in one number, the answer to "how aligned are these two vectors."

That makes it the engine of similarity. Comparing two embeddings, a query against a document, one word against another, is almost always a dot product, often normalized by the lengths to give cosine similarity, a pure measure of direction that ignores magnitude. Semantic search, recommendation, and retrieval all rank candidates by the dot product of their vector with a query vector. The same operation defines projection: the dot product of a vector with a unit direction tells you how much of the vector lies along that direction, which is exactly how a coordinate is read off relative to a basis.

It is also the atom from which larger linear algebra is built. Every entry of a matrix multiplication is the dot product of a row from the first matrix with a column from the second, so the whole apparatus of matrices is many dot products run at once, which is why hardware built to multiply matrices is really hardware built to do dot products in parallel. A single neuron computes the dot product of its weight vector with its input, then adds a bias and applies a nonlinearity. And the attention mechanism in a transformer scores how much each token should attend to each other token by, once again, taking dot products between their query and key vectors.

Generalized, the dot product is one example of an inner product, and any space equipped with one gains the notions of length, angle, and orthogonality. The norm of a vector is just the square root of its dot product with itself, which is why length and the dot product are inseparable. Two vectors whose dot product is zero are orthogonal, and a basis of mutually orthogonal unit vectors is the most convenient coordinate system precisely because in it the dot product collapses to plain coordinate-wise multiplication. The humble dot product is the single thread running through similarity, geometry, neurons, and attention alike.
