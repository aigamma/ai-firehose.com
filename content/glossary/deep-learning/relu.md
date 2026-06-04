---
title: Rectified Linear Unit
slug: relu
kind: technique
category: Deep Learning Architectures
aliases: ReLU, rectified linear unit, rectifier
related: activation-function, vanishing-gradient, convolutional-neural-network, multilayer-perceptron, batch-normalization, backpropagation
summary: An activation that passes positive inputs through unchanged and zeroes out negatives, the simplest useful nonlinearity in deep learning. Its derivative is exactly one for positive inputs, so gradients pass backward undiminished, which is the unglamorous fact that helped make very deep networks suddenly trainable around 2010.
---

The rectified linear unit, or ReLU, returns its input when the input is positive and returns zero otherwise, the maximum of zero and the input. It is the simplest useful nonlinearity in deep learning, yet its adoption around 2010 to 2012 was a turning point that helped make modern deep networks practical, and it is now the default activation in the convolutional neural network and a common choice throughout the multilayer perceptron. A function this plain reshaping the field is one of the small surprises of the era.

ReLU matters chiefly because it mitigates the vanishing gradient problem that plagued the saturating activation functions before it. For any positive input its derivative is exactly one, so gradients pass backward through it undiminished, unlike the sigmoid and tanh whose derivatives shrink toward zero in saturation. That constant unit gradient on the positive side lets error signals reach the early layers of a deep stack, which is a large part of why networks suddenly became deeper and trained faster once ReLU was widely adopted.

Beyond gradient flow, ReLU is cheap and induces useful sparsity. Computing a maximum with zero is far faster than the exponentials a sigmoid requires, which speeds both training and inference, and because it outputs exactly zero for all negative inputs, roughly half of a layer's units are typically inactive for any given input, yielding sparse activations that are efficient and can aid generalization. It composes naturally with batch normalization, commonly placed just before it in a convolutional block.

ReLU has a well-known failure mode, the dying ReLU: a unit whose input stays negative across the data outputs zero permanently, receives zero gradient, and never recovers, effectively dropping out of the network. This motivated variants like Leaky ReLU and Parametric ReLU, which allow a small nonzero slope for negative inputs, and smoother relatives like GELU and SiLU favored in transformers. Even so, plain ReLU remains the standard baseline activation, the function most networks reach for first.
