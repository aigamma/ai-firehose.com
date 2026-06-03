---
title: Early Stopping
slug: early-stopping
kind: technique
category: Optimization
aliases: early stopping
related: overfitting, regularization, cross-validation, bias-variance-tradeoff
summary: A regularization technique that halts training when performance on a held-out validation set stops improving, capturing the model at its point of best generalization before it begins to overfit the training data.
---

Early stopping watches the model generalize and pulls the plug at the right moment. During training the loss on the training data keeps falling, but the loss on a held-out validation set typically falls for a while and then turns and rises, the point where the model stops learning general patterns and starts memorizing the training set. Early stopping monitors that validation curve and ends training at the bottom of it, keeping the checkpoint from just before overfitting set in.

In practice it does not stop at the very first uptick, which could be noise; it waits a set number of evaluations without improvement (the patience) and then stops, restoring the best weights seen. This makes it both a stopping rule and a model-selection rule.

It is one of the cheapest and most widely used forms of regularization, because it changes nothing about the model or the loss, only when to quit. Conceptually it limits how far the model travels into the overfitting regime, complementing other regularizers like weight decay and dropout, and it directly embodies the bias-variance tradeoff: stop too early and the model underfits, too late and it overfits, so the validation set picks the sweet spot.
