---
title: Matrix
slug: matrix
kind: technique
category: Linear Algebra for ML
aliases: matrices, weight matrix, 2D array
related: vector, matrix-multiplication, linear-transformation, tensor, eigenvalue, singular-value-decomposition
summary: A rectangular grid of numbers best understood not as a table but as an action: feed it a vector and it hands back a transformed vector. That dual life, data when stored and a function when applied, is what makes the matrix the workhorse object of machine learning.
---

The most useful thing to know about a matrix is that it is secretly a function. A matrix is a rectangular grid of numbers in rows and columns, and you can certainly read it as a plain table, one row per data example, one column per feature, which is how a batch of a thousand images becomes a single object a network processes at once. But the grid earns its central place in machine learning because of what it does, not what it holds: multiply a matrix by a vector and out comes another vector, transformed. The numbers in the grid are the transformation.

The kind of function a matrix performs is always a linear one, which is a strong and useful restriction. It can rotate, scale, shear, reflect, and project space, sending straight lines to straight lines and leaving the origin pinned, but it can never bend a line or curve space. Every layer of a neural network is, at heart, a weight matrix multiplying its incoming vector, and the numbers inside that matrix are exactly what training learns. To train a network is in large part to search for the right matrices.

Matrices compose, and this is where the deepest practical lesson hides. If one matrix sends x to y and another sends y to z, their product is the single matrix that goes straight from x to z. Stack many linear layers with nothing between them and they collapse, by this same rule, into one matrix, which means a deep tower of pure matrix multiplications can express no more than a single layer could. That collapse is precisely why the nonlinear activation functions between layers are not decoration: they are what stops depth from folding flat, and what lets a deep network represent something a shallow one cannot.

A few structures recur often enough to name. The identity matrix leaves every vector untouched, the matrix version of the number one. A square matrix may have an inverse that undoes its action, and may have eigenvalue and eigenvector pairs, the special directions it merely stretches without turning. When a matrix is rectangular or not invertible, the singular value decomposition factors it into a rotation, a set of axis stretches, and another rotation, laying its true geometric effect bare. And a matrix is just the rank-two case of a tensor, one rung up from a vector. The grid is where the data sits; the function is what the grid means.
