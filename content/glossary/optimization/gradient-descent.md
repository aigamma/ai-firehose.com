---
title: Gradient Descent
slug: gradient-descent
kind: technique
category: Optimization
aliases: GD, steepest descent
related: stochastic-gradient-descent, learning-rate, loss-landscape, backpropagation, momentum, adam
summary: An optimization algorithm that iteratively steps a model's parameters in the direction of steepest descent of a loss function, so the loss falls toward a minimum.
---

Gradient descent is the workhorse of machine learning optimization. It treats training as a search over a high-dimensional surface, the loss landscape, whose height at any point is the model's error on the data. The algorithm starts somewhere on that surface and repeatedly walks downhill until it can descend no further.

Each iteration computes the gradient of the loss with respect to every parameter, the vector of partial derivatives that points in the direction of steepest increase. Gradient descent moves the parameters a small amount in the opposite direction, against the gradient, scaled by a step size called the learning rate. Choose the learning rate too large and the steps overshoot and diverge; too small and training crawls.

The gradient itself is supplied by backpropagation, which applies the chain rule to push error signals backward through the layers of a network. This pairing, backpropagation to get the gradient and gradient descent to use it, is the engine under almost every deep learning model.

Plain "batch" gradient descent uses the whole dataset for each step, which is accurate but slow. In practice almost everyone uses stochastic gradient descent or mini-batches, trading exact gradients for far more frequent updates. Pure gradient descent is also prone to crawling through flat regions and stalling near a saddle point, which motivates accelerated variants like momentum and adaptive methods like Adam.
