---
title: Early Stopping
slug: early-stopping
kind: technique
category: Optimization
aliases: early stopping
related: overfitting, regularization, cross-validation, bias-variance-tradeoff
summary: Halting training when held-out validation performance stops improving, capturing the model at its point of best generalization just before it tips into overfitting. It is the cheapest regularizer there is, because it changes nothing about the model or the loss, only the moment you stop.
---

Early stopping watches a model generalize and pulls the plug at the right moment. As training proceeds the loss on the training data keeps falling, but the loss on a held-out validation set typically falls for a while, then turns and rises, marking the point where the model stops learning general patterns and starts memorizing the training set. Early stopping monitors that validation curve and ends training at the bottom of it, keeping the checkpoint from just before overfitting set in.

In practice it does not quit at the very first uptick, which might be noise; it waits a set number of evaluations with no improvement, the patience, and then stops, restoring the best weights it saw. That makes it both a stopping rule and a model-selection rule in one, which is part of why it is so widely used.

It is the cheapest and one of the most common forms of regularization precisely because it touches neither the model nor the loss, only the decision of when to quit. Conceptually it bounds how far the model is allowed to travel into the overfitting regime, complementing regularizers like weight decay and dropout that act on the parameters directly, and it is the bias-variance tradeoff made operational: stop too early and the model underfits, too late and it overfits, so the validation curve picks the sweet spot for you. A regularizer that costs nothing and selects the best checkpoint as a side effect is a rare bargain.
