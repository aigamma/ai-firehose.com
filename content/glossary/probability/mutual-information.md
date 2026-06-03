---
title: Mutual Information
slug: mutual-information
kind: technique
category: Probability and Information Theory
aliases: mutual information, information gain
related: entropy, kl-divergence, conditional-probability, cross-entropy, probability-distribution, expectation
summary: A measure of how much knowing one random variable reduces uncertainty about another, equal to the difference between a variable's entropy and its entropy conditioned on the other, and zero exactly when the two are independent.
---

Mutual information measures how much two random variables tell you about each other. It is defined as the reduction in uncertainty about one variable that comes from learning the other: the entropy of X minus the conditional entropy of X given Y. Equivalently and symmetrically, it is the kl-divergence between the joint distribution of the two variables and the product of their marginals, which makes precise the idea that mutual information measures how far the variables are from being independent. It is symmetric in its two arguments, always non-negative, and exactly zero when and only when the variables are independent.

The intuition is that mutual information captures shared structure of any kind, not merely the linear association that correlation detects. Two variables can have zero correlation yet large mutual information if they are related through a nonlinear or non-monotonic dependence, such as one being the square of the other. This generality is why mutual information is the natural measure of statistical dependence: it responds to any departure from independence, however the variables happen to be coupled. Because it is symmetric, the information X carries about Y is always exactly the information Y carries about X.

Mutual information matters across machine learning as a model-agnostic measure of relevance and association. In feature selection it scores how informative an input is about the target, the same quantity that appears as information gain when a decision tree chooses where to split. In representation learning, the InfoMax principle and contrastive methods aim to learn embeddings that preserve high mutual information with the input or with related views of it, which has become a central idea in self-supervised learning. The information bottleneck framework casts learning itself as a tradeoff: compress the input while keeping as much mutual information as possible about the label.

A practical difficulty is that mutual information is notoriously hard to estimate from samples in high dimensions, because it requires knowledge of joint and marginal densities that are themselves hard to obtain. This has spawned a family of neural estimators and variational bounds that approximate it, along with a healthy skepticism about claims that rest on tight estimates. The conceptual clarity of the quantity often exceeds the reliability of its measurement, so it is frequently used as a guiding objective optimized through a surrogate bound rather than computed exactly.

Conceptually, mutual information sits at the center of information theory and ties its other quantities together. It is built from entropy and conditional entropy, expressed as a kl-divergence, and related to the channel capacity that bounds reliable communication. Its conditional form measures dependence that remains after accounting for a third variable, which connects it to the conditional independence assumptions behind graphical models. Wherever the question is how much one thing reveals about another, mutual information is the answer information theory provides.
