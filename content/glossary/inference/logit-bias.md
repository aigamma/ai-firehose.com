---
title: Logit Bias
slug: logit-bias
kind: technique
category: Inference and Sampling
aliases: logit bias, token bias
related: logits, top-p, structured-decoding, repetition-penalty
summary: An inference control that adds a fixed offset to the logits of specified tokens before sampling, nudging the model toward or away from particular words or symbols with no retraining, used to ban tokens, steer vocabulary, or shape outputs. Its bluntness is its limit: the bias applies to a token in every context, and it works on tokens, not words or meanings.
---

Logit bias is a direct, lightweight way to steer generation by editing the model's scores before it samples. For chosen tokens, a fixed value is added to their logits, the raw scores that feed the softmax: a large positive bias makes a token much more likely, a large negative bias makes it effectively impossible, a ban. Because it operates on the scores at sampling time, it needs no retraining and no change to the model, only a list of token ids and offsets.

Its uses are practical and specific: forbidding particular words or symbols, discouraging a model from emitting an end-of-sequence token too early, pushing the model toward a small set of expected answer tokens, or down-weighting tokens that tend to derail a format. It is a precision instrument for the rare cases where a few specific tokens need encouragement or suppression.

It differs from structured decoding, which enforces a whole grammar by hard-masking every token that would violate the structure at each step. Logit bias is softer and per-token: it nudges fixed tokens by a fixed amount regardless of context, rather than dynamically computing what is allowed. For guaranteeing valid JSON, structured decoding is the right tool; for banning a slur or nudging toward a label, logit bias is simpler.

The bluntness is also its limitation, the keeper. A bias applies to a token in every context, so suppressing a token to fix one situation can hurt fluency elsewhere, and biasing works at the level of tokens rather than words or meanings, so it can behave unexpectedly when a word spans several tokens. It is best reserved for targeted, well-understood adjustments rather than broad behavior change.
