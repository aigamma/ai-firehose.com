---
title: Top-k
slug: top-k
kind: technique
category: Inference and Sampling
aliases: top-k sampling
related: top-p, temperature, greedy-decoding, logits, beam-search
summary: A sampling method that keeps only the k most probable next tokens, discards the rest, renormalizes, and samples, capping how far into the tail the model can reach. Its weakness is that k is a fixed count while the ideal count is not, too many when the model is sure and too few when it is torn, the precise gap top-p was designed to close.
---

Top-k sampling is the simplest way to keep a language model from picking absurd tokens while still allowing variety. At each step the model ranks every token by probability, top-k retains the k highest, throws away the rest, renormalizes the kept probabilities so they sum to one, and samples the next token from that reduced set. With k set to 40, only the 40 most likely continuations are ever in play, no matter how long the tail of unlikely tokens stretches behind them.

It matters because unrestricted sampling occasionally draws from the far tail of the distribution, where individually tiny probabilities add up to a real chance of producing a token that breaks grammar or meaning. Cutting the distribution off at a fixed rank removes that failure mode cheaply, and top-k was an early standard for neural text generation that remains common, especially as a guardrail combined with other methods.

Its weakness is that k is a fixed count and the ideal count is not. When the model is confident and one token deserves almost all the mass, keeping the next 39 invites needless randomness; when the model is legitimately torn among many continuations, capping at 40 may chop off perfectly good candidates. This is the precise gap that top-p (nucleus sampling) was designed to close, by sizing the candidate pool from probability mass instead of from a fixed rank.

In practice top-k rarely runs alone. It is layered with temperature, which reshapes the distribution before the cut, and frequently with top-p, where the stacks take whichever bound is tighter at each step, producing a head of plausible tokens that temperature then makes more or less adventurous. Setting k very high or to the full vocabulary size effectively turns top-k off, leaving the other controls to do the shaping.
