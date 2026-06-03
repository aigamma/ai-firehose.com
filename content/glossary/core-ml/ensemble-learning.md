---
title: Ensemble Learning
slug: ensemble-learning
kind: technique
category: Core Machine Learning
aliases: ensemble methods, model ensembling, bagging, boosting, stacking
related: random-forest, decision-tree, gradient-boosting, bias-variance-tradeoff, cross-validation
summary: Combining the predictions of many models into one, on the principle that a diverse committee outperforms any single member; the umbrella over bagging, boosting, and stacking.
---

Ensemble learning rests on a simple, robust idea: a group of models, if their errors are not perfectly correlated, will collectively be more accurate and more stable than any one of them. When diverse models make different mistakes, averaging or voting causes the mistakes to partly cancel while the shared signal reinforces. Diversity among the members is therefore the whole game.

There are three classic recipes. Bagging (bootstrap aggregating) trains many models independently on different resamples of the data and averages them; because the members are independent, this mainly reduces variance, and the random forest is its famous instance. Boosting trains models sequentially, each one correcting the errors of those before it, which mainly reduces bias, and gradient boosting is its dominant form. Stacking trains a meta-model to learn how best to combine the base models' outputs, rather than averaging them by a fixed rule.

The approach is everywhere because it reliably squeezes out extra accuracy: ensembles win machine-learning competitions almost by default, and even in deep learning, averaging several trained networks or their snapshots is a standard way to gain a little robustness and accuracy.

The cost is practical, not conceptual. An ensemble multiplies the compute and memory of training and serving, and it dilutes interpretability, since the prediction is now a committee decision rather than one legible model. The usual judgment is whether the accuracy gain is worth running several models instead of one.
