---
title: Hyperparameter Optimization
slug: hyperparameter-optimization
kind: technique
category: Core Machine Learning
aliases: hyperparameter tuning, HPO, grid search, random search
related: cross-validation, bayesian-optimization, overfitting, learning-rate
summary: The search for the configuration settings that are fixed before training (learning rate, model size, regularization strength, and so on) rather than learned from data, automated by strategies from grid and random search to Bayesian optimization.
---

Hyperparameters are the knobs you set before training begins, as opposed to the parameters the model learns from data. The learning rate, the number and size of layers, the regularization strength, the batch size, and the tree depth are all hyperparameters, and the right choices can be the difference between a model that works and one that does not. Hyperparameter optimization is the search for good settings, ideally automated rather than guessed.

The strategies trade off thoroughness against cost. Grid search tries every combination on a predefined grid; it is exhaustive but its cost explodes combinatorially, and it wastes effort on dimensions that do not matter. Random search samples configurations at random and, perhaps surprisingly, often finds good ones faster per unit of compute, because it does not squander trials varying unimportant knobs. Bayesian optimization is smarter still: it builds a probabilistic model of how settings map to performance and uses it to propose the most promising configurations to try next, spending the budget where it is likely to pay off. Methods like successive halving and Hyperband add early stopping, killing clearly bad configurations before they finish training.

Each candidate configuration must be scored honestly, which means evaluating it with cross-validation or a held-out set rather than on the training data.

The subtle trap is overfitting the hyperparameters themselves: if you tune against the same validation set many times, you start fitting that set's noise, and the chosen configuration looks better than it truly is. A separate, untouched test set, used only once at the end, is what keeps the final estimate honest.
