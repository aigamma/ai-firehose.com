---
title: Overfitting
slug: overfitting
kind: technique
category: Core Machine Learning
aliases: overfit, overfitted
related: underfitting, bias-variance-tradeoff, regularization, cross-validation, random-forest, decision-tree
summary: The failure mode in which a model learns the noise and idiosyncrasies of its training data instead of the underlying pattern, so it performs well on training data but poorly on new data.
---

Overfitting is the central failure mode of Supervised Learning. A model overfits when it fits its training data too closely, capturing not just the genuine signal but also the random noise, sampling quirks, and outliers specific to that particular sample. The symptom is a wide gap between training and test performance: the model scores almost perfectly on the data it was trained on yet generalizes poorly to data it has not seen. It has memorized rather than learned.

Overfitting matters because the entire point of a model is to generalize to new inputs, and a model that has memorized its training set is worthless on anything else. It is the constant adversary of every practitioner, and recognizing it is the first skill of applied machine learning. The risk grows with model complexity (more parameters, deeper trees, higher-degree polynomials) and shrinks with the amount of training data: a flexible model fed too few examples will almost always find spurious patterns to exploit.

Overfitting is one pole of the Bias-Variance Tradeoff. An overfit model has high variance, meaning its learned function swings wildly with small changes in the training data, even though it has low bias on that data. Its opposite is Underfitting, where the model is too simple to capture the real pattern at all. The art is to sit between them, complex enough to model the truth but constrained enough to ignore the noise.

The standard defenses all aim to constrain the model or to detect the gap before deployment. Regularization penalizes complexity directly, pulling the fit toward simpler solutions. Cross-Validation exposes overfitting by measuring performance on held-out data. Gathering more data, stopping training early, and ensemble methods like a Random Forest, which average many decorrelated models, all reduce variance and curb the tendency to memorize.
