---
title: Hessian
slug: hessian
kind: technique
category: Calculus and Analysis
aliases: hessian matrix, hessians
related: gradient, jacobian, partial-derivative, convexity, taylor-expansion, derivative
summary: The square matrix of all second-order partial derivatives of a scalar function, describing the local curvature of the function and how its gradient changes from point to point.
---

The hessian is the matrix of second-order partial derivatives of a scalar function of several variables. Each entry is a partial derivative taken twice, once with respect to one input and once with respect to another, so the matrix is square with one row and one column per input. Because mixed partial derivatives are equal for smooth functions, the hessian is symmetric. It can be understood as the derivative of the gradient, the jacobian of the gradient field, and it records how the slope of the function changes as you move in each direction.

The hessian matters because it encodes curvature, the second-order shape of a function that the gradient alone cannot see. The gradient tells you which way is downhill but not whether the valley is a tight bowl or a long shallow trough, and that distinction controls how optimization behaves. In a quadratic (second-order) Taylor expansion of a loss, the hessian is the term that captures bending, so second-order optimization methods like Newton's method use it to rescale and reorient each step, taking large strides along gently curved directions and cautious ones along sharply curved directions.

The eigenvalues of the hessian give a precise local picture of the landscape and connect directly to convexity. At a critical point where the gradient is zero, all-positive eigenvalues mean a local minimum, all-negative eigenvalues mean a local maximum, and a mix of signs means a saddle point. A function whose hessian is positive semidefinite everywhere is convex, which is why the hessian is the standard test for convexity. The spread of its eigenvalues, the condition number, predicts how slowly plain gradient descent will converge, since a poorly conditioned hessian produces narrow ravines that zig-zag the path.

In large-scale machine learning the full hessian is usually too big to form or store, since its size grows with the square of the parameter count. Practical methods therefore work with the hessian implicitly: quasi-Newton methods build a running approximation from gradient history, and hessian-vector products supply curvature in a single chosen direction without ever materializing the matrix. Even unused directly, the hessian remains the conceptual key to understanding why training is fast in some directions and painfully slow in others.
