---
title: Proximal Gradient
slug: proximal-gradient
kind: technique
category: Advanced Optimization
aliases: proximal gradient method, ISTA, forward-backward splitting
related: gradient-descent, mirror-descent, trust-region, loss-landscape
summary: An optimizer for objectives that split into a smooth part and a simple nonsmooth part, taking a gradient step on the smooth term and a proximal step that handles the nonsmooth term exactly. It is how L1 regularization actually produces exact zeros, because the L1 proximal operator is soft-thresholding, which snaps small coordinates to zero.
---

Proximal gradient methods extend gradient descent to objectives that are not differentiable everywhere, which arise constantly in machine learning the moment a regularizer is added to a loss. The classic example is L1 regularization, the penalty behind sparse models, whose absolute-value term has a kink at zero where no gradient exists. Plain gradient descent cannot step cleanly through that kink, and naive subgradient methods do so only slowly and never produce exact zeros. Proximal gradient handles such objectives by splitting them into a smooth piece and a nonsmooth piece and treating each with the right tool.

The smooth piece, typically the data-fitting loss, gets an ordinary gradient step. The nonsmooth piece is handled by its proximal operator, which asks: starting from the point the gradient step proposed, find the nearby point that best balances staying close against reducing the nonsmooth penalty. For many useful regularizers this operator has a closed form, and the L1 case is the one to remember: its proximal operator is soft-thresholding, which shrinks every coordinate toward zero and snaps the small ones exactly to zero, which is precisely how proximal methods deliver the genuine sparsity that L1 promises but plain descent never quite achieves. The full step is "take a gradient step, then apply the prox," a pattern also called forward-backward splitting.

The value is that it cleanly separates the easy and hard parts of an objective while keeping the convergence guarantees of smooth optimization for the combined problem. It is the engine behind widely used solvers like ISTA and its accelerated cousin FISTA for sparse regression and compressed sensing, and projected gradient descent for constrained problems is just the special case where the nonsmooth term is the indicator of a constraint set and its proximal operator is Euclidean projection onto that set.

Conceptually, proximal gradient belongs to the same family of "linearize the smooth part, then solve a small structured subproblem" methods as mirror descent and trust region optimization. It descends only along the smooth term's gradient, like an ordinary first-order method, but the exact proximal correction lets it cope with the nonsmoothness and hard constraints that defeat a pure gradient step. That makes it the standard approach to the regularized, constrained objectives that dominate sparse and structured learning.
