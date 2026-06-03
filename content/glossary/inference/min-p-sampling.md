---
title: Min-P Sampling
slug: min-p-sampling
kind: technique
category: Inference and Sampling
aliases: min-p, min p sampling
related: top-p, top-k, temperature, greedy-decoding
summary: A sampling method that keeps only tokens whose probability is at least a set fraction of the most likely token's probability, so the cutoff adapts to the model's confidence: focused when it is sure, diverse when it is not.
---

Min-p sampling chooses which tokens are eligible to sample by a threshold that scales with the model's own confidence. It sets the cutoff at a fraction of the top token's probability: with a min-p of 0.1, any token at least one tenth as likely as the most probable one stays in the running, and the rest are discarded before sampling. The key is that the bar moves with the distribution rather than being fixed in advance.

This is what distinguishes it from the common alternatives. Top-k keeps a fixed number of tokens and top-p keeps a fixed amount of cumulative probability mass, both regardless of the distribution's shape. That can misbehave at the extremes: when the model is very confident, a fixed top-p can still admit a long tail of bad tokens, and when the model is genuinely uncertain, a fixed top-k can cut off good options. Min-p instead reads the shape. When one token dominates, almost nothing else clears the relative bar, so generation stays focused and coherent. When the distribution is flat, many tokens clear it, so generation stays diverse.

The practical upshot is that min-p holds up well at higher temperatures, where top-p and top-k tend to let in incoherent tokens. It lets a user crank creativity through temperature while the relative floor still filters out the genuinely unlikely choices, giving variety without the usual descent into nonsense.

It is one sampler among several and is often combined with temperature, and the right setting is task-dependent, but it has become a popular default for open-ended generation precisely because its cutoff is adaptive rather than absolute.
