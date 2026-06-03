---
title: Taylor Expansion
slug: taylor-expansion
kind: technique
category: Calculus and Analysis
aliases: taylor series, taylor approximation, taylor polynomial
related: derivative, gradient, hessian, convexity, directional-derivative, integral
summary: An approximation of a function near a point as a polynomial built from the function's derivatives there, with each added term capturing finer local detail such as slope, then curvature, then beyond.
---

A Taylor expansion approximates a function near a chosen point by a polynomial assembled from the function's derivatives at that point. The constant term is the function's value, the next term uses the first derivative to add the slope, the following term uses the second derivative to add curvature, and each successive term uses a higher derivative to correct the approximation a little more. Truncating after a few terms gives a local model of the function that is exact at the point and increasingly accurate the closer you stay to it. In several variables the first-order term is built from the gradient and the second-order term from the hessian.

The Taylor expansion matters because optimization and analysis almost always proceed by replacing a complicated function with a simple local model and then reasoning about the model. A first-order Taylor expansion, the linear approximation, is the justification for gradient descent: near the current point the loss looks like a tilted plane defined by the gradient, so stepping against the gradient is guaranteed to decrease it for a small enough step. A second-order expansion, the quadratic approximation, underlies Newton's method and the analysis of convergence, since it captures the bowl-shaped curvature that determines step sizes.

The connection to curvature and convexity runs through the second-order term. The quadratic Taylor model of a loss is an upward bowl exactly when the hessian is positive semidefinite, which is the local statement of convexity, and the shape of that bowl predicts how a descent method will behave. Examining the second-order expansion at a critical point is how the nature of that point, minimum, maximum, or saddle, is classified, and it is the cleanest way to see why poorly conditioned curvature slows training.

Beyond optimization, Taylor expansions are a general workhorse for understanding and computing functions. They explain how nonlinear activation functions behave for small inputs, support error analysis by bounding the size of the neglected higher-order terms, and let intractable expressions be replaced by polynomials that are easy to differentiate or integrate. The same derivatives that the Taylor expansion stacks up are the objects every other entry in this category studies, which makes the expansion a unifying way to see how a function's value, its derivative, and its higher-order behavior fit together near a point.
