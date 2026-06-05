---
title: Typical Sampling
slug: typical-sampling
kind: technique
category: Inference and Sampling
aliases: typical decoding, locally typical sampling
related: top-p, top-k, min-p-sampling, temperature, logits, entropy
summary: A sampling method that keeps only tokens whose surprisal is close to the distribution's expected surprisal (its entropy), trimming both the over-probable and the very-improbable tail so generated text matches the information content the model expects, not just the highest-probability tokens. The premise is that natural human text conveys a fairly steady rate of information, neither the safest word nor noise.
---

Typical sampling chooses the next token by a different criterion than the popular truncation methods, drawing on information theory rather than raw probability rank. Top-k keeps a fixed number of the most probable tokens and top-p keeps the smallest set whose probabilities sum past a threshold, both working from the top of the distribution down; typical sampling instead asks which tokens carry an amount of information close to what the model expects to emit at that step, and keeps those, discarding tokens that are surprisingly likely as well as those that are surprisingly rare.

The notion of expected information is made precise with entropy. The surprisal of a token is the negative log of its probability, and the entropy of the whole next-token distribution is the average surprisal the model anticipates; locally typical sampling computes each candidate's surprisal, measures how far it sits from that expected value, and retains the set of tokens nearest to it whose combined probability reaches a chosen mass, sampling from within that set. The motivation, the keeper, is that natural human text tends to convey a fairly steady rate of information, neither dominated by the single most predictable word nor lurching into noise, so matching the model's expected surprisal should track that rhythm.

In practice typical sampling can reduce the degenerate repetition and blandness that pure high-probability decoding produces, because it deliberately declines to always pick the safest, most over-probable continuation, while still cutting the long improbable tail that creates incoherence. Like min-p sampling, it adapts to the shape of the distribution at each step rather than applying a flat rank or mass cutoff: when the model is confident the surviving set is tight, and when it is uncertain the set widens.

It is one tool among the truncation family and is usually composed with temperature, which still rescales the logits before the typical test is applied. It is less ubiquitous than top-p but is offered by several generation libraries, and it is a useful illustration that "which tokens to allow" need not be defined by probability rank alone; defining it by expected information content is an equally principled and sometimes better choice.
