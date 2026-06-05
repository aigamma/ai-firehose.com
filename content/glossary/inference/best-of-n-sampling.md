---
title: Best-of-N Sampling
slug: best-of-n-sampling
kind: technique
category: Inference and Sampling
aliases: best-of-n, BoN, rejection ranking
related: self-consistency, reasoning-model, verifier, reward-model, test-time-compute
summary: An inference strategy that generates N candidate responses and selects the best by a scorer, a reward model, a verifier, or a heuristic, spending parallel compute to lift quality. Unlike self-consistency's majority vote, an external scorer lets it handle open-ended outputs that cannot be tallied, and its ceiling is set by how good and how gameable that scorer is.
---

Best-of-N sampling buys quality with parallel compute. Instead of generating one response and hoping it is good, the model produces N candidates at nonzero temperature and a scorer picks the best one; because generation is stochastic, the best of several attempts is reliably better than a single shot, so when a good scorer is available this is one of the simplest ways to raise output quality at inference time.

It is a clear instance of test-time compute: accuracy rises with N, the number of samples, up to a point of diminishing returns, trading inference cost for performance without touching the model's weights. The scorer can be a learned reward model, a verifier such as a test suite or a math grader, or a domain heuristic, and the leverage comes from the generation-verification gap: it is often much easier to recognize a good answer than to produce one, so a modest scorer applied to many samples beats the base model alone.

It is closely related to self-consistency, with a key difference that is the keeper: self-consistency takes a majority vote over the candidates' final answers, while best-of-N uses an external scorer to choose, which lets it handle open-ended outputs that cannot simply be tallied. The vote needs a crisp comparable answer; the scorer needs only to rank.

Its limits are the scorer and the cost. Quality is capped by how good and how gameable the scorer is, since optimizing hard against a flawed reward model invites reward hacking, where high-scoring outputs are not actually better, and cost scales linearly with N, so the method is worthwhile mainly where a reliable, cheap scorer exists and correctness is worth the extra samples.
