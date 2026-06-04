---
title: Vector Space
slug: vector-space
kind: technique
category: Linear Algebra for ML
aliases: vector spaces, linear space
related: vector, basis, norm, dot-product, linear-transformation, matrix
summary: Any collection of objects you can add together and scale by numbers while obeying a short list of consistency rules. The point of the abstraction is reach: lists of numbers, polynomials, functions, and images all qualify, so one body of theory, dimension, basis, linear maps, applies to all of them at once.
---

A vector space is defined not by what its elements are but by what you can do with them. It is any collection of objects, called vectors, that you can add together and multiply by numbers, called scalars, such that the results stay inside the collection and obey a short list of natural rules: addition is commutative and associative, there is a zero that changes nothing, every vector has a negative that cancels it, and scaling distributes over addition sensibly. The axioms are deliberately minimal, and anything that satisfies them earns the full power of linear algebra, no matter what its elements actually are.

The payoff of that abstraction is reach. Lists of numbers are the familiar example, but so are polynomials, continuous functions, the solutions of a linear differential equation, and the space of all images of a given size. Because they all share the same two operations and the same axioms, a single body of theory, the same notions of dimension, basis, and linear transformation, applies to every one of them at once. Prove something about abstract vector spaces and you have proved it simultaneously for functions, signals, and data. In machine learning the relevant spaces are usually high-dimensional spaces of real-valued vectors, where embeddings, parameters, and activations all live.

What gives a vector space its grip is the structure built on top of the axioms. A basis is a minimal set of directions from which every vector can be uniquely reconstructed by scaling and adding, and the number of vectors in a basis is the dimension, a fixed property of the space. Choosing a basis turns abstract vectors into concrete coordinate lists, and changing basis re-expresses the same vectors in a new coordinate system without moving the underlying objects. The functions between vector spaces that respect addition and scaling are the linear transformations, represented concretely by a matrix.

Most vector spaces in practice carry extra geometry layered on the bare axioms. Adding a dot product, or more generally an inner product, equips the space with lengths, angles, and orthogonality, turning it into an inner product space; adding just a norm gives lengths and distances without angles. This added geometry is exactly what lets machine learning speak of how similar two embeddings are, how far a prediction sits from its target, and which directions are independent, all of which are statements about the structure of a vector space.
