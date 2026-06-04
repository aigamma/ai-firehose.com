---
title: Expectation
slug: expectation
kind: technique
category: Probability and Information Theory
aliases: expected value, mean, expectation operator
related: variance, probability-distribution, entropy, maximum-likelihood-estimation, gaussian-distribution
summary: The probability-weighted average of a random variable, the long-run mean over many draws. It is the connective tissue of machine learning, because almost every objective the field minimizes, risk, loss, expected reward, is an expectation, and stochastic gradient descent works only because a minibatch gradient is an unbiased estimate of one.
---

The expectation of a random variable is its average outcome weighted by probability, the center of mass of its distribution. For a discrete variable it is the sum over outcomes of each value times its probability; for a continuous one it is the integral of the value times its density. Written E[X], it answers the question: if you drew from this distribution again and again, what would the values average to? By the law of large numbers the empirical average of many independent samples converges to the expectation, which is what makes a single number a meaningful summary of a whole distribution.

Expectation matters because almost every quantity machine learning tries to minimize or estimate is an expectation. The risk a model incurs is the expected loss over the data distribution; because that true distribution is unknown, training minimizes the empirical risk, the average loss over the training set, which is the sample estimate of that expectation. Reinforcement learning maximizes the expected cumulative reward of a policy. Even the entropy of a distribution is an expectation, the expected negative log probability. The expectation operator is the connective tissue running through all of these objectives.

The single most useful property of expectation is linearity: the expectation of a sum is the sum of the expectations, whether or not the variables are independent. E[aX + bY] equals a times E[X] plus b times E[Y], always, with no independence required. This is what makes expectations tractable to compute and manipulate even when the underlying variables interact in complicated ways, and it is the quiet workhorse behind countless derivations, including the bias-variance decomposition and the analysis of estimators.

Because exact expectations require integrating over the whole distribution, which is usually impossible, much of modern machine learning is really the art of estimating them. Monte Carlo methods approximate an expectation by averaging over samples. Stochastic gradient descent works precisely because a mini-batch gradient is an unbiased estimate of the expected gradient over the full data, so noisy steps still head the right way on average. Variational inference and the reparameterization trick exist to make expectations differentiable so they can be optimized. Wherever a model learns from data, it is, underneath, estimating and optimizing expectations.
