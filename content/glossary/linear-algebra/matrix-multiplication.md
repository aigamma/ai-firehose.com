---
title: Matrix Multiplication
slug: matrix-multiplication
kind: technique
category: Linear Algebra for ML
aliases: matmul, matrix product, matrix-vector product
related: matrix, vector, dot-product, linear-transformation, tensor
summary: The operation that combines two matrices by taking dot products of rows with columns. The strange rule is exactly right because it composes functions: multiplying two matrices builds the single matrix that applies one transformation after the other, and because a neural network is a chain of these products, it is the operation most of the world's compute is spent on.
---

Matrix multiplication combines an m-by-n matrix with an n-by-p matrix to produce an m-by-p one, and each entry of the result is the dot product of one row from the left with one column from the right. The inner dimensions must match, the shared n, which is the single rule governing whether two matrices can be multiplied at all and the first thing to check when shapes refuse to line up. Unlike multiplying numbers, order matters: A times B is generally not B times A, because applying one transformation and then another is not the same as doing them in the other order.

The reason this particular, slightly awkward rule is the right one is that it composes functions. A matrix is a linear transformation, and multiplying two matrices produces the single matrix that applies one transformation after the other. Rotating space and then scaling it is itself a transformation, and its matrix is exactly the product of the rotation and scaling matrices. The matrix-vector product is the special case where the right operand has one column: it is the act of feeding a vector through a transformation to get its output. Composition is the whole point, and the rule is reverse-engineered to make composition work.

Matrix multiplication is also where most of the world's machine learning compute goes. A forward pass through a neural network is a chain of matrix multiplications, each layer multiplying its weight matrix by the batch of incoming activations, interleaved with nonlinearities, and training adds still more to compute the gradients. This is why GPUs and TPUs are built first and foremost to multiply matrices fast, and why expressing a model as a few large dense matrix products, rather than many small scattered operations, is what makes it run efficiently. The economics of AI are, at the hardware level, the economics of this one operation.

Because it is so central, it generalizes. Batched matrix multiplication runs many independent products at once across the leading axes of a tensor, which is how an attention layer multiplies per-head query and key matrices for every example in a batch simultaneously. The same contraction underlies convolution when it is unrolled, and the singular value decomposition expresses any matrix as a product of three simpler ones. Mastering which dimensions contract and which are preserved is, in practice, most of what it takes to read and write model code.
