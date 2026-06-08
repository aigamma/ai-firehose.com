---
title: Hypothesis Testing
slug: hypothesis-testing
kind: technique
category: Probability and Information Theory
aliases: hypothesis testing, statistical significance, significance testing
related: bayes-theorem, expectation, variance, maximum-likelihood-estimation, gaussian-distribution
summary: A formal procedure for deciding whether an observed effect is real or could plausibly be chance: assume a null hypothesis of no effect, compute how surprising the data would be under it, and reject the null only if that surprise crosses a threshold. It is how a field decides whether a new model, drug, or change actually did something.
---

You ran an experiment, the new model scored higher, the conversion rate ticked up. Is the effect real, or could random noise alone have produced it? Hypothesis testing is the standard procedure for answering that without fooling yourself. It starts by assuming the boring explanation, the null hypothesis that there is no real effect, and then asks how surprising the observed data would be if that null were true. Only if the data is sufficiently improbable under the null do you reject it and conclude something real happened.

The machinery is built around the p-value: the probability, assuming the null is true, of seeing data at least as extreme as what you observed. A small p-value means the data is hard to explain by chance alone, and by convention crossing a threshold (often 0.05) is called statistically significant. The framework carefully distinguishes two ways to be wrong: a false positive, claiming an effect that is not there, and a false negative, missing an effect that is, and the test's power is its ability to detect a real effect when one exists, which grows with sample size.

The crucial caveat is what significance does not mean, because it is the most abused concept in applied statistics. A significant result is not necessarily a large or important one, since with enough data a trivial effect clears the bar; a non-significant result is not proof of no effect, only failure to detect one; and the p-value is not the probability that the hypothesis is true, a confusion that Bayesian methods address by actually computing belief in hypotheses. Running many tests and reporting only the significant ones, p-hacking, manufactures false positives wholesale.

Hypothesis testing matters in AI because the field runs on empirical comparison: is model A really better than model B, did this change improve the metric, is the benchmark gap signal or noise. A reported improvement without a sense of its statistical reliability is half a result, which is why careful evaluation pairs effect sizes with significance, and why the discipline of not mistaking noise for progress is as important to trustworthy AI as the models themselves.
