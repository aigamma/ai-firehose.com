---
title: Dot Product
slug: dot-product
kind: technique
category: Linear Algebra for ML
aliases: inner product, scalar product, dot products
related: vector, norm, matrix-multiplication, basis, vector-space
summary: An operation that multiplies two vectors of the same length into a single number, measuring how much they point in the same direction, and the basic computation underneath similarity, projection, and attention.
---

The dot product takes two vectors of equal length, multiplies them coordinate by coordinate, and sums the results into one number, a scalar. That single number packs a surprising amount of geometry. It equals the product of the two vectors' lengths times the cosine of the angle between them, so it is large and positive when the vectors point the same way, zero when they are perpendicular, and negative when they point in opposite directions. The dot product is therefore the standard way to ask how aligned two vectors are.

This makes the dot product the engine of similarity in machine learning. Comparing two embeddings, a query against a document, one word against another, is almost always a dot product, often normalized by the lengths to give cosine similarity, a pure measure of direction that ignores magnitude. Semantic search, recommendation, and retrieval all rank candidates by the dot product of their vector with a query vector. The same operation defines projection: dividing the dot product of a vector with a unit direction tells you how much of the vector lies along that direction, which is exactly how coordinates relative to a basis are read off.

The dot product is also the atom of larger linear algebra. Each entry of a matrix-multiplication is the dot product of a row from the first matrix with a column from the second, so the whole apparatus of matrices reduces to many dot products run in parallel. A single neuron computes the dot product of its weight vector with its input, then adds a bias and applies a nonlinearity. The attention mechanism in a transformer scores how much each token should attend to each other token by, again, taking dot products between their query and key vectors.

When generalized, the dot product is one example of an inner product, and any space equipped with one gains the notions of length, angle, and orthogonality. The norm of a vector is just the square root of its dot product with itself, which is why length and the dot product are inseparable. Two vectors whose dot product is zero are orthogonal, and a basis of mutually orthogonal unit vectors, an orthonormal basis, is the most convenient coordinate system precisely because in it the dot product becomes plain coordinate-wise multiplication.
