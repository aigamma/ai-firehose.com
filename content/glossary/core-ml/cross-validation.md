---
title: Cross-Validation
slug: cross-validation
kind: technique
category: Core Machine Learning
aliases: cross validation, k-fold cross-validation, CV
related: overfitting, underfitting, bias-variance-tradeoff, regularization, supervised-learning
summary: A way to estimate how a model will do on data it has not seen by rotating the test set: split the data into folds, train on all but one, test on the held-out fold, and repeat until every fold has served as the test set once. It exists because a single train-test split is a coin flip, and trusting the wrong number is how models fail in deployment.
---

A single train-test split is a coin flip. Depending on which examples happen to land in the test set, the same model can look excellent or mediocre, which makes one split a shaky basis for any decision. Cross-validation removes the luck by rotating the split. It cuts the data into several equal folds, then trains and evaluates the model several times, each time holding out a different fold as the test set, so every example is used for testing exactly once. Averaging the scores yields an estimate far steadier than any single split could give.

This matters because the number that decides whether a model is good, its performance on unseen data, has to be estimated honestly, and the training data cannot do it. A model that overfits scores beautifully on data it has already seen and then fails in deployment, so reporting training accuracy is worse than useless, it is actively misleading. Cross-validation exposes overfitting directly by always scoring on held-out folds, and its averaging keeps the estimate stable even when the dataset is small enough that a lone test set would be mostly noise.

The standard form is k-fold cross-validation: split into k folds (k is usually 5 or 10), train on k minus 1 of them, test on the last, and repeat until each fold has had its turn. Stratified variants preserve the class balance within each fold, and leave-one-out is the extreme case where k equals the number of examples. One rule governs all of it, and breaking it is the cardinal sin of evaluation: the test fold must never influence training in any way, including feature scaling, feature selection, or hyperparameter choice, or the estimate is contaminated and optimistically wrong. Data leakage of this kind is the silent killer that makes a model look superb in the notebook and fall apart in production.

Cross-validation is the tool behind almost every honest comparison in machine learning. The strength of regularization, the depth of a decision tree, the kernel of a support vector machine, and the choice among competing models are all settled by comparing cross-validated scores. Because it gives an empirical reading of generalization error, it is also how practitioners locate the balance point of the bias-variance tradeoff in practice, picking the complexity whose held-out error is lowest. It is less a technique than the discipline that separates a number you can act on from a number that is lying to you.
