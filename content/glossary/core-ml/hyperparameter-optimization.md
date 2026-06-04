---
title: Hyperparameter Optimization
slug: hyperparameter-optimization
kind: technique
category: Core Machine Learning
aliases: hyperparameter tuning, HPO, grid search, random search
related: cross-validation, bayesian-optimization, overfitting, learning-rate
summary: The search for the configuration settings fixed before training, learning rate, model size, regularization strength, rather than learned from data. The strategies run from brute-force grid search to the smarter Bayesian optimization, and the subtle trap is overfitting the hyperparameters themselves by tuning too hard against one validation set.
---

Hyperparameters are the knobs you set before training begins, as opposed to the parameters the model learns from the data once it starts. The learning rate, the number and size of layers, the regularization strength, the batch size, the tree depth, all of these are chosen by the practitioner, and the right choices can be the entire difference between a model that works and one that does not. Hyperparameter optimization is the search for good settings, and the reason to automate it is that hand-tuning by intuition is slow, irreproducible, and usually worse than a systematic search.

The strategies trade thoroughness against cost. Grid search tries every combination on a predefined grid; it is exhaustive but its cost explodes combinatorially with the number of knobs, and it wastes most of its trials varying dimensions that turn out not to matter. Random search samples configurations at random and, surprisingly, often finds good ones faster per unit of compute, precisely because it does not squander trials holding the important knob fixed while sweeping an unimportant one. Bayesian optimization is smarter still: it builds a probabilistic model of how settings map to performance and uses it to propose the most promising configuration to try next, spending the budget where it is likely to pay off. Methods like successive halving and Hyperband add early stopping, killing clearly bad configurations before they finish.

Whatever the search strategy, each candidate has to be scored honestly, which means evaluating it on held-out data through cross-validation rather than on the data it trained on. A configuration that looks best on the training data is telling you nothing about how it will generalize, so the whole search is only as trustworthy as the evaluation underneath it.

The subtle trap, and the one that catches careful people, is overfitting the hyperparameters themselves. If you tune against the same validation set many times, choosing whatever scores best, you slowly start fitting that set's particular noise, and the winning configuration looks better than it truly is, the same overfitting dynamic as a model memorizing its training data, one level up. The defense is a separate, untouched test set used exactly once at the very end, which is the only number that reflects real generalization after a long search has had every chance to fool you.
