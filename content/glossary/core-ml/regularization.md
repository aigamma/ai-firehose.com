---
title: Regularization
slug: regularization
kind: technique
category: Core Machine Learning
aliases: regularize, L1 regularization
related: overfitting, underfitting, bias-variance-tradeoff, cross-validation, support-vector-machine
summary: A family of techniques that constrain a model's complexity so it generalizes instead of memorizing, usually by penalizing the size of its parameters. Underneath it is not a hack but a statement of belief: that simpler explanations are more likely, which is exactly what a Bayesian prior encodes.
---

Give a model enough freedom and it will use all of it, contorting itself to pass through every point in the training data, noise included. regularization is the deliberate act of taking some of that freedom back. The most common form adds a penalty to the loss that grows with the size of the model's weights, so the optimizer can no longer chase the data without limit; it must trade a tighter fit against keeping the weights small, and smoother, smaller solutions win unless the data genuinely insists otherwise. It is the most direct lever there is against overfitting.

The two classic penalties pull in the same direction but leave different fingerprints. L2 regularization, also called weight decay, penalizes the sum of squared weights and shrinks them all smoothly toward zero without quite eliminating any. L1 regularization penalizes the sum of absolute weights and drives many of them exactly to zero, so it performs feature selection for free, handing back a sparse model that names the features it actually used. A single strength parameter sets how hard the penalty pushes, tuned by cross-validation: too hard and the model underfits, too soft and the penalty never bites.

Why any of this is principled rather than a fudge becomes clear from a Bayesian angle. Training a model amounts to asking which parameters best explain the data; regularization adds a second voice to that question, a prior belief about which parameters are plausible before any data arrives. Penalizing squared weights is exactly equivalent to assuming the weights were drawn from a Gaussian centered at zero, and penalizing absolute weights corresponds to a sharper Laplace prior that expects most weights to be precisely zero. From this view regularization is not a patch bolted onto learning, it is the formal way to state a belief that simpler explanations are more probable, a mathematical Occam's razor.

Seen that way, regularization runs through the whole field rather than sitting in one corner of it. A support vector machine builds it into its objective by maximizing the margin, a form of L2 control; the averaging in a random forest is an implicit regularizer that cancels variance; dropout, early stopping, and data augmentation each constrain what a network can learn without touching the loss directly. What unites them is the recognition that separates a practitioner from a novice: the goal of training was never to fit the training data, it was to generalize, and the road to generalization runs through disciplined simplicity rather than unconstrained fit.
