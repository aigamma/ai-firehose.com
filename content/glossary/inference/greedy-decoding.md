---
title: Greedy Decoding
slug: greedy-decoding
kind: technique
category: Inference and Sampling
aliases: argmax decoding, greedy search
related: beam-search, temperature, top-p, top-k, logits
summary: A decoding strategy that always picks the single highest-probability token at each step, fast and deterministic but with no lookahead. Its defining flaw is that the best token now does not guarantee the best sequence overall, the shortsightedness that motivates beam search, and it is exactly the limit of temperature-based sampling as temperature falls to zero.
---

Greedy decoding is the most direct way to turn a language model's probabilities into text: at every step, take the token with the highest probability and move on. There is no randomness and no lookahead, and because it always selects the argmax of the distribution, the same prompt yields the same output every time, which makes greedy decoding the natural choice when reproducibility matters and the task has one right answer.

Its strength is also its limitation. Choosing the best token at each individual step does not guarantee the best sequence overall, because a slightly less likely token now can open the door to a far more likely continuation later; greedy decoding commits to the local optimum and never reconsiders, so it can walk itself into a phrasing that no longer has a good completion. This shortsightedness is the classic motivation for beam search, which hedges by carrying several candidate sequences forward at once instead of one.

Greedy decoding is the limiting case of temperature-based sampling. As temperature falls toward zero the probability distribution sharpens until effectively all the mass sits on the single top token, and sampling from that distribution is identical to taking the argmax, which is why most APIs expose greedy behavior simply as temperature 0 rather than as a separate mode, and the truncation controls top-p and top-k become irrelevant because there is only ever one candidate.

The practical trade-off is determinism and speed against diversity. Greedy output tends to be safe, repetitive, and prone to loops, since the highest-probability token can lead the model into a self-reinforcing rut that a repetition-penalty is often added to break. For extraction, classification, and code, that conservatism is a feature; for anything open-ended or creative, the lack of variation is exactly why practitioners reach for sampling methods instead.
