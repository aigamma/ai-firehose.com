---
title: Edge of Stability
slug: edge-of-stability
kind: technique
category: Deep Learning Theory
aliases: edge of stability, progressive sharpening
related: loss-landscape, hessian, learning-rate, gradient-descent, flat-minima, sharpness-aware-minimization
summary: A regime observed in full-batch gradient descent where the sharpness of the loss surface rises until it sits just above the threshold for stability, after which the loss falls non-monotonically while training keeps making progress, defying classical optimization theory.
---

The edge of stability is a description of how full-batch gradient descent actually behaves when training a neural network, and it contradicts the textbook picture. Classical optimization theory says that gradient descent with a fixed learning rate converges smoothly only if the curvature of the loss, the largest eigenvalue of the hessian, often called the sharpness, stays below a threshold set by two divided by the learning rate. Above that threshold the method should diverge. Cohen and colleagues showed in 2021 that real training violates this in a consistent way: the sharpness instead climbs until it reaches that very threshold and then hovers just above it, while the loss, rather than diverging, keeps decreasing over the long run even as it bounces up and down from step to step.

Two coupled behaviors define the regime. The first is progressive sharpening: across most of training the curvature of the loss-landscape grows, so the optimization steadily walks into sharper territory rather than seeking flat regions on its own. The second is the stabilization once sharpness meets the two-over-learning-rate threshold, where the dynamics enter a self-correcting oscillation. The iterate overshoots along the sharpest direction, which would normally blow up, but the overshoot pushes it toward slightly lower curvature, which pulls the system back, so it skitters along the boundary of instability. The loss therefore falls non-monotonically, a pattern invisible to the smooth-descent assumption.

The edge of stability matters because it shows that the standard analysis of gradient descent, built on the assumption of small enough steps and smooth local descent, simply does not describe practical deep learning at the learning rates people actually use. Far from being a pathology to avoid, operating near the stability boundary is the normal operating point, and it is implicated in why training is biased toward certain solutions. The oscillation along the sharpest direction acts as a force that resists curvature, an implicit pressure that connects the phenomenon to the long-standing observation that good solutions tend to sit in flat-minima.

The finding reframes several practical levers. It explains why the learning-rate has an effect on the final sharpness of the solution, since a larger step lowers the stability threshold and so caps the curvature the optimizer will tolerate, nudging training toward flatter regions. It also gives theoretical company to methods that target curvature directly, such as sharpness-aware-minimization, which explicitly penalizes sharp minima rather than reaching flatness as a side effect. The edge of stability is now a standard reference point for anyone trying to understand the true dynamics of gradient descent rather than its idealized approximation.
