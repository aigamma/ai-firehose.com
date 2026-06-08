---
title: Speculative Decoding
slug: speculative-decoding
kind: technique
category: Inference and Sampling
aliases: speculative sampling, assisted generation
related: greedy-decoding, beam-search, logits, flash-attention, test-time-compute
summary: An inference acceleration in which a small fast draft model proposes several tokens ahead and the large target model verifies them in one parallel pass, accepting the run that matches its own distribution. Its crucial property is that it is exact, not approximate: a rejection-sampling acceptance rule guarantees the surviving tokens are distributed identically to the target's, so it is a pure latency win with no quality trade-off.
---

Speculative decoding makes a large language model generate text faster without degrading quality. The bottleneck in autoregressive generation is that tokens are produced one at a time, and each token requires a full forward pass through the model, so latency scales with the number of tokens; speculative decoding breaks that serial chain by using a small, cheap draft model to guess several tokens ahead, then having the large target model check all of those guesses at once.

The procedure has two roles. A lightweight draft model proposes a short run of candidate tokens by generating them quickly in sequence, and the expensive target model then processes that entire proposed run in one parallel forward pass, producing its own probability for each position from its logits. The system walks through the proposals and accepts each token as long as it is consistent with the target model's distribution, stopping at the first disagreement and resampling that position from the target, so because one expensive pass can ratify multiple tokens, several tokens are emitted for the cost of a single large-model step.

What makes the technique trustworthy is that it is exact, not approximate. A carefully designed acceptance rule, rejection sampling against the target distribution, guarantees that the tokens which survive are distributed identically to what the target model would have produced on its own, so the draft model only affects speed, never the final output distribution, making speculative decoding a pure latency win rather than a quality trade-off. The speedup depends on how often the draft agrees with the target: a well-matched draft on predictable text can accept long runs, while hard or surprising passages fall back toward one token per pass.

Speculative decoding has become a standard serving optimization, often stacked with kernel-level work like flash-attention to compress latency further. Variants reduce or remove the separate draft model: some attach extra prediction heads to the target model itself, and others reuse earlier-layer outputs to draft. The shared principle is to convert the inherently serial act of generation into bursts of parallel verification, trading a little extra compute per step for many fewer serial steps overall.
