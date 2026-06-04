---
title: Jensen's Inequality
slug: jensens-inequality
kind: technique
category: Calculus and Analysis
aliases: Jensen inequality
related: convexity, expectation, kl-divergence, evidence-lower-bound, variance
summary: The statement that for a convex function, the function of an average is at most the average of the function. It is the chord-above-curve picture generalized from two points to any distribution, and despite its simplicity it is the lever behind the evidence lower bound, the non-negativity of KL divergence, and much of probabilistic machine learning.
---

Jensen's inequality is a statement about how a convex function interacts with averaging. For a convex function, the function evaluated at the mean of some inputs is less than or equal to the mean of the function evaluated at those inputs; phrased with probability, the function of an expectation is at most the expectation of the function. For a concave function the inequality simply flips. The intuition is a single picture: a convex function curves upward, so the chord connecting two points on its graph lies above the curve, and averaging the endpoints' heights overshoots the height at the averaged input. Jensen's inequality is that chord-above-curve picture generalized from two points to any weighted average or distribution.

Despite its plainness, Jensen's inequality is one of the most useful tools in probabilistic machine learning, because so many quantities of interest are a convex or concave function applied to a random variable. It immediately explains why the logarithm of an average is at least the average of the logarithms, since the logarithm is concave, and why a squared mean is at most a mean of squares, which is just the non-negativity of variance read through Jensen. Whenever you need to bound an expected nonlinear quantity by a nonlinear function of the expected value, Jensen's inequality is usually the lever, turning an intractable expectation into a tractable bound.

Its most celebrated application is the derivation of the evidence lower bound. To do approximate Bayesian inference you need the logarithm of an intractable integral, the marginal likelihood; writing that integral as an expectation under an auxiliary distribution and pushing the concave logarithm inside the expectation with Jensen's inequality yields a tractable lower bound on the log evidence, the ELBO. Maximizing this bound is the basis of variational inference and the training objective of the variational autoencoder, and the gap in Jensen's inequality is exactly the KL divergence between the approximate and true posteriors. The expectation-maximization algorithm rests on the same Jensen-derived bound.

The inequality also pins down basic facts about estimators and information measures. It shows that the KL divergence is always non-negative, since it is a convex function of a density ratio averaged under the true distribution, which is the cornerstone that makes KL a valid notion of discrepancy at all. It explains why certain plug-in estimators are biased, the bias being precisely the Jensen gap between a nonlinear function of an estimate and the estimate of that function. Across all of these, Jensen's inequality is the quiet bridge from the convexity of a function to a usable bound on an average, which is why it appears in the derivation of so many algorithms.
