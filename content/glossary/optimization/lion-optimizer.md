---
title: Lion Optimizer
slug: lion-optimizer
kind: technique
category: Optimization
aliases: EvoLved Sign Momentum, Lion
related: adam, momentum, weight-decay, learning-rate, gradient-descent, stochastic-gradient-descent
summary: A memory-efficient optimizer, discovered by automated program search rather than designed by hand, that moves every parameter by a fixed amount in the direction of the sign of a momentum-smoothed gradient. Tracking one running average instead of Adam's two halves the optimizer memory, and its sign-only step is a rare case of machine search producing something simple enough to write down.
---

Lion, short for EvoLved Sign Momentum, is notable both for what it does and for how it was found. Its update rule is strikingly spare: it keeps a single momentum buffer, a running average of past gradients, and at each step moves every parameter by a fixed amount in the direction given by the sign of that momentum, plus a decoupled weight-decay term. Because the step depends only on the sign, every parameter receives an update of the same magnitude regardless of how large its gradient is, with the learning rate alone setting that magnitude, a sharp departure from Adam, which scales each parameter's step by an estimate of its gradient variance.

The defining practical advantage is memory. Adam keeps two running averages per parameter, the first and second moments, so its optimizer state is twice the size of the model itself; Lion keeps one, halving that state. For very large models, where optimizer memory is a real constraint on what fits on an accelerator, this is a meaningful saving, and the sign-based step is cheap to compute. Lion is slightly more intricate than plain momentum: the direction comes from an interpolation between the current gradient and the momentum, giving a Nesterov-like look-ahead character, while the buffer is updated with a different decay rate, so the buffer and the step see the gradient through different weightings.

What makes Lion unusual is its provenance, and this is the part worth remembering. Rather than being designed from a principle by hand, it was discovered by an automated search over a space of possible optimizer programs, an evolutionary procedure that proposed, ran, and selected candidate update rules by how well the models they trained performed. Out of that search came an algorithm simpler than the human-designed optimizers it was compared against, a rare case of program search producing something both effective and interpretable enough to write in a few lines, which ties Lion to the broader theme of using learning and search to design the components of learning systems themselves.

In reported experiments Lion matched or exceeded AdamW across a range of vision and language models while using less memory and sometimes fewer steps. The trade-offs are real and follow from the sign update: because every step has unit magnitude, Lion is sensitive to its learning rate and typically needs a smaller one than Adam paired with a larger weight decay, and the uniform step can be less forgiving on problems with widely varying gradient scales, where Adam's per-parameter adaptation helps. Lion is best seen as a lighter-weight alternative to AdamW worth trying when optimizer memory is tight, rather than a universal replacement.
