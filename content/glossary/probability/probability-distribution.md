---
title: Probability Distribution
slug: probability-distribution
kind: technique
category: Probability and Information Theory
aliases: distribution, probability density, probability mass function
related: gaussian-distribution, expectation, variance, entropy, bayesian-inference, softmax
summary: The full description of a random quantity: for every possible outcome, how much probability it carries. It is the central object of machine learning, because a classifier outputs a distribution over labels, a language model a distribution over next tokens, and learning itself is fitting, comparing, and sampling from distributions.
---

A probability distribution is the complete description of a random quantity: it says, for every possible outcome, how much probability that outcome carries. For a discrete variable like a die roll it is a probability mass function assigning a number to each of finitely many outcomes, and those numbers sum to one. For a continuous variable like a height or a prediction error it is a probability density function whose integral over any interval gives the probability of landing there, and whose integral over everything is one. The crucial shift in perspective is that the distribution is the object; individual probabilities are merely its values.

Distributions matter because nearly every quantity a machine learning system reasons about is uncertain, and a distribution is the language for that uncertainty. A classifier does not really output a label so much as a distribution over labels. A language model is, precisely, a distribution over the next token given the context. Training data is modeled as samples drawn from some unknown underlying distribution, and the entire goal of learning is to recover or approximate that distribution well enough to generalize to data never seen. To do machine learning is, at bottom, to fit, compare, and sample from distributions.

Distributions are summarized by their moments and other functionals. The expectation is the probability-weighted average outcome, the center of mass. The variance measures how widely the outcomes spread around that center. Higher moments capture skew and the heaviness of the tails. These summaries are lossy, two very different distributions can share a mean and variance, but they are often the most useful handles for reasoning and computation, which is why so much of statistics is the study of a few numbers standing in for a whole distribution.

Certain named distributions recur because they arise from natural processes. The Gaussian distribution emerges whenever many small independent effects add together, by the central limit theorem, which is why it models noise so often. The Bernoulli and categorical distributions describe single binary or multi-way choices, and the softmax is the standard way a neural network turns raw scores into a categorical distribution. Distributions also connect straight to information theory: the entropy of a distribution measures its unpredictability, and comparing two distributions through cross-entropy or KL divergence gives the loss functions that train most modern models. Whether you read a distribution as a frequency or a degree of belief, it remains the central object the whole field manipulates.
