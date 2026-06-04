---
title: Cross-Entropy
slug: cross-entropy
kind: technique
category: Probability and Information Theory
aliases: cross entropy, cross-entropy loss, log loss, negative log likelihood
related: entropy, kl-divergence, softmax, maximum-likelihood-estimation, probability-distribution, mutual-information
summary: A measure of the average bits to encode outcomes from one distribution using a code built for another, and the standard loss for training classifiers and language models. It is entropy plus a penalty for being wrong, identical to maximum likelihood, and paired with softmax its gradient is just predicted-minus-true.
---

Cross-entropy measures the cost of being wrong about a distribution. If the true distribution over outcomes is p but you encode events with a code designed for a different distribution q, the average number of bits you spend is the cross-entropy, the negative sum of p times log q. It is always at least the entropy of p, the cost of the optimal code, and the gap between them is exactly the KL divergence from q to p. So cross-entropy is entropy plus penalty: the irreducible uncertainty of p, plus the waste from using the wrong model q.

This quantity is the workhorse loss of supervised learning. In classification the true distribution p is a one-hot vector placing all its mass on the correct label, and the model's predicted distribution q comes from a softmax over the network's outputs. Minimizing cross-entropy then reduces to maximizing the log probability the model assigns to the correct class, which is why the cross-entropy loss is also called the negative log-likelihood. Training a language model to predict the next token is the same loss applied at every position in a sequence, which makes it, in sheer volume of computation, perhaps the most-minimized objective in the world.

Cross-entropy matters because it is both principled and well-behaved for optimization. Minimizing it is identical to maximum-likelihood estimation, the most foundational principle of statistical fitting, so the loss is not an arbitrary engineering choice but the information-theoretic expression of fitting a model to data. Practically, paired with the softmax, its gradient takes the strikingly simple form of the predicted probabilities minus the true labels, which is numerically stable and avoids the vanishing gradients that plague squared-error loss on saturated outputs. That clean gradient is much of why this particular loss won.

The connection to KL divergence clarifies what optimization is doing. Because the entropy of the fixed true distribution does not depend on the model, minimizing cross-entropy is exactly minimizing the KL divergence between the truth and the model: training pushes the predicted distribution toward the true one. When the labels are hard one-hot targets the entropy term vanishes entirely, and cross-entropy and KL divergence coincide, which is why the two are often used loosely as interchangeable in the classification setting. In practice cross-entropy underlies far more than basic classification: label smoothing, knowledge distillation, reinforcement learning from human feedback, and contrastive objectives all reduce to cross-entropy terms.
