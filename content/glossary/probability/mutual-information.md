---
title: Mutual Information
slug: mutual-information
kind: technique
category: Probability and Information Theory
aliases: mutual information, information gain
related: entropy, kl-divergence, conditional-probability, cross-entropy, probability-distribution, expectation
summary: A measure of how much knowing one variable reduces uncertainty about another, the reduction in entropy that learning one buys you about the other. Unlike correlation it detects any kind of dependence, not just linear, which makes it the natural measure of statistical association and the target of self-supervised and information-bottleneck objectives.
---

Mutual information measures how much two random variables tell you about each other. It is defined as the reduction in uncertainty about one variable that comes from learning the other: the entropy of X minus the conditional entropy of X given Y. Equivalently and symmetrically, it is the KL divergence between the joint distribution of the two variables and the product of their marginals, which makes precise the idea that it measures how far the variables are from being independent. It is symmetric, always non-negative, and exactly zero when and only when the variables are independent.

The intuition is that mutual information captures shared structure of any kind, not merely the linear association that correlation detects. Two variables can have zero correlation yet large mutual information if they are related through a nonlinear or non-monotonic dependence, such as one being the square of the other, where correlation sees nothing but mutual information sees everything. This generality is why it is the natural measure of statistical dependence: it responds to any departure from independence, however the variables happen to be coupled, which a single correlation coefficient cannot.

Mutual information matters across machine learning as a model-agnostic measure of relevance and association. In feature selection it scores how informative an input is about the target, the same quantity that appears as information gain when a decision tree chooses where to split. In representation learning, the InfoMax principle and contrastive methods aim to learn embeddings that preserve high mutual information with the input or with related views of it, which has become a central idea in self-supervised learning. The information bottleneck framework casts learning itself as a tradeoff: compress the input as much as possible while keeping as much mutual information as you can about the label.

A practical difficulty is that mutual information is notoriously hard to estimate from samples in high dimensions, because it requires knowing joint and marginal densities that are themselves hard to obtain. This has spawned a family of neural estimators and variational bounds that approximate it, along with a healthy skepticism about claims that rest on tight estimates, since the conceptual clarity of the quantity often exceeds the reliability of its measurement. It is therefore frequently used as a guiding objective optimized through a surrogate bound rather than computed exactly. Conceptually it sits at the center of information theory, built from entropy and conditional entropy, expressed as a KL divergence, and related to the channel capacity that bounds reliable communication.
