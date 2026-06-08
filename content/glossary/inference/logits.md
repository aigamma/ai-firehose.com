---
title: Logits
slug: logits
kind: technique
category: Inference and Sampling
aliases: logit
related: temperature, top-p, top-k, greedy-decoding, repetition-penalty
summary: The raw, unnormalized scores a model emits for every token at each step, before a softmax converts them into a probability distribution. They are the single surface every decoding and sampling control acts on, temperature divides them, truncation reads the probabilities they produce, a penalty subtracts from them, so understanding sampling means seeing it as a sequence of edits to this one vector before it is normalized.
---

Logits are the numbers a language model actually produces. At each generation step the final layer of the network outputs one real-valued score per token in the vocabulary, a vector that can be tens or hundreds of thousands of entries long. These scores are unnormalized and unbounded: they can be positive or negative and carry no direct interpretation as probabilities; a higher logit means the model favors that token more, but turning the vector into usable probabilities requires one more step.

That step is the softmax, which exponentiates every logit and divides by the sum so the results are all positive and sum to one. The exponential is why differences in logits matter more than their absolute values: a token whose logit is a few units above the rest captures most of the probability mass once exponentiated. Logits are also why the term exists, the name coming from the log-odds interpretation the softmax inverts, mapping unbounded scores back into a proper distribution over tokens.

Logits matter because they are the surface every inference control acts on. Temperature divides the logits before the softmax, sharpening or flattening the distribution; top-k and top-p truncate based on the probabilities the logits produce; a repetition-penalty subtracts from the logits of tokens that have already appeared; greedy decoding simply takes the token with the largest logit. Understanding sampling at all means understanding that it is a sequence of edits to this one vector, applied before it is normalized and drawn from.

Logits are useful beyond steering generation. Their values expose the model's calibration and confidence, the log-probability of any chosen token is read directly from them, and they are the input to ranking and verification steps such as the acceptance test in speculative decoding or the cumulative scoring in beam search. Whenever a model needs to be inspected, compared, or constrained at the token level, the logits are the quantity being examined.
