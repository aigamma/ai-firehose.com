---
title: Adam
slug: adam
kind: technique
category: Optimization
aliases: adaptive moment estimation, AdamW
related: gradient-descent, stochastic-gradient-descent, momentum, rmsprop, learning-rate, weight-decay
summary: An adaptive optimization algorithm that combines momentum with per-parameter learning rates, maintaining running estimates of both the mean and the variance of each parameter's gradients. It is the default optimizer for most deep learning.
---

Adam, short for adaptive moment estimation, is the optimizer most deep learning models are trained with by default. It merges the two main improvements over plain gradient descent into one update rule. From momentum it borrows a running average of the gradient itself, the first moment, which smooths the trajectory and carries inertia along consistent directions. From RMSprop it borrows a running average of the squared gradient, the second moment, which it uses to give every parameter its own effective learning rate.

The combination is what makes Adam robust. Each parameter's step is the first moment (the momentum-smoothed direction) divided by the square root of the second moment (a per-parameter estimate of how large that parameter's gradients have recently been). Parameters whose gradients are consistently large get their steps shrunk, and parameters whose gradients are small or sparse get their steps enlarged, so all parameters make comparable progress regardless of differences in scale or curvature across the loss landscape. This per-parameter adaptivity is why Adam often works reasonably well out of the box with little learning-rate tuning, which is a large part of its popularity.

Two details make the algorithm work in practice. Both running averages are initialized at zero, so early in training they are biased toward zero; Adam applies a bias-correction factor to both moments that undoes this and is strongest in the first steps. The division also includes a small constant, usually written epsilon, in the denominator to prevent dividing by zero when a parameter's gradients have been near zero. The two decay rates that control the moment averages are conventionally 0.9 for the first moment and 0.999 for the second, and these defaults rarely need changing.

A widely used variant, AdamW, fixes how Adam handles weight decay. In the original formulation, coupling an L2 penalty into the gradient interacts badly with the per-parameter rescaling, so the regularization is applied unevenly. AdamW decouples weight decay from the adaptive step, shrinking the weights directly, and this generalizes better, which is why AdamW is now the standard choice for training large models. Adam is not always superior to well-tuned stochastic gradient descent with momentum, which sometimes reaches flatter, better-generalizing minima, but Adam's reliability with minimal tuning makes it the common starting point.
