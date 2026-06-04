---
title: Central Limit Theorem
slug: central-limit-theorem
kind: technique
category: Probability and Information Theory
aliases: CLT
related: gaussian-distribution, variance, expectation, probability-distribution, linear-regression
summary: The result that the sum or average of many independent random variables tends toward a Gaussian distribution regardless of the original distribution, explaining why the normal distribution appears so pervasively in statistics and machine learning.
---

The central limit theorem is one of the most consequential results in all of probability. It says that if you add up many independent random variables, each with finite variance, the distribution of their sum, suitably centered and scaled, converges to a [Gaussian distribution](gaussian-distribution), no matter what the individual variables looked like. The components can be skewed, discrete, or wildly non-Gaussian; their normalized average still tends toward the same smooth bell curve. This is why the normal distribution is not just one option among many but the default shape that emerges whenever many small independent effects accumulate.

The precise statement concerns the standardized sum: subtract the mean and divide by the standard deviation, which itself shrinks like one over the square root of the number of terms. As the count grows, the cumulative distribution of this standardized quantity approaches that of a standard normal. Two things are worth separating. The law of large numbers says the sample average converges to the true mean; the central limit theorem says more, describing the precise shape and rate of the residual fluctuations around that mean, fluctuations that shrink at a rate proportional to one over the square root of the sample size. That square-root rate is the reason error bars narrow slowly and why quadrupling your data only halves your uncertainty.

The theorem matters because it underwrites a vast amount of statistical practice and machine learning intuition. Confidence intervals, hypothesis tests, and the standard error of an estimate all rest on the approximate normality the central limit theorem guarantees for large samples. The assumption of Gaussian noise in [linear regression](linear-regression) and many probabilistic models is often justified by appeal to it: measurement error is a sum of many small independent perturbations, so it should be roughly normal. Monte Carlo estimates inherit Gaussian error bars from the same source, which is how one quantifies the precision of a simulated [expectation](expectation).

It is equally important to know where the theorem does not apply, because its failures explain real phenomena. The classical version requires finite [variance](variance); distributions with heavy tails, such as those governing financial crashes or some natural language statistics, can violate it and produce sums that remain heavy-tailed and converge instead to other stable laws. Strong dependence between the variables also breaks the result. Understanding these boundaries is what separates a naive assumption of normality from a justified one, and it is why a careful practitioner checks tail behavior and independence before leaning on the central limit theorem.
