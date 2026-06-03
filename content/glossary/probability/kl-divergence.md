---
title: KL Divergence
slug: kl-divergence
kind: technique
category: Probability and Information Theory
aliases: Kullback-Leibler divergence, relative entropy, KL distance
related: entropy, cross-entropy, mutual-information, bayesian-inference, probability-distribution, softmax
summary: A measure of how much one probability distribution differs from another, equal to the expected extra bits incurred by encoding data from the true distribution using a model distribution, always non-negative and zero only when the two distributions match.
---

The Kullback-Leibler divergence measures the dissimilarity between two probability distributions. The KL divergence from an approximating distribution q to a true distribution p is the expectation under p of the log ratio p over q: the sum of p times log of p divided by q. Read another way, it is the cross-entropy of p relative to q minus the entropy of p, which is why it is also called relative entropy: it is the number of extra bits you waste, beyond the optimal, by encoding samples from p with a code built for q. It is always non-negative, and it equals zero if and only if the two distributions are identical.

KL divergence is not a true distance, and the asymmetry is the most important thing to understand about it. The divergence from q to p is generally not equal to the divergence from p to q, and the two directions reward different behaviors. The forward direction, used in maximum likelihood, is mean-seeking: it heavily penalizes q for assigning low probability anywhere p has mass, so q tends to spread out and cover the whole truth. The reverse direction, common in variational inference, is mode-seeking: it penalizes q for putting mass where p has none, so q tends to lock onto a single mode and ignore the rest. Choosing a direction is choosing what kind of approximation error you are willing to tolerate.

The quantity matters because it is the canonical way to compare distributions throughout machine learning. Because the entropy of the fixed true distribution is constant with respect to the model, minimizing cross-entropy loss is exactly minimizing the KL divergence between the data and the model, which ties classification and language-model training directly to this measure. Variational autoencoders include an explicit KL term that pulls the learned latent distribution toward a prior. Reinforcement learning algorithms like PPO use a KL penalty to keep an updated policy from straying too far from the previous one in a single step.

KL divergence is also the foundation of bayesian inference in its approximate forms. Variational methods replace an intractable posterior with a simpler distribution and fit it by minimizing the KL divergence between the two, turning inference into optimization. The evidence lower bound that these methods maximize is derived directly from a KL term. Information geometry treats the KL divergence as the fundamental way the space of distributions curves, and its local quadratic approximation is the Fisher information metric.

Several familiar quantities are special cases or close relatives. Mutual-information is the KL divergence between a joint distribution and the product of its marginals, measuring how far two variables are from independent. The divergence underlies model selection, distribution-shift detection, and the regularizers that keep fine-tuned models close to their base. Whenever a system needs to say how different one distribution is from another, KL divergence is usually the measure it reaches for, with its asymmetry chosen deliberately to fit the task.
