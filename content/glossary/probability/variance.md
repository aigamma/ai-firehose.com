---
title: Variance
slug: variance
kind: technique
category: Probability and Information Theory
aliases: variance, standard deviation, spread
related: expectation, probability-distribution, gaussian-distribution, maximum-likelihood-estimation, bayesian-inference
summary: A measure of how far a random variable's values spread from its mean, defined as the expected squared deviation from the expectation, with the standard deviation as its square root.
---

Variance quantifies the spread of a distribution: how far, on average, the outcomes of a random variable fall from their mean. It is defined as the expectation of the squared deviation from the expectation, Var(X) = E[(X minus E[X]) squared], which can be rewritten as E[X squared] minus E[X] squared. Squaring the deviations makes every contribution positive and penalizes large excursions more than small ones. The standard deviation, the square root of the variance, brings the measure back to the original units of the variable and is often the more interpretable of the two.

Variance matters because the spread of a quantity is frequently as important as its center. A model whose predictions have the right mean but enormous variance is unreliable. The famous bias-variance tradeoff frames generalization error as the sum of a bias term, how far the average prediction is from the truth, and a variance term, how much the prediction fluctuates across different training sets. Overfitting is the regime of high variance: the model chases noise in the training data and changes wildly when that data changes. Regularization, ensembling, and more data are all, in part, variance-reduction strategies.

Mechanically, variance inherits its behavior from the expectation it is built on. For independent variables, variances add: the variance of a sum equals the sum of the variances. This is why averaging n independent estimates divides the variance by n, the central reason large samples give stable estimates, and why mini-batching in stochastic gradient descent reduces the noise in the gradient. When variables are correlated, the covariance terms enter, and the full picture is captured by a covariance matrix whose diagonal holds the individual variances.

Variance is a defining parameter of many named distributions. The gaussian-distribution is specified entirely by its mean and its variance, so estimating those two numbers fully determines the model. Under maximum-likelihood-estimation, fitting a Gaussian to data recovers the sample mean and the sample variance, which is one reason least-squares regression and Gaussian noise assumptions are so tightly linked: minimizing squared error is maximum likelihood under constant-variance Gaussian noise.

The concept extends well beyond a single number. Heteroscedastic models let the variance itself depend on the input, predicting not just a value but its uncertainty. Bayesian methods report the posterior variance as a direct measure of how confident the model should be. Techniques like batch normalization explicitly control the variance of activations to stabilize training. Wherever uncertainty, stability, or confidence is at stake, variance is the quantity being measured or managed.
