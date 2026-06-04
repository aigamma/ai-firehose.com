---
title: RMSprop
slug: rmsprop
kind: technique
category: Optimization
aliases: root mean square propagation
related: adam, gradient-descent, stochastic-gradient-descent, learning-rate, momentum, loss-landscape
summary: An adaptive optimizer that gives every parameter its own effective learning rate, dividing each update by a running root-mean-square of that parameter's recent gradients. It is best understood as one half of Adam, and as the fix for AdaGrad's fatal flaw of letting the step size decay to zero.
---

RMSprop, root mean square propagation, gives each parameter its own step size instead of forcing one global learning rate on all of them. For every parameter it keeps an exponentially decaying average of the square of that parameter's recent gradients, and the update divides the raw gradient by the square root of this average. A parameter whose gradients have lately been large therefore takes proportionally smaller steps, and one whose gradients have been small takes larger ones, so the effective step sizes stay balanced across the whole model without any manual per-parameter tuning.

This answers a real defect of plain gradient descent: the loss landscape of a neural network is steep in some directions and nearly flat in others, and no single learning rate suits them all, since a rate small enough to stay stable on the steep directions is far too small to make progress on the flat ones. It is the same ravine problem momentum attacks, approached from a different angle, normalizing each direction by its own recent gradient magnitude rather than averaging gradients over time. RMSprop also copes well with non-stationary objectives, which is why it was first proposed for online and recurrent-network training where the gradient statistics drift.

The decaying average is the crucial detail and the reason RMSprop exists. Its predecessor AdaGrad divided by the sum of all past squared gradients, an ever-growing denominator that drove the effective learning rate monotonically toward zero and eventually froze learning. RMSprop replaces that sum with an exponentially decaying average, governed by a decay rate commonly around 0.9, so the denominator tracks the current region of the landscape rather than the entire history and never collapses to zero. A small constant under the square root guards against division by zero.

RMSprop is best understood as one half of Adam. Adam takes RMSprop's per-parameter second-moment scaling and adds momentum's first-moment smoothing on top, plus a bias correction for the early steps. On its own RMSprop remains a strong, simple optimizer, still favored for recurrent networks and reinforcement learning where its behavior is well characterized, and understanding it is what makes Adam's update rule look obvious rather than arbitrary.
