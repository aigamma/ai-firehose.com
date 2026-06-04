---
title: Jacobian
slug: jacobian
kind: technique
category: Calculus and Analysis
aliases: jacobian matrix, jacobians
related: gradient, partial-derivative, derivative, hessian, chain-rule, directional-derivative
summary: The matrix of all first-order partial derivatives of a vector-valued function, one row per output, one column per input. It is the best linear approximation of the function near a point, and because backpropagation is the multiplication of one layer's Jacobian after another, the behavior of those products is exactly what makes training stable or unstable.
---

The Jacobian is what the derivative becomes when both the input and the output are vectors. It collects every first-order partial derivative of a function with several inputs and several outputs into one matrix: each row is one output, each column one input, and the entry where they meet is the partial derivative of that output with respect to that input. It generalizes both the derivative and the gradient: for a single-output function the Jacobian is a single row, the gradient transposed, and for a single-input single-output function it collapses back to the ordinary derivative.

Its meaning is that it is the best linear approximation of a vector-valued function near a point. Just as the derivative gives the slope of the tangent line and the gradient gives the tangent plane, the Jacobian gives the linear map that locally stands in for a function from one vector space to another, the matrix the function looks like under a magnifying glass. This makes it the central object whenever a system transforms vectors: in robotics it relates joint velocities to end-effector velocities, in the change-of-variables formula its determinant measures how a transformation stretches or compresses volume, and in dynamical systems its eigenvalues reveal local stability.

In machine learning the Jacobian appears wherever the chain rule crosses layers, because backpropagation is fundamentally the multiplication of layer Jacobians. The gradient of a scalar loss with respect to early parameters is built by chaining together the Jacobians of each intervening transformation, one after another. The properties of these matrices then govern training directly: when their products shrink signals toward zero you get the vanishing gradient problem, and when they amplify signals you get the exploding gradient problem. Careful initialization and normalization are, in large part, attempts to keep these Jacobian products well-behaved, near one in scale.

The Jacobian sits one rung below the Hessian in the hierarchy of derivative objects: taking the Jacobian of the gradient of a scalar function yields the Hessian, the matrix of second derivatives. Frameworks rarely materialize a full Jacobian for a large model because it would be enormous; instead they compute Jacobian-vector and vector-Jacobian products, the cheap directional pieces that forward-mode and reverse-mode automatic differentiation provide, which is all that gradient computation actually requires. You almost never see the Jacobian itself, only its action on a vector.
