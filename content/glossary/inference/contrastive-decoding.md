---
title: Contrastive Decoding
slug: contrastive-decoding
kind: technique
category: Inference and Sampling
aliases: contrastive decoding, DoLa
related: greedy-decoding, beam-search, hallucination, logits
summary: A decoding method that scores candidate tokens by the difference between a strong model's and a weaker model's log-probabilities, suppressing the generic continuations both agree on and favoring what the strong model uniquely prefers, which improves coherence and factuality.
---

Contrastive decoding picks tokens by contrast rather than by raw probability. Instead of choosing the token a single model finds most likely, it scores each candidate by the gap between a strong model's log-probability and a weaker model's, and prefers the tokens the strong model favors much more than the weak one does. The motivating insight is that many failure modes of language generation, repetition, blandness, and common factual slips, are things even a weak model assigns high probability to. Subtracting the weak model's preferences cancels out that generic baseline and leaves the signal that is distinctive to the stronger model.

In its original form the weak model is a much smaller "amateur" and the strong model is the "expert." A prominent variant, DoLa, dispenses with a second model entirely and contrasts the final layer of a single model against one of its earlier layers, on the observation that factual knowledge sharpens in the later layers; the contrast surfaces that maturation and has been shown to reduce hallucination.

The benefits are concrete: less degenerate repetition, more coherent long-form text, and improved factuality, without retraining, since it only changes how tokens are scored at inference. It is a decoding-time intervention, compatible with the usual generation loop.

The cost is extra computation, a second forward pass through the amateur model or the bookkeeping to compare layers, and some sensitivity to how the amateur is chosen, since an amateur that is too capable cancels useful signal and one that is too weak contributes little. It is one of several decoding strategies, alongside greedy and beam search, that trade a bit of compute for higher-quality output.
