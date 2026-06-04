---
title: Chain Rule
slug: chain-rule
kind: technique
category: Calculus and Analysis
aliases: chain rule of calculus
related: derivative, partial-derivative, gradient, jacobian, backpropagation, directional-derivative
summary: The rule for differentiating composed functions: the derivative of a composition is the product of the derivatives of its parts, so influence multiplies along the chain. It is the mathematical foundation of backpropagation, and the same multiplication that makes it powerful is what makes deep networks fragile.
---

The chain rule tells you how to differentiate a function built by feeding one function into another. If an output depends on an intermediate quantity, which in turn depends on an input, then the rate of change of the output with respect to the input is the product of two rates: how the output changes with the intermediate, times how the intermediate changes with the input. Influence multiplies along the chain. For functions of many variables the same principle holds in matrix form, where the rates are Jacobians and the multiplication is matrix multiplication.

The chain rule matters because every deep neural network is a deep composition of functions, layer after layer, and training needs the derivative of the final loss with respect to parameters buried many layers back. The chain rule is what makes that derivative computable at all. It converts the intractable question "how does this early weight affect a loss many transformations later" into a sequence of local derivatives, each easy to compute, that are then multiplied together. Without it there would be no practical way to assign credit and blame to parameters deep inside a multilayer model.

Backpropagation is the chain rule applied with a specific, efficient ordering. Rather than recomputing shared sub-expressions, it does a single forward pass to record intermediate values, then a single backward pass that propagates the gradient from the output toward the inputs, multiplying by each layer's local Jacobian as it goes. This reverse accumulation is dramatically cheaper than working forward when there is one scalar loss and many parameters, which is the shape of deep learning, and it is the reason a network with billions of weights can be trained at all. Automatic differentiation in every framework is, at heart, a careful implementation of the chain rule over a computation graph.

The chain rule also explains why deep training is delicate, because its great strength and its great hazard are the same multiplication. Gradients are products of many factors, and a product of many factors can drift: shrink toward zero across depth, the vanishing gradient problem, or grow without bound, the exploding gradient problem. The multiplicative structure that lets the chain rule reach a parameter ten layers down is the same structure that lets the signal decay or blow up on the way, which is what motivates residual connections, normalization, and careful initialization. The chain rule is the bridge between the local derivatives of individual operations and the global gradient that gradient descent consumes.
