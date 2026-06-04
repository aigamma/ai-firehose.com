---
title: Hessian
slug: hessian
kind: technique
category: Calculus and Analysis
aliases: hessian matrix, hessians
related: gradient, jacobian, partial-derivative, convexity, taylor-expansion, derivative
summary: The matrix of all second-order partial derivatives of a scalar function, describing its local curvature, the shape of the valley the gradient is descending. The gradient says which way is downhill; the Hessian says whether the valley is a tight bowl or a long shallow trough, which is what second-order optimizers exploit and what the condition number warns about.
---

The Hessian is the curvature the gradient cannot see. It is the matrix of second-order partial derivatives of a scalar function, each entry a derivative taken twice, once with respect to one input and once with respect to another, so the matrix is square with one row and column per input, and symmetric, because mixed partials are equal for smooth functions. It is, precisely, the derivative of the gradient, the Jacobian of the gradient field, and it records how the slope of the function changes as you move in each direction.

It matters because the gradient tells you which way is downhill but says nothing about the shape of the descent, and that shape controls everything about how optimization behaves. The gradient cannot tell a tight, narrow bowl from a long shallow trough; the Hessian can. In a second-order Taylor expansion of a loss, the Hessian is the term that captures the bending, which is why second-order methods like Newton's method use it to rescale and reorient each step, taking long strides along gently curved directions and cautious ones along sharply curved directions.

The eigenvalues of the Hessian give a precise local picture and connect directly to convexity. At a critical point where the gradient is zero, all-positive eigenvalues mean a local minimum, all-negative a local maximum, and a mix of signs a saddle point. A function whose Hessian is positive semidefinite everywhere is convex, which is why the Hessian is the standard test for convexity. The spread of its eigenvalues, the condition number, predicts how slowly plain gradient descent will crawl, because a poorly conditioned Hessian carves a narrow ravine that makes the optimizer zig-zag across the valley while inching down it.

In large-scale machine learning the full Hessian is usually too big to form or store, since its size grows with the square of the parameter count, which for a billion-parameter model is a billion-by-billion matrix. Practical methods therefore work with it implicitly: quasi-Newton methods build a running low-rank approximation from gradient history, and Hessian-vector products supply curvature along one chosen direction without ever materializing the matrix. Even when it is never computed directly, the Hessian remains the conceptual key to why training is fast in some directions and painfully slow in others.
