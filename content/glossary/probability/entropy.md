---
title: Entropy
slug: entropy
kind: technique
category: Probability and Information Theory
aliases: Shannon entropy, information entropy
related: cross-entropy, kl-divergence, mutual-information, probability-distribution, softmax, expectation
summary: A measure of the average uncertainty in a random variable, equal to the expected number of bits needed to encode its outcomes. It is uncertainty made into a number you can optimize, the theoretical limit of compression, and the source of the cross-entropy and KL-divergence losses that train most modern models.
---

Entropy measures how uncertain a random variable is, or equivalently how much information you gain on average by observing its outcome. Introduced by Claude Shannon, the entropy of a discrete distribution is the negative sum over outcomes of each probability times its logarithm, which is also the expectation of the negative log probability. In base-two logarithms it is measured in bits and carries a concrete operational meaning: it is the minimum average number of bits per symbol needed to encode messages from that distribution, the theoretical limit every compression algorithm approaches but cannot beat.

The intuition is that rare events are surprising and common events are not. The surprise of an outcome is the negative log of its probability, large when the probability is small, and entropy is just the average surprise across the distribution. A fair coin has one bit of entropy, the most uncertain a binary variable can be; a biased coin that almost always lands heads has low entropy, because the outcome is nearly certain and carries little information; a distribution that puts all its mass on one outcome has zero entropy, since there is nothing left to learn from observing it. Entropy turns the vague notion of uncertainty into a precise, additive quantity.

Entropy matters in machine learning because it is the natural currency of uncertainty and the basis for the loss functions that dominate the field. Cross-entropy, the expected bits to encode samples from one distribution using a code optimized for another, is the standard training objective for classification and language modeling. KL divergence, the gap between cross-entropy and entropy, measures how far an approximating distribution is from the truth. These are not arbitrary engineering choices; they fall directly out of the information-theoretic meaning of entropy, which is why minimizing them has a clean interpretation.

The concept reaches further still. Decision trees split on the feature that most reduces entropy, the information-gain criterion. The softmax is tied to entropy through the maximum-entropy principle, that among all distributions consistent with given constraints, the least committal, most honest choice is the one with the highest entropy, which is how the Gaussian, exponential, and uniform distributions can each be derived as the most noncommittal under different constraints. Conditional entropy measures the uncertainty left in one variable once another is known, and the drop from entropy to conditional entropy is mutual information. In reinforcement learning an entropy bonus keeps a policy stochastic and exploring. Across all of it, entropy is the single idea that turns uncertainty into a measurable, optimizable quantity.
