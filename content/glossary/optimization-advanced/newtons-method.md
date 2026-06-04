---
title: Newton's Method
slug: newtons-method
kind: technique
category: Advanced Optimization
aliases: Newton-Raphson, second-order optimization
related: gradient-descent, conjugate-gradient, lbfgs, trust-region, natural-gradient, loss-landscape
summary: A second-order method that uses both the slope and the curvature of a function to jump toward the minimum, landing on the exact optimum of a quadratic in a single step. It is too expensive to run directly on a large network, which is precisely why it is the conceptual root of a whole family of cheaper successors.
---

Newton's method uses curvature to jump, where gradient descent only feels the slope and shuffles. Gradient descent looks at the slope of the loss and takes a fixed-size step downhill; Newton's method also looks at how the slope is changing, the curvature, and uses it to estimate where the bottom actually is, building a local quadratic model of the surface and jumping straight to that quadratic's minimum in one move. On a function that is itself quadratic, it lands on the exact optimum in a single step.

The curvature is captured by the Hessian, the matrix of all second partial derivatives of the loss, and each Newton step solves a linear system, multiplying the gradient by the inverse Hessian and stepping in that direction. Intuitively the inverse Hessian rescales and rotates the raw gradient so directions of high curvature get short steps and directions of low curvature get long ones, curing the main pathology of gradient descent, which crawls along flat valleys and oscillates across steep ones because it treats every direction with the same learning rate.

That curvature-awareness buys a dramatic convergence rate. Near a minimum where the surface is smooth and convex, Newton converges quadratically, the number of correct digits roughly doubling each iteration, where gradient descent converges only linearly. When it applies, it finishes in a handful of steps rather than thousands.

The catch, and the reason it is rarely used directly in deep learning, is cost. For a model with a million parameters the Hessian has a trillion entries, far too large to form, store, or invert. It can also be unstable far from a minimum, where the local quadratic model fits badly and the Hessian may not even be positive definite, sending the step uphill. Both failures are exactly what its neighbors exist to fix.

Those limitations spawned a whole family of successors, which is why Newton's method matters more as an ancestor than as an algorithm. Quasi-Newton methods like L-BFGS approximate the inverse Hessian cheaply from a history of gradients; conjugate gradient gets Newton-like behavior on quadratics using only gradients and no matrix; trust region methods restrict each step to a region where the quadratic model is trustworthy, taming the instability; and the natural gradient transplants Newton's idea onto a different curvature object, the Fisher information, for probability models. Newton's method is less a production algorithm than the conceptual root of all second-order optimization.
