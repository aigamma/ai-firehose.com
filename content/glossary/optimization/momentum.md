---
title: Momentum
slug: momentum
kind: technique
category: Optimization
aliases: heavy ball method, Nesterov momentum
related: gradient-descent, stochastic-gradient-descent, learning-rate, adam, rmsprop, loss-landscape
summary: An enhancement to gradient descent that accumulates an exponentially decaying average of past gradients into a velocity term, so updates build speed along consistent directions and damp out oscillation across narrow valleys.
---

Momentum is a modification of gradient descent that gives the optimizer inertia. Instead of stepping purely by the current gradient, it maintains a velocity vector that is an exponentially decaying running average of recent gradients, and it steps by that velocity. The physical analogy is a heavy ball rolling down the loss landscape: rather than reacting only to the slope directly under it, the ball carries momentum from where it has already been, so it accelerates down long consistent slopes and is not easily knocked off course by small bumps.

It matters because plain gradient descent behaves poorly in the common situation where the loss landscape forms a long, narrow ravine: steeply curved across the valley and gently sloped along it. There the raw gradient points mostly across the valley, so the optimizer zig-zags back and forth between the walls while creeping only slowly toward the minimum at the far end. Momentum fixes this almost exactly. The across-valley components of successive gradients point in opposite directions and cancel in the running average, while the along-valley components reinforce and accumulate. The result is damped oscillation and faster travel toward the actual minimum.

Mechanically there are two coupled equations. First the velocity is updated as a blend of its previous value, scaled by a momentum coefficient (commonly around 0.9), and the new gradient. Then the parameters are moved by this velocity, scaled by the learning rate. The momentum coefficient sets how much history is retained: higher values give more inertia and more smoothing but can overshoot. A widely used refinement, Nesterov momentum, evaluates the gradient at the point the velocity is about to carry the parameters to rather than at the current point, which gives a slightly more responsive correction.

Momentum is a core ingredient of the optimizers that dominate deep learning. Stochastic gradient descent with momentum is a strong, well-understood baseline, and its smoothing is especially valuable because it averages away some of the noise that mini-batch sampling injects. Adam combines this same first-moment momentum with the per-parameter scaling of RMSprop, which is why Adam can be read as momentum plus adaptive learning rates in a single rule.
