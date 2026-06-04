---
title: Ensemble Learning
slug: ensemble-learning
kind: technique
category: Core Machine Learning
aliases: ensemble methods, model ensembling, bagging, boosting, stacking
related: random-forest, decision-tree, gradient-boosting, bias-variance-tradeoff, cross-validation
summary: Combining many models into one prediction, on the principle that a diverse committee beats any single member, because if the members make different mistakes those mistakes cancel while their shared signal reinforces. It is the umbrella over bagging, boosting, and stacking, and it wins competitions almost by default.
---

Ensemble learning is the machine learning version of the wisdom of crowds, with one crucial caveat: the crowd has to disagree. The principle is that a group of models, if their errors are not perfectly correlated, will collectively be more accurate and more stable than any one of them, because when diverse models make different mistakes, averaging or voting causes the mistakes to partly cancel while the signal they all detect reinforces. Diversity among the members is therefore not a nice-to-have, it is the entire mechanism: identical models pooled together gain you nothing, since they all err the same way.

There are three classic recipes for manufacturing useful disagreement. Bagging trains many models independently on different random resamples of the data and averages them; because the members are nearly independent, this mainly reduces variance, and the random forest is its famous instance. Boosting trains models in sequence, each correcting the errors of those before it, which mainly reduces bias, and gradient boosting is its dominant form. Stacking trains a small meta-model to learn the best way to combine the base models' outputs, rather than averaging them by a fixed rule. Each is a different answer to the question of how to make the members differ in a way that actually pays.

The approach is everywhere because it reliably squeezes out the last increments of accuracy that a single model leaves on the table. Ensembles win machine-learning competitions almost by default, to the point that a bare single model rarely tops a leaderboard, and even in deep learning, averaging several trained networks or several snapshots of one network is a standard way to buy a little robustness and accuracy for the cost of running them.

The cost is practical rather than conceptual. An ensemble multiplies the compute and memory of both training and serving, and it dilutes interpretability, since the prediction is now a committee verdict rather than one legible model. The judgment is always whether the accuracy gain is worth running several models instead of one, which is why ensembling is ubiquitous in competitions and offline analysis, where accuracy is everything, and more selective in production, where latency and cost get a vote.
