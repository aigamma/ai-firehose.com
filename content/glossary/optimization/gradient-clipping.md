---
title: Gradient Clipping
slug: gradient-clipping
kind: technique
category: Optimization
aliases: gradient clipping, clip-by-norm
related: exploding-gradient, backpropagation, gradient-descent, recurrent-neural-network
summary: A stabilization technique that caps the magnitude of gradients before an update, preventing an occasional huge gradient from blowing up the weights; it is especially important in recurrent networks and large-model training.
---

Gradient clipping is a simple guardrail against one bad step ruining training. Backpropagation occasionally produces a gradient that is enormous, far larger than usual, and applying it would send the weights flying, destroying learned structure or producing NaNs that poison the rest of training. Clipping bounds the size of the update so a single outsized gradient cannot do that damage.

The common form is clip-by-norm: if the overall norm of the gradient exceeds a threshold, the whole gradient is rescaled down to that norm, which limits the step's magnitude while preserving its direction. A blunter variant, clip-by-value, caps each component individually. Either way the cost is negligible and the protection is real.

It matters most where exploding gradients are common: recurrent networks unrolled over long sequences, and the training of very deep or very large models, where it is a standard ingredient of the recipe. Clipping treats the symptom; it pairs with the structural fixes for instability, good weight initialization, normalization, and residual connections, that address why the gradients grow in the first place.
