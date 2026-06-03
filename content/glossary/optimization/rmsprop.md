---
title: RMSprop
slug: rmsprop
kind: technique
category: Optimization
aliases: root mean square propagation
related: adam, gradient-descent, stochastic-gradient-descent, learning-rate, momentum, loss-landscape
summary: An adaptive optimizer that divides each parameter's update by a running root-mean-square of its recent gradient magnitudes, giving every parameter its own effective learning rate and taming the unstable steps of plain gradient descent.
---

RMSprop, root mean square propagation, is an adaptive learning-rate optimizer that gives each parameter an individually scaled step. It maintains, for every parameter, an exponentially decaying running average of the square of that parameter's gradients. The update divides the raw gradient by the square root of this average, so a parameter whose gradients have recently been large takes proportionally smaller steps and a parameter whose gradients have been small takes larger ones. In effect the global learning rate is automatically rescaled per parameter to keep the effective step sizes balanced.

It matters because the loss landscape of a neural network has wildly different steepness in different directions, and a single shared learning rate cannot suit them all. A step size small enough to be stable in the steep directions is far too small to make progress in the flat ones, which is the same ravine problem that motivates momentum, approached from a different angle. By normalizing each direction by its own recent gradient magnitude, RMSprop lets the optimizer take confident steps everywhere at once. It also handles non-stationary objectives well, which is why it was originally proposed for online and recurrent-network training where the gradient statistics shift over time.

The running average is the key mechanism. A decay rate, commonly around 0.9, controls how quickly old squared-gradient information is forgotten, and a small epsilon constant is added under the square root to avoid division by zero. Because it uses a decaying average rather than an ever-growing sum, RMSprop does not let the effective learning rate shrink monotonically toward zero, which was the flaw in the earlier AdaGrad method it was designed to repair. The accumulated denominator stays responsive to the current region of the landscape rather than to the entire history of training.

RMSprop is best understood as one half of Adam. Adam takes RMSprop's per-parameter second-moment scaling and adds momentum's first-moment smoothing on top, plus bias correction. RMSprop on its own remains a strong, simple optimizer and is still used, particularly for recurrent networks and reinforcement learning, where its behavior is well characterized. Understanding it makes Adam's update rule transparent rather than mysterious.
