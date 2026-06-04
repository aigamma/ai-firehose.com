---
title: Exploding Gradient
slug: exploding-gradient
kind: technique
category: Deep Learning Architectures
aliases: exploding gradients, exploding gradient problem
related: vanishing-gradient, gradient-clipping, backpropagation, recurrent-neural-network, residual-connection
summary: The failure where gradients grow exponentially as they backpropagate through many layers or time steps, so a single update hurls the weights past anything useful and the loss spikes to infinity or NaN. It is the mirror image of the vanishing gradient, the same multiplicative dynamics running the other way, and gradient clipping is the direct fix.
---

The exploding-gradient problem is what happens when the signal that trains a network grows out of control. Backpropagation computes gradients by multiplying terms layer by layer, or in a recurrent network time step by time step, and if those terms are consistently larger than one, the product grows exponentially with depth. The result is gradients so large that a single update throws the weights far past anything useful, producing wild oscillations, a loss that spikes to infinity, or NaNs that contaminate the rest of training.

It is most notorious in recurrent neural networks unrolled over long sequences, where the same weights are applied many times and small instabilities compound, but it appears in any sufficiently deep network. Its symptoms are unmistakable, which is one mercy of it: training that was proceeding smoothly suddenly diverges, and a glance at the gradient norms shows them shooting up.

The direct remedy is gradient clipping, which caps the gradient's magnitude so no single step can blow up, and it is standard wherever the problem is expected, especially in recurrent and very large models. The structural defenses are the same ones that help deep training generally: careful weight initialization to keep the multiplicative factors near one, normalization layers, residual connections that give gradients a clean path backward, and gated architectures like the LSTM that were designed partly to tame it.

It is the mirror image of the vanishing gradient, where the per-layer factors are smaller than one and the gradient shrinks to nothing instead. Both are about the same multiplicative dynamics of backpropagation through depth, just in opposite directions, and much of the architecture of modern deep learning, initialization, normalization, residual paths, gating, exists to keep that product near one, the knife-edge between vanishing and exploding.
