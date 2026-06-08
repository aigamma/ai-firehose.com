---
title: Top-p
slug: top-p
kind: technique
category: Inference and Sampling
aliases: nucleus sampling
related: top-k, temperature, greedy-decoding, logits, repetition-penalty
summary: A sampling method that restricts the next-token choice to the smallest set of tokens whose probabilities sum to a threshold p, then samples from that set, so the candidate pool grows and shrinks with the model's confidence. That adaptiveness, a fixed probability budget with a floating count, is exactly what a fixed-size method like top-k cannot do, and it is why nucleus sampling became the default for open-ended generation.
---

Top-p, also called nucleus sampling, decides how many candidate tokens to consider based on the shape of the probability distribution rather than on a fixed count. After the model produces probabilities for every token, top-p sorts them from most to least likely and walks down the list, accumulating probability mass until the running total reaches the threshold p, for example 0.9; everything above that cutoff forms the nucleus, everything below is discarded, and the model samples its next token only from the nucleus.

The appeal is that the candidate pool adapts to the model's certainty. When the model is confident, a handful of tokens already account for 90 percent of the mass, so the nucleus is tiny and the output stays focused; when the model is genuinely uncertain, dozens of tokens share the mass, the nucleus widens, and sampling explores more freely. This adaptiveness is exactly what a fixed-size method cannot do, and it is why top-p became the default sampler for open-ended generation.

The contrast with top-k is the clearest way to understand it. Top-k always keeps the same number of candidates regardless of context, which can be too few when the model is unsure and too many when it is certain; top-p instead fixes the probability budget and lets the count float. The two are not mutually exclusive: many inference stacks apply top-k and top-p together, taking the intersection, so a hard ceiling on candidates coexists with a probability-based cutoff.

Top-p and temperature are complementary and usually combined. Temperature reshapes the whole distribution before truncation, sharpening or flattening it, while top-p draws the boundary of which reshaped tokens survive, and a common recipe pairs a moderate temperature with a top-p around 0.9 to 0.95, enough variety to feel natural without letting the incoherent tail leak in. Setting p to 1.0 disables the truncation entirely, leaving only temperature and any repetition-penalty to govern the sampling.
