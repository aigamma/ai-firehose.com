---
title: Variance
slug: variance
kind: technique
category: Probability and Information Theory
aliases: variance, standard deviation, spread
related: expectation, probability-distribution, gaussian-distribution, maximum-likelihood-estimation, bayesian-inference
summary: A measure of how far a random variable's values spread from their mean, the expected squared deviation. Spread is as important as center: a model with the right average prediction but huge variance is useless, and the fact that averaging n independent estimates divides variance by n is why large samples give stable answers and why minibatching works.
---

Variance measures the spread of a distribution: how far, on average, its outcomes fall from their mean. It is defined as the expectation of the squared deviation from the expectation, which can be rewritten as the mean of the squares minus the square of the mean. Squaring the deviations makes every contribution positive and penalizes large excursions more than small ones. The standard deviation, its square root, brings the measure back into the original units of the variable and is usually the more interpretable of the two. The center of a distribution is only half the story; the variance is the other half.

Variance matters because the spread of a quantity is frequently as important as its center. A model whose predictions have the right mean but enormous variance is unreliable. The famous bias-variance tradeoff frames generalization error as a bias term, how far the average prediction is from the truth, plus a variance term, how much the prediction fluctuates across different training sets. Overfitting is the high-variance regime, where the model chases noise and swings wildly when the data changes. Regularization, ensembling, and more data are all, in part, variance-reduction strategies.

The single most consequential mechanical fact about variance is how it behaves under averaging. For independent variables, variances add, so the variance of a sum is the sum of the variances, and the variance of an average of n independent estimates is the individual variance divided by n. This is why large samples give stable estimates, why averaging many noisy measurements sharpens them, and why mini-batching in stochastic gradient descent reduces the noise in the gradient. When variables are correlated the covariance terms enter, and the full picture is captured by a covariance matrix whose diagonal holds the individual variances.

Variance is a defining parameter of many named distributions. The Gaussian distribution is specified entirely by its mean and its variance, so estimating those two numbers fully determines the model. Under maximum-likelihood estimation, fitting a Gaussian recovers the sample mean and the sample variance, which is one reason least-squares regression and Gaussian noise assumptions are so tightly linked: minimizing squared error is maximum likelihood under constant-variance Gaussian noise. Heteroscedastic models let the variance itself depend on the input, predicting not just a value but its uncertainty, and Bayesian methods report posterior variance as a direct measure of confidence. Wherever uncertainty, stability, or confidence is at stake, variance is the quantity being measured or managed.
