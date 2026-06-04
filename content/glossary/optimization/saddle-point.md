---
title: Saddle Point
slug: saddle-point
kind: technique
category: Optimization
aliases: saddle points
related: loss-landscape, local-minimum, gradient-descent, stochastic-gradient-descent, momentum, loss-function
summary: A point where the gradient vanishes but which is neither peak nor valley, curving up in some directions and down in others, like a horse saddle. A simple counting argument explains why such points, not bad local minima, dominate the critical points of a high-dimensional network and are the real thing that stalls training.
---

A saddle point is a critical point of the loss landscape where the gradient is zero yet the point is no minimum. Its signature is mixed curvature: along some directions the surface curves up like the floor of a valley, along others it curves down like the crest of a ridge. The namesake is a horse saddle, which dips front to back where you sit but rises left to right toward the stirrups. At the exact saddle there is no slope at all, so a method that moves by following the gradient finds nothing pushing it anywhere.

Saddle points are the characteristic way gradient-based optimization stalls, as opposed to getting permanently stuck. Plain gradient descent steps in proportion to the gradient, so as it nears a saddle the steps shrink toward zero and progress crawls, even though escape is always possible by moving along one of the downward directions. The optimizer can linger a long time on the surrounding near-flat plateau before finally drifting off, and that slow creep, not a permanent trap, is the real cost.

Why saddles dominate deep learning comes down to a counting argument about high dimensions, and it is worth following because it reversed the field's intuition. At any critical point, whether it is a minimum, a maximum, or a saddle depends on the signs of the curvature across all the directions. For a true local minimum every one of the millions of directions must curve upward, which is exceedingly unlikely by chance; almost always at least one direction curves down, making the point a saddle. So the overwhelming majority of critical points in a large network's landscape are saddle points, and they, not the bad local minima of classical theory, are the dominant obstacle.

The fix is built into the optimizers practitioners already use, which is why the problem is rarely fatal in practice. Momentum carries accumulated velocity through the flat region so the optimizer coasts off the saddle instead of stalling. The sampling noise in stochastic gradient descent perturbs the parameters off the exact saddle and onto a downhill direction. Adaptive methods like Adam and RMSprop, by rescaling each direction by its recent gradient magnitude, take larger relative steps along the shallow escape directions. Together these are much of why modern training slides past the saddle points that would freeze a naive descent.
