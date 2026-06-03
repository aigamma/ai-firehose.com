---
title: Logistic Regression
slug: logistic-regression
kind: technique
category: Core Machine Learning
aliases: logistic regression, logit model
related: linear-regression, softmax, cross-entropy, supervised-learning, support-vector-machine
summary: A linear model for classification that passes a weighted sum of features through a logistic (sigmoid) or softmax function to produce class probabilities, trained by minimizing cross-entropy; a workhorse baseline and the classification counterpart to linear regression.
---

Logistic regression adapts the machinery of linear regression to classification. It computes the same kind of weighted sum of features, but instead of using that score directly it passes it through the logistic, or sigmoid, function, which squashes any real number into the range zero to one. The output is read as the probability of the positive class, and a threshold turns that probability into a decision. For more than two classes, the sigmoid generalizes to the softmax, producing a probability for each class that sums to one.

It is trained by minimizing cross-entropy, which is equivalent to maximizing the likelihood of the observed labels. There is no closed form, so it is fit by gradient-based optimization, but the objective is convex, so training reliably finds the best weights.

Despite the deep-learning era, logistic regression remains a first-tool-out-of-the-box baseline: it is fast, interpretable, well-calibrated when its assumptions hold, and hard to beat on simple or high-dimensional sparse problems. Crucially, it is also hiding inside neural networks. The final classification layer of almost any neural classifier is a softmax regression on top of the learned features, so the network can be read as feature learning followed by logistic regression.

Its limitation is that the decision boundary it draws is linear in the features. When the true boundary is curved, logistic regression needs engineered features or a more flexible model, which is exactly the gap that kernels and neural networks fill.
