---
title: Chain of Thought
slug: chain-of-thought
kind: technique
category: Inference and Sampling
aliases: CoT, chain-of-thought prompting
related: test-time-compute, temperature, greedy-decoding, logits
summary: Inducing a model to produce intermediate reasoning steps before its final answer, which improves accuracy on multi-step problems. The reason it works is mechanical: a transformer does a fixed amount of computation per token, so each intermediate token is another step of computation, an external scratchpad that decomposes a hard problem into easier ones, though the written steps are not guaranteed to be a faithful account of the real computation.
---

Chain of thought is the practice of having a model write out its reasoning step by step instead of jumping straight to an answer. For a multi-step problem, arithmetic, logic, a question that requires combining several facts, asking the model to show intermediate steps produces markedly more accurate final answers than demanding the answer alone, and the reasoning trace can be elicited with an instruction as simple as asking the model to think step by step, or by giving examples that themselves contain worked-out reasoning.

It matters because of the keeper, a mechanical fact: a transformer does a fixed amount of computation per token, so forcing all the work into a single answer token caps how much reasoning the model can do. Generating a chain of thought relaxes that limit: each intermediate token is another step of computation, and earlier steps become context the later steps can attend to and build on, so the model effectively uses its own output as a scratchpad, decomposing a hard problem into a sequence of easier ones it can solve in order.

This makes chain of thought the most direct instance of test-time compute: it improves answers purely by spending more tokens at inference, with no change to the model's weights. Longer, more careful reasoning costs more latency and more output but buys accuracy on exactly the problems where a one-shot answer is unreliable, and it tends to favor lower-randomness decoding for the reasoning itself, since a stray high-temperature token early in a derivation can derail every step that depends on it.

Chain of thought reshaped both how models are prompted and how they are built. As a prompting method it is a near-free upgrade for reasoning tasks; as a training target it gave rise to reasoning models tuned to generate long internal deliberations by default, sometimes hidden from the user, before emitting a concise answer. The reasoning trace also offers a partial window into how a model reached its conclusion, useful for debugging and verification, though the written steps are not guaranteed to be a faithful account of the computation that actually produced the answer.
