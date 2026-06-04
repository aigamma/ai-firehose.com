---
title: Spectral Bias
slug: spectral-bias
kind: technique
category: Deep Learning Theory
aliases: frequency principle, F-Principle, spectral bias of neural networks
related: neural-tangent-kernel, fourier-transform, implicit-regularization, generalization, inductive-bias, gradient-descent
summary: The empirical tendency of neural networks trained by gradient descent to learn low-frequency, smooth components of a target function first and high-frequency detail much later, a learning-order bias that helps explain why overparameterized networks generalize.
---

Spectral bias is the observation that a neural network does not learn all parts of a function at the same rate. Trained by gradient descent, it fits the smooth, slowly varying, low-frequency structure of its target early in training, and only later, often much later, fills in the rapid, high-frequency wiggles. Decompose the function the network represents into its frequency content, with the fourier-transform, and watch the error fall: the low frequencies converge first, the high frequencies last. This learning-order phenomenon was characterized around 2019 by Rahaman and colleagues, who named it spectral bias, and independently by Xu and colleagues, who called it the frequency principle.

The effect matters because it is a concrete, measurable form of the implicit-regularization that makes deep learning work better than classical theory predicts. A network with far more parameters than training points could in principle fit the data with a wild, high-frequency function that memorizes noise, yet in practice gradient descent prefers a smooth interpolant. Spectral bias is part of why: by reaching for low frequencies first, training lands on simple functions and, if stopped before it overfits the high-frequency noise, generalizes well. It gives the vague intuition that networks prefer simple functions a precise spectral meaning, and connects to broader questions about the inductive-bias of gradient-trained models.

There is a clean theoretical account in the wide-network limit. Under the neural-tangent-kernel, training is governed by the eigenvalues of a fixed kernel, and the components of the target aligned with large eigenvalues are learned fast while those aligned with small eigenvalues are learned slowly. For standard networks the large-eigenvalue directions correspond to low spatial frequencies, so the kernel's spectrum directly predicts the low-to-high learning order. This made spectral bias one of the cleaner bridges between an observed training behavior and an exact analytic model of generalization.

Spectral bias also has a sharp practical edge, because sometimes high frequencies are exactly what you need. Tasks that represent fine detail as a function of coordinates, such as fitting a sharp image or a 3D scene from positions, suffer when the network refuses to learn high frequencies. The standard fix is to lift the inputs into a higher-frequency basis before the network sees them, with Fourier features or positional encodings, which reshapes the kernel so that high-frequency detail falls into fast-learning directions. This insight underpins coordinate-based models in graphics and is a direct, useful consequence of taking spectral bias seriously.
