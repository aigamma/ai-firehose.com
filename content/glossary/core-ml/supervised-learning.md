---
title: Supervised Learning
slug: supervised-learning
kind: technique
category: Core Machine Learning
aliases: supervised machine learning
related: unsupervised-learning, reinforcement-learning, self-supervised-learning, overfitting, cross-validation, decision-tree
summary: The paradigm that learns a mapping from inputs to outputs by training on examples already paired with the right answer. It dominates applied machine learning not because it is the most sophisticated idea but because a known label turns learning into a measurable target, and that single property is what makes progress trackable.
---

Give a model enough examples that already carry the right answer, and learning becomes something you can measure. That is the whole proposition of supervised learning, and it is a stronger one than it first appears. The label attached to each input does two jobs at once: it tells the model what to predict, and it gives you an exact yardstick for how wrong the model still is. Most of machine learning's hardest open questions, like how to learn from data nobody has labeled, exist precisely because the rest of the field does not get this gift for free.

The mechanism follows from the yardstick. Define a loss that scores how far each prediction sits from its label, then push the model's parameters until that score is small across the training set. The form of the push depends on the model: a decision tree searches combinatorially for splits that separate the labels, while a differentiable model rides gradient descent downhill on the loss. The task splits into classification, where the answer is one of a fixed set of categories, and regression, where it is a continuous quantity, but the loop is the same in both: predict, measure the gap, adjust.

The catch is that a measurable target is also a target you can cheat. A model with enough capacity can drive its training loss to nearly zero by memorizing the answers rather than learning the pattern that produced them, which is overfitting, and the only way to catch it is to refuse to trust any number computed on data the model has already seen. This is why held-out evaluation and cross-validation are not optional hygiene but the load-bearing discipline of the whole paradigm: the training loss is the thing being optimized, so it cannot also be the thing you believe.

What separates supervised learning from unsupervised learning and reinforcement learning is just where the signal comes from: an explicit label, latent structure in unlabeled data, or a reward that arrives late and sparse. That framing exposes the paradigm's real constraint. Its power is rented from the labels, and labels are expensive, because a human usually has to produce each one. The most consequential shift in modern machine learning has been the move to coax a supervised-style target out of unlabeled data through self-supervised learning, which keeps the measurable objective that makes supervision work while escaping the annotation bill that has always capped how far it can scale.
