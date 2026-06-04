---
title: Bayes' Theorem
slug: bayes-theorem
kind: technique
category: Probability and Information Theory
aliases: Bayes rule, Bayes' rule, Bayes law
related: conditional-probability, bayesian-inference, probability-distribution, maximum-likelihood-estimation, mutual-information
summary: The rule for reasoning backward, from observed evidence to the hidden cause that produced it, by flipping a conditional probability you can estimate into the one you actually want. It is the engine of belief updating, the cure for the base-rate fallacy, and the foundation of Bayesian inference.
---

Bayes' theorem is the formula for reasoning backward, from an effect you can see to the cause you cannot. You can usually estimate how likely some evidence is if a hypothesis were true, the probability of a symptom given a disease; what you actually want is the reverse, the probability of the disease given the symptom. Bayes' theorem flips one into the other: the posterior probability of a hypothesis given evidence equals the likelihood of that evidence under the hypothesis, times the prior probability of the hypothesis, divided by the total probability of the evidence. It follows in one line from the definition of conditional probability, but its consequences run deep, because it is the mechanism by which a belief updates in the face of data.

The intuition is that the theorem balances two competing forces. The likelihood says how well the hypothesis explains what you saw; the prior says how plausible the hypothesis was before you saw anything. A hypothesis that explains the evidence beautifully but was wildly implausible to begin with can still end up unlikely, and a modest explanation of strong, rare evidence can still win. The denominator, the marginal likelihood or evidence, is the probability of the data averaged over all hypotheses, and it just normalizes the result into a proper distribution.

The theorem matters because ignoring the prior is one of the most common errors in human reasoning, and Bayes is the corrective. It explains the base-rate fallacy: a highly accurate test for a rare disease still yields mostly false positives, because the tiny prior probability of actually having the disease overwhelms the strong likelihood of a positive result. People consistently get this wrong by fixating on the test's accuracy and forgetting the base rate, and the theorem is what forces both into the calculation.

In machine learning the rule is everywhere. Naive Bayes classifiers apply it directly, assuming features are conditionally independent given the class to make the likelihood tractable. Bayesian model comparison uses the marginal likelihood to weigh competing models. And when the prior is flat, choosing the hypothesis that maximizes the posterior reduces exactly to maximum-likelihood estimation, which is why the workhorse maximum-likelihood objective can be read as a Bayesian procedure that simply holds no prior opinion. Whenever a system updates a belief from evidence in a principled way, exactly or approximately, Bayes' theorem is the rule it is obeying.
