---
title: Matrix
slug: matrix
kind: technique
category: Linear Algebra for ML
aliases: matrices, weight matrix, 2D array
related: vector, matrix-multiplication, linear-transformation, tensor, eigenvalue, singular-value-decomposition
summary: A rectangular grid of numbers arranged in rows and columns, which represents either a table of data or, more powerfully, a linear transformation that maps vectors to other vectors.
---

A matrix is a rectangular array of numbers with a fixed number of rows and columns. At its plainest it is a table: each row might be one data example and each column one feature, so a dataset of a thousand images with seven hundred eighty four pixels each is a one thousand by seven hundred eighty four matrix. This view alone makes the matrix the standard way to hold a whole batch of vectors in one object, which is why deep learning frameworks pass matrices, not single examples, through every layer.

The deeper view is that a matrix is a function. A matrix acts on a vector through matrix multiplication and returns a new vector, and this action is always a linear transformation: it sends straight lines to straight lines and keeps the origin fixed, so it can rotate, scale, shear, and project space, but never bend it. Every layer of a neural network is, at its core, a matrix multiplying the incoming vector, followed by a nonlinearity. The numbers inside the weight matrix are exactly what training learns.

Matrices compose. If one matrix turns vector x into y and a second matrix turns y into z, then the single matrix product of the two performs both steps at once. This is why a deep stack of linear layers, with nothing between them, collapses into a single matrix, and it is the reason nonlinear activation functions are essential: without them depth would buy no extra expressive power. The shapes must line up for composition to be defined, and tracking those shapes is half the practical work of building a model.

Several special structures recur. The identity matrix leaves every vector unchanged and plays the role of the number one. A square matrix may have an inverse that undoes its action, and may have eigenvalue and eigenvector pairs, the directions it merely stretches without rotating. When a matrix is not square or not invertible, the singular-value-decomposition factors it into a rotation, a set of axis stretches, and another rotation, exposing its true geometric effect. A matrix is also just a two-dimensional tensor, the rank-two case of the more general array.
