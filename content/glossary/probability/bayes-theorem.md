---
title: Bayes' Theorem
slug: bayes-theorem
kind: technique
category: Probability and Information Theory
aliases: Bayes rule, Bayes' rule, Bayes law
related: conditional-probability, bayesian-inference, probability-distribution, maximum-likelihood-estimation, mutual-information
summary: A rule for inverting conditional probabilities, computing the probability of a hypothesis given evidence from the probability of the evidence given the hypothesis, the prior on the hypothesis, and the overall probability of the evidence.
---

Bayes' theorem is the formula that lets you reason backward from observations to their causes. It states that the posterior probability of a hypothesis H given evidence E equals the likelihood of the evidence under that hypothesis, times the prior probability of the hypothesis, divided by the total probability of the evidence: P(H given E) = P(E given H) times P(H), divided by P(E). The theorem follows in one line from the definition of conditional-probability, but its consequences run deep, because it is the mechanism by which beliefs update in the face of data.

The intuition is that the theorem rebalances two competing forces. The likelihood P(E given H) says how well the hypothesis explains what you saw. The prior P(H) says how plausible the hypothesis was before you saw anything. A hypothesis that explains the evidence beautifully but was wildly implausible to begin with may still end up unlikely, and a modest explanation of strong, rare evidence may still win. The denominator P(E), often called the marginal likelihood or evidence, is the probability of the data averaged over all hypotheses, and it serves to normalize the result so the posterior is a proper probability-distribution.

The theorem matters because it is the engine of bayesian inference, the framework in which a model maintains a distribution over unknowns and revises it as observations accumulate. It explains the base-rate fallacy: a highly accurate medical test for a rare disease still yields mostly false positives, because the small prior on actually having the disease dominates the strong likelihood of a positive test. Ignoring the prior is one of the most common errors in everyday probabilistic reasoning, and Bayes' theorem is the corrective.

In machine learning the rule appears throughout. Naive Bayes classifiers apply it directly, assuming features are conditionally independent given the class to make the likelihood tractable. Bayesian model comparison uses the marginal likelihood to weigh competing models. When the prior is flat, choosing the hypothesis that maximizes the posterior reduces exactly to maximum-likelihood-estimation, which is why the maximum-likelihood objective can be read as a Bayesian procedure with no prior opinion.

Conceptually, Bayes' theorem unifies learning and inference under a single operation: condition on what you know to get a better distribution over what you do not. Diffusion models, variational autoencoders, and probabilistic graphical models all rest on this inversion, often approximating the intractable posterior because the exact denominator is too expensive to compute. Whenever a system updates a belief from evidence in a principled way, Bayes' theorem is the rule it is, exactly or approximately, obeying.
