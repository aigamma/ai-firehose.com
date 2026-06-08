---
title: Gradient Clipping
slug: gradient-clipping
kind: technique
category: Optimization
aliases: gradient clipping, clip-by-norm
related: exploding-gradient, backpropagation, gradient-descent, recurrent-neural-network
summary: A guardrail that caps the size of the gradient before each update, so one freakishly large gradient cannot blow the weights apart or poison the run with NaNs. It treats the symptom of instability, which is why it pairs with the structural fixes, good initialization, normalization, residuals, that address the cause.
---

Gradient clipping is a guardrail against one bad step wrecking an entire training run. Backpropagation occasionally produces a gradient far larger than usual, and applying it would fling the weights across the loss landscape, destroying learned structure or producing NaNs that then poison every subsequent step. Clipping bounds the size of the update so a single outsized gradient cannot do that damage, a cheap insurance policy against a rare but catastrophic event.

The common form is clip-by-norm: if the overall norm of the gradient exceeds a threshold, the whole gradient is rescaled down to that norm, capping the step's magnitude while preserving its direction, which is the property that matters, since you still want to move the right way, just not too far. A blunter variant, clip-by-value, caps each component individually but can distort the direction. Either way the computational cost is negligible and the protection is real.

It earns its place where exploding gradients are common: recurrent networks unrolled over long sequences, where the same weights are multiplied through many time steps, and the training of very deep or very large models, where it is a standard line in the recipe. The framing worth keeping is that clipping treats the symptom rather than the disease. It pairs with the structural fixes that address why gradients grow in the first place, careful weight initialization, normalization layers, and residual connections, and the combination is what keeps large modern training runs from diverging. In practice the threshold is itself a hyperparameter, set by watching the distribution of gradient norms during a healthy run and capping a little above the typical value, and frameworks clip by the global norm across all parameters at once so the relative scale between layers is preserved.
