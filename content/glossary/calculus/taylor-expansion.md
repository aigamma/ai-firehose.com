---
title: Taylor Expansion
slug: taylor-expansion
kind: technique
category: Calculus and Analysis
aliases: taylor series, taylor approximation, taylor polynomial
related: derivative, gradient, hessian, convexity, directional-derivative, integral
summary: An approximation of a function near a point as a polynomial built from its derivatives there, each term adding finer detail, slope, then curvature, then beyond. It is the universal move of optimization and analysis: replace a complicated function with a simple local model, which is exactly what justifies gradient descent and Newton's method.
---

A Taylor expansion replaces a complicated function, near a chosen point, with a polynomial assembled from the function's derivatives at that point. The constant term is the function's value, the next term uses the first derivative to add the slope, the following term uses the second derivative to add curvature, and each further term uses a higher derivative to sharpen the fit. Truncate after a few terms and you have a simple local model that is exact at the point and increasingly accurate the closer you stay to it. In several variables the first-order term is built from the gradient and the second-order term from the Hessian.

The Taylor expansion matters because optimization and analysis almost always proceed by the same move: replace the real, complicated function with a simple local model and reason about the model instead. A first-order Taylor expansion, the linear approximation, is the justification for gradient descent: near the current point the loss looks like a tilted plane defined by the gradient, so stepping against the gradient is guaranteed to lower it for a small enough step. A second-order expansion, the quadratic approximation, underlies Newton's method and the analysis of convergence, because it captures the bowl-shaped curvature that sets the right step size.

The connection to curvature and convexity runs through that second-order term. The quadratic Taylor model of a loss is an upward bowl exactly when the Hessian is positive semidefinite, which is the local statement of convexity, and the shape of that bowl predicts how a descent method will behave. Examining the second-order expansion at a critical point is how its nature, minimum, maximum, or saddle, is classified, and it is the cleanest way to see why poorly conditioned curvature makes training crawl.

Beyond optimization, Taylor expansions are a general workhorse for understanding and computing functions. They explain how a nonlinear activation function behaves for small inputs, they support error analysis by bounding the size of the neglected higher-order terms, and they let an intractable expression be swapped for a polynomial that is easy to differentiate or integrate. The same derivatives the Taylor expansion stacks up, value, slope, curvature, and beyond, are the objects every other entry in this category studies, which makes the expansion the unifying picture of how a function's local behavior fits together.
