---
title: Logistic Regression
slug: logistic-regression
kind: technique
category: Core Machine Learning
aliases: logistic regression, logit model
related: linear-regression, softmax, cross-entropy, supervised-learning, support-vector-machine
summary: A linear model for classification that runs a weighted sum of features through a sigmoid or softmax to produce class probabilities, trained by minimizing cross-entropy. It is a workhorse baseline, and more than that, it is the final layer of almost every neural classifier, so understanding it is understanding what a deep network does in its last step.
---

Logistic regression is hiding inside almost every neural network you have used. It takes the same weighted sum of features as linear regression, but instead of using that score directly it passes it through the logistic, or sigmoid, function, which squashes any real number into the range zero to one and reads out as the probability of the positive class. For more than two classes the sigmoid generalizes to the softmax, giving each class a probability and making them sum to one. A threshold then turns the probability into a decision. This is exactly what the last layer of a neural classifier does: the network learns features, then runs softmax regression on top of them.

It is trained by minimizing cross-entropy, which is the same thing as maximizing the likelihood of the observed labels. There is no closed-form solution, so it is fit by gradient-based optimization, but the objective is convex, so training reliably finds the single best set of weights with no risk of getting stuck in a bad spot. That combination, a probabilistic output and a convex loss, is much of why it has lasted.

Despite the deep learning era, logistic regression remains a first-tool-out-of-the-box baseline: fast, interpretable, well-calibrated when its assumptions hold, and genuinely hard to beat on simple or high-dimensional sparse problems like text classification. A surprising amount of applied machine learning turns out to be a strong logistic regression that someone tried to beat with something heavier and could not, which is why reaching for it first saves a great deal of wasted effort.

Its one real limitation is in the word linear: the decision boundary it draws is a flat hyperplane in the feature space. When the true boundary curves, logistic regression needs engineered features or a more flexible model to bend it, which is exactly the gap that kernels and neural networks fill. Seen the other way around, a neural network is the machine that learns the features logistic regression then classifies, which is why the humble logit model is not a rival to deep learning but a piece of it.
