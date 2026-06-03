---
title: Neural Tangent Kernel
slug: neural-tangent-kernel
kind: technique
category: Deep Learning Theory
aliases: NTK, tangent kernel
related: kernel-method, gradient-descent, loss-landscape, universal-approximation-theorem, generalization, hessian
summary: A kernel that describes how an infinitely wide neural network evolves under gradient descent, showing that in this limit training reduces to a linear model in a fixed feature space.
---

The neural tangent kernel is a theoretical object that captures the training dynamics of a neural network in terms of how its outputs change when its parameters change. For two inputs, the kernel is the dot product of the gradients of the network's output with respect to all of its parameters, evaluated at each input. Introduced by Jacot, Gabriel, and Hongler in 2018, it gave the field one of its first exact descriptions of what a deep network does while it learns.

The central result is a limit theorem. As a network's layers are made infinitely wide, the neural tangent kernel stops moving during training: it converges to a fixed value at initialization and stays there. When the kernel is frozen, gradient descent on the network behaves exactly like gradient descent on a linear model whose features are the network's gradients. Training then has a closed-form solution, and the network's predictions are governed by ordinary kernel regression with that fixed kernel. A famously nonlinear, nonconvex system collapses, in the wide limit, into the well-understood territory of a kernel method.

This matters because it turned deep learning from a purely empirical practice into something with a tractable analytic model. Under the neural tangent kernel, questions that are hopeless for finite networks become answerable: one can write down the training loss at every step, predict which functions the network learns first, and prove convergence to zero training error. It explains why hugely overparameterized networks, which by classical accounts should overfit, can train reliably and still generalize, connecting to phenomena like the smoothness of the loss landscape near a good solution.

The neural tangent kernel is also a foil that reveals what makes real networks special. The regime it describes is sometimes called the lazy regime, because the parameters barely move from their starting point and the network never learns new features; it only reweights the random features fixed at initialization. Practical deep learning lives in the opposite, feature-learning regime, where the kernel does evolve and representations genuinely change. Comparing the two is now a standard way to ask what finite width and feature learning buy you, and it links the neural tangent kernel to broader questions about implicit-regularization, the role of the hessian in shaping curvature, and why depth and nonlinearity matter beyond what any fixed kernel can express.
