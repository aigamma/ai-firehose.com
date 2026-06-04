---
title: Vector
slug: vector
kind: technique
category: Linear Algebra for ML
aliases: vectors, feature vector, column vector
related: vector-space, norm, dot-product, basis, matrix, tensor
summary: An ordered list of numbers that doubles as a point in space and an arrow pointing to it. It is the universal container of machine learning: a house, a word, an image, a model's parameters, all become vectors, which is what lets a computer do geometry on meaning.
---

A vector is how you turn a thing into geometry. Formally it is just an ordered list of numbers, written as a column or a row, but the power is in the two ways you can see it: as a point sitting at some location in space, or as an arrow pointing from the origin to that point. A list of three numbers is a point in three-dimensional space you can picture; a list of a thousand numbers is a point in thousand-dimensional space you cannot picture but can reason about with the exact same rules. Each number is a coordinate, the amount of the vector along one independent direction.

Vectors matter because they are the universal container for everything in machine learning. A house becomes a vector of its square footage, bedroom count, and price. A word becomes a vector of hundreds of learned numbers, an embedding, whose geometry captures meaning, so that "king" minus "man" plus "woman" lands near "queen." The parameters of a neural network, the activations flowing through it, and the gradients that train it are all vectors. The moment data is in vector form, the entire toolkit of linear algebra applies to it, which is why turning a problem into vectors is so often the first real step in solving it.

Two operations are what make a pile of vectors into a usable space. You add two vectors by adding their coordinates one position at a time, which geometrically lays the arrows tip to tail. You scale a vector by multiplying every coordinate by one number, stretching or shrinking the arrow and flipping it if the number is negative. These two, addition and scaling, are the entire defining structure of a vector space, and almost everything else in linear algebra is built from them.

A vector also carries a length and a direction, and separating the two is constantly useful. The length, formalized by a norm, is how far the point sits from the origin; divide a vector by its length and you keep only its direction, a unit vector. The dot product folds two vectors into a single number that encodes both their lengths and the angle between them, which is why so much of machine learning, from similarity search to the attention inside a transformer, reduces to dot products. Stack many vectors side by side and you get a matrix; stack data into more than two dimensions and you get a tensor.
