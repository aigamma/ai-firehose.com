---
title: Neural Tangent Kernel
slug: neural-tangent-kernel
kind: technique
category: Deep Learning Theory
aliases: NTK, tangent kernel
related: kernel-method, gradient-descent, loss-landscape, universal-approximation-theorem, generalization, hessian
summary: A kernel describing how an infinitely wide network evolves under gradient descent. The startling result is that in the infinite-width limit the kernel freezes, so a famously nonlinear, nonconvex network trains exactly like a linear model in a fixed feature space, which makes it both a rare analytic handle on deep learning and a foil that reveals what real, finite networks gain from learning their features.
---

The neural tangent kernel captures a network's training dynamics through how its outputs change when its parameters change. For two inputs, the kernel is the dot product of the gradients of the network's output with respect to all its parameters, evaluated at each input. Introduced by Jacot, Gabriel, and Hongler in 2018, it handed the field one of its first exact descriptions of what a deep network does while it learns, which for a system this nonlinear was a genuine breakthrough.

The central result is a limit theorem with a startling conclusion. As a network's layers are made infinitely wide, the neural tangent kernel stops moving during training: it converges to a fixed value at initialization and stays there. Once the kernel is frozen, gradient descent on the network behaves exactly like gradient descent on a linear model whose features are the network's gradients, so training has a closed-form solution and the predictions are governed by ordinary kernel regression with that fixed kernel. A famously nonlinear, nonconvex system collapses, in the wide limit, into the well-understood territory of a kernel method.

This turned deep learning from a purely empirical practice into something with a tractable analytic model. Under the neural tangent kernel, questions hopeless for finite networks become answerable: you can write the training loss at every step, predict which functions the network learns first, and prove convergence to zero training error. It helps explain why hugely overparameterized networks, which by classical accounts should overfit, can train reliably and still generalize, connecting to the smoothness of the loss landscape near a good solution.

The neural tangent kernel is also a foil that reveals what makes real networks special, and that is its lasting value. Its regime is the lazy regime: the parameters barely move from their starting point and the network never learns new features, only reweighting the random features fixed at initialization. Practical deep learning lives in the opposite, feature-learning regime, where the kernel does evolve and representations genuinely change. Comparing the two has become a standard way to ask what finite width and feature learning buy you, linking the neural tangent kernel to implicit regularization, the curvature captured by the Hessian, and why depth and nonlinearity matter beyond what any fixed kernel can express.
