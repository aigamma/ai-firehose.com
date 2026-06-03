---
title: Probability Distribution
slug: probability-distribution
kind: technique
category: Probability and Information Theory
aliases: distribution, probability density, probability mass function
related: gaussian-distribution, expectation, variance, entropy, bayesian-inference, softmax
summary: A mathematical object that assigns probabilities to the possible outcomes of a random variable, describing how likely each value is and summing or integrating to one over the whole space.
---

A probability distribution is the full description of a random quantity: it tells you, for every possible outcome, how much probability mass that outcome carries. For a discrete variable such as the roll of a die, the distribution is a probability mass function that gives a number to each of the finitely many outcomes, and those numbers sum to one. For a continuous variable such as a height or a model's prediction error, it is a probability density function whose integral over any interval gives the probability of landing in that interval, and whose integral over the whole line is one. The distribution is the thing; individual probabilities are just its values.

Distributions matter because nearly every quantity a machine learning system reasons about is uncertain, and a distribution is the language for that uncertainty. A classifier does not output a single label so much as a distribution over labels. A language model defines a distribution over the next token given the context. Training data is modeled as samples drawn from some unknown underlying distribution, and the entire goal of learning is to recover or approximate that distribution well enough to generalize to data the model has never seen.

Distributions are summarized by their moments and other functionals. The expectation is the probability-weighted average outcome, the center of mass of the distribution. The variance measures how widely the outcomes spread around that center. Higher moments capture skew and the heaviness of the tails. These summaries are lossy, two very different distributions can share a mean and variance, but they are often the most useful handles for reasoning and computation.

Certain named distributions recur because they arise from natural processes. The Gaussian distribution emerges whenever many small independent effects add together, by the central limit theorem, which is why it models noise so often. The Bernoulli and categorical distributions describe single binary or multi-way choices, and the softmax function is the standard way a neural network turns raw scores into a categorical distribution. The Poisson distribution counts rare events, and the exponential and gamma distributions model waiting times.

Distributions connect directly to information theory. The entropy of a distribution quantifies its inherent unpredictability, and comparing two distributions through cross-entropy or kl-divergence gives the loss functions that train most modern models. Under bayesian inference, distributions are not merely summaries of data but representations of belief, updated by bayes-theorem as evidence arrives. Whether you treat a distribution as a frequency or a degree of belief, it remains the central object: machine learning is, at bottom, the practice of fitting, comparing, and sampling from probability distributions.
