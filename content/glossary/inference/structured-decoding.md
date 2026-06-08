---
title: Structured Decoding
slug: structured-decoding
kind: technique
category: Inference and Sampling
aliases: constrained decoding, constrained generation, grammar-constrained decoding, JSON mode
related: logits, greedy-decoding, top-p, temperature, function-calling, tool-use
summary: Constraining a model's token choices at each step so the output is guaranteed to match a formal schema or grammar, valid JSON, a regex, by masking the logits of any token that would break the structure. It makes conformance a property of construction rather than of hope, the engine behind JSON mode and robust tool calling, with the caution that constraints shape behavior, not just format.
---

Structured decoding makes a language model's output conform to a formal specification by construction rather than by hope. A model asked politely for JSON will usually comply, but usually is not good enough when the text feeds a parser or an API; structured decoding removes the gamble: at each generation step it computes which next tokens could still lead to a valid result and sets the probability of every other token to zero before sampling.

The machinery sits between the model's logits and the sampler. Given a target grammar, often expressed as a JSON schema, a regular expression, or a context-free grammar, the decoder tracks the current parser state and builds a mask of allowed tokens, then applies that mask to the logits, so a token that would open a string when a number is required, or close a brace too early, simply cannot be chosen. Sampling then proceeds normally over the permitted tokens with the usual temperature and top-p controls, and because the constraint is enforced every step, the full output is guaranteed to parse.

The benefits are reliability and often speed. Reliability comes from never emitting malformed structure, which removes whole classes of retry-and-repair logic from applications; speed can improve because the grammar sometimes forces a span of tokens that need not be sampled at all, and because failed generations no longer have to be discarded and rerun. This is the engine behind so-called JSON mode and behind robust tool calling, where the model must produce arguments that match a function signature.

The main caution is that constraints shape behavior, not just format. Forcing a rigid schema can push the model away from its most natural phrasing and, if the schema fights the model's intent, can degrade content quality, so good practice is to constrain the structure that a downstream system truly requires and to leave the free-text fields free.
