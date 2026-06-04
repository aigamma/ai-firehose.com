---
title: Convexity
slug: convexity
kind: technique
category: Calculus and Analysis
aliases: convex, convex function, convex optimization
related: hessian, gradient, derivative, taylor-expansion, gradient-descent, loss-landscape
summary: A property of a function whose graph curves upward everywhere, so that any local minimum is automatically the global one. That single fact makes optimization trustworthy and gives classical machine learning its clean guarantees, and the absence of it is exactly what makes training a neural network hard.
---

Convexity is the property that makes optimization trustworthy. A function is convex when the straight line joining any two points on its graph lies on or above the graph, which is a precise way of saying the surface curves upward everywhere and never dips back down after rising. For a smooth function this is captured by the second derivative being nonnegative, or in many dimensions by the Hessian being positive semidefinite at every point. A convex set, the companion idea, is a region that contains the entire segment between any two of its points.

The payoff, the reason convexity is prized, is one clean guarantee: a convex function has no spurious local minima. Any point where the gradient vanishes is automatically the global minimum, so any descent procedure that stops moving has genuinely found the best answer, not a mediocre basin it got stuck in. This is why classical models with convex objectives, linear regression, logistic regression, the support vector machine, can be solved to provable global optimality, and why an entire mature field of convex optimization with strong guarantees exists around them. With convexity, "the optimizer converged" and "the optimizer found the answer" are the same statement.

The link to curvature is direct and practical. Strong convexity, a lower bound on how much the function curves, guarantees a fast and predictable convergence rate for gradient descent, while the conditioning of the Hessian, the ratio of its largest to smallest eigenvalue, sets how quickly that convergence actually happens. A second-order Taylor expansion makes it concrete: near a minimum a convex function looks like an upward bowl whose shape is the Hessian, and the rounder the bowl the easier the descent.

Deep learning lives almost entirely outside this comfortable world, which is exactly why it is hard. The loss landscape of a neural network is wildly non-convex, riddled with saddle points and countless minima, so none of convexity's guarantees apply, and "the optimizer stopped" no longer means "the optimizer won." The value of convexity here is as a lens and a benchmark rather than a literal description: methods are often analyzed on convex surrogates, intuitions about bowls and conditioning carry over locally, and understanding convexity is the baseline against which the genuine difficulty of non-convex training is measured.
