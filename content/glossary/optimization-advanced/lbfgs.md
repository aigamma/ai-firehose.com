---
title: L-BFGS
slug: lbfgs
kind: technique
category: Advanced Optimization
aliases: limited-memory BFGS, quasi-Newton method
related: newtons-method, conjugate-gradient, gradient-descent, trust-region, natural-gradient
summary: A quasi-Newton optimizer that approximates the inverse Hessian from just the last few gradient differences, capturing most of Newton's fast convergence at a memory cost only a few times that of gradient descent. Its Achilles heel is noise: it needs consistent gradients, which is exactly why deep learning, with its noisy mini-batches, trains with Adam instead.
---

L-BFGS is the practical answer to the question Newton's method poses but cannot afford: how to get curvature-aware steps without forming or inverting the Hessian. Quasi-Newton methods build an approximation to the inverse Hessian incrementally from the gradients they observe, on the principle that the change in the gradient between two points reveals how the surface curves between them. The full BFGS method keeps a dense approximation to that inverse, which is excellent but, like the true Hessian, costs memory quadratic in the parameter count and so does not scale to large models.

The "L" stands for limited memory, and it is the whole trick. Instead of storing the approximate matrix, L-BFGS keeps only the last few gradient and step differences, typically five to twenty pairs of vectors, and reconstructs the action of the inverse Hessian on the current gradient through a compact two-loop recursion, never materializing a matrix at all. That drops the memory from quadratic to linear in the parameter count, a small multiple of what gradient descent needs, while still capturing the dominant curvature directions seen recently, so each step is far better scaled than a raw gradient step, short across steep directions and long along flat ones automatically.

On smooth, deterministic problems this lets L-BFGS converge in dramatically fewer iterations than gradient descent, which is why it is often the default in classical machine learning, powering logistic regression and conditional random field training, maximum-likelihood fitting, and many full-batch scientific problems, frequently reaching a high-accuracy solution where a first-order method would still be grinding. It sits between conjugate gradient, which uses even less state, and full Newton, which uses far more.

The crucial caveat, and the reason it is not the optimizer of deep learning, is that L-BFGS assumes consistent, low-noise gradients, because its curvature estimate is corrupted by noise in the gradient differences. That makes it a poor fit for the small stochastic mini-batches of neural training, where the gradient changes meaning from batch to batch and the curvature estimate becomes garbage, which is much of why large networks are trained with stochastic first-order methods like Adam rather than quasi-Newton ones. On full-batch or lightly-noised objectives, though, L-BFGS remains the standard high-performance optimizer and the textbook embodiment of the quasi-Newton idea.
