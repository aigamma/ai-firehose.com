---
title: Maximum Likelihood Estimation
slug: maximum-likelihood-estimation
kind: technique
category: Probability and Information Theory
aliases: MLE, maximum likelihood, likelihood maximization
related: cross-entropy, kl-divergence, bayes-theorem, bayesian-inference, probability-distribution, expectation
summary: A method for fitting a model's parameters by choosing the values that make the observed data most probable under the model, equivalent to minimizing cross-entropy and to minimizing the KL divergence from the model to the data.
---

Maximum likelihood estimation is the most foundational principle for fitting a probabilistic model to data. Given a parametric family of distributions and a dataset, it chooses the parameter values that assign the highest probability to the data actually observed. The likelihood is the probability of the data viewed as a function of the parameters, and MLE maximizes it. Because the data points are usually assumed independent, the likelihood is a product over examples, and in practice one maximizes the log-likelihood, a sum, which is numerically stabler and turns products into tractable sums without changing where the maximum lies.

The principle matters because an enormous fraction of machine learning is maximum likelihood in disguise. Fitting a gaussian-distribution by MLE recovers the sample mean and variance. Linear regression with squared-error loss is maximum likelihood under the assumption of Gaussian noise. Logistic regression and every softmax classifier trained with cross-entropy loss are doing maximum likelihood, because minimizing the negative log-likelihood is precisely maximizing the likelihood. Training a language model to predict the next token is maximum likelihood over sequences. Recognizing this unifies a sprawl of seemingly different objectives under one idea.

The connection to information theory is exact and illuminating. Maximizing the log-likelihood is equivalent to minimizing the cross-entropy between the empirical distribution of the data and the model, and since the entropy of the data is fixed, it is also equivalent to minimizing the kl-divergence from the model to the data. So maximum likelihood is not just a sensible heuristic; it is the procedure that drives the model distribution as close as possible to the data distribution in the precise sense measured by KL divergence. This is why cross-entropy loss and maximum likelihood are two names for the same training principle.

Maximum likelihood estimators have attractive theoretical properties that justify their ubiquity. Under broad conditions they are consistent, converging to the true parameters as data grows, and asymptotically efficient, achieving the lowest possible variance any unbiased estimator can reach, the Cramer-Rao bound. They are also invariant to reparameterization. These guarantees explain why MLE is the default starting point and the benchmark against which other estimators are compared.

Maximum likelihood does have failure modes, and understanding them motivates its Bayesian generalization. With little data it can overfit, fitting noise and producing degenerate estimates, such as an infinite likelihood when a Gaussian collapses onto a single point. The remedy is to add a prior over the parameters and maximize the posterior instead, which by bayes-theorem multiplies the likelihood by the prior; this is maximum a posteriori estimation, and it reduces to plain maximum likelihood when the prior is flat. Full bayesian inference goes further, averaging over all parameter values rather than committing to a single best one, with maximum likelihood recovered as the point estimate at the peak.
