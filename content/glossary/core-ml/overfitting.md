---
title: Overfitting
slug: overfitting
kind: technique
category: Core Machine Learning
aliases: overfit, overfitted
related: underfitting, bias-variance-tradeoff, regularization, cross-validation, random-forest, decision-tree
summary: The failure where a model learns the noise and accidents of its training data instead of the pattern beneath, scoring beautifully on what it has seen and poorly on what it has not. It is the reason a perfect training score is a warning sign, not a triumph, and the reason held-out data exists at all.
---

A model that gets every training example right is usually a worse model, not a better one. That is the unintuitive heart of overfitting: given enough flexibility, a learner fits not just the genuine signal in its training data but also the noise, the sampling quirks, and the outliers peculiar to that one sample, and the closer it hugs those accidents the worse it does on anything new. The tell is a widening gap between training and test performance, near-perfect on the data it studied, mediocre on the data it will actually face. It has memorized the answer key instead of learning the subject.

What makes overfitting the central problem of the field is that generalizing, performing on inputs never seen, is the entire point of a model, and one that has memorized its training set is worthless everywhere else. The humbling part is that overfitting is invisible from the inside. Nothing in the training numbers reveals it; a model busily overfitting reports glowing scores right up until it meets new data. The only way to see it at all is to refuse to look at the training score and to hold back data the model is never allowed to touch, which is why honest evaluation is not bureaucracy but the one defense against fooling yourself.

The risk rises with model capacity, more parameters, deeper trees, higher-degree polynomials, and falls with the amount of training data: a flexible model fed too few examples will always find spurious patterns to exploit. In the language of the bias-variance tradeoff, an overfit model is the high-variance pole, its learned function swinging wildly when the training sample changes even slightly. Its opposite is underfitting, a model too rigid to capture the real pattern at all, and good modeling is the search for the seat between them.

Every standard defense is some way of either constraining the model or catching the gap before it ships. regularization penalizes complexity directly, pulling the fit toward simpler explanations. cross-validation drags the gap into the light by always scoring on held-out folds. More data, early stopping, and ensemble methods like a random forest, which averages many decorrelated models, all damp the variance that drives memorization. None of them removes the underlying tension, because the same flexibility that lets a model learn something subtle is what lets it memorize, so the work is never to eliminate overfitting, only to stop it just short of where it begins to hurt.
