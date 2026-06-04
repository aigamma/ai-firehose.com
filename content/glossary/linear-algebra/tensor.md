---
title: Tensor
slug: tensor
kind: technique
category: Linear Algebra for ML
aliases: tensors, ndarray, multidimensional array
related: vector, matrix, matrix-multiplication, linear-transformation
summary: A multidimensional array of numbers that generalizes scalars, vectors, and matrices to any number of axes. It is the single data structure every deep learning framework is built around, and in that world the word means simply a multidimensional array, a deliberate simplification of the stricter object physics calls a tensor.
---

A tensor is what you get by continuing to stack. A single number is a tensor of rank zero, a vector is rank one, a matrix is rank two, and from there you just keep going: a rank-three tensor is a box of numbers, a rank-four tensor a list of such boxes. The rank is simply how many indices you need to pin down one element, and the shape is the size along each axis. Everything you know about vectors and matrices is the low-rank special case of this one object.

Tensors matter because real machine learning data is rarely flat. A color image is naturally a rank-three tensor of height, width, and three color channels; a batch of such images adds a fourth axis for the batch; a sequence of token embeddings fed to a transformer is a rank-three tensor of batch, position, and embedding dimension. Keeping data in its natural multidimensional shape, rather than flattening it into a long vector, is what lets a model exploit structure like spatial locality and sequence order instead of throwing it away.

Operationally, the tensor is the unit the whole software stack is built around, and TensorFlow says so in its name. Frameworks like PyTorch and JAX store tensors, ship them to a GPU, run the dense arithmetic on them in parallel, and record a graph of operations so gradients can be propagated back automatically. Almost every line of a model definition is creating, reshaping, or combining tensors, which is why fluency with tensor shapes is most of the day-to-day skill of building models.

The operations extend the familiar ones. Elementwise addition and scaling work just as for a vector, only across more axes; matrix multiplication generalizes to batched and higher-order contractions that multiply along chosen axes while leaving others untouched; and broadcasting lets a smaller tensor stretch to meet a larger one without copying data. One honest caveat: in physics and pure mathematics a tensor carries a stricter meaning tied to how its components transform under a change of basis, but in deep learning the word almost always means simply a multidimensional array, the rank-N cousin of the matrix, and conflating the two is a common source of confusion.
