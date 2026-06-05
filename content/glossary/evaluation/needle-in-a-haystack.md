---
title: Needle in a Haystack
slug: needle-in-a-haystack
kind: technique
category: Evaluation and Benchmarks
aliases: needle in a haystack, NIAH, long-context retrieval test
related: context-window, kv-cache, perplexity, mmlu
summary: A long-context stress test that hides a specific fact (the needle) at a chosen depth inside a long filler document (the haystack) and asks the model to retrieve it, mapping how reliably a model actually uses information across its full context window. What it reveals is that claimed and effective context lengths diverge, the "lost in the middle" pattern where a model retrieves a fact near the ends but falters when it is buried in the middle.
---

The needle-in-a-haystack test probes a simple but crucial question: when a model advertises a long context window, can it really use all of it. The setup is to take a long body of filler text, the haystack, insert one specific unrelated fact at a particular position, the needle, and then ask the model a question whose answer is that fact. By sweeping the needle across many depths and the haystack across many lengths, the test produces a grid of recall accuracy as a function of where the fact sits and how long the context is.

What it reveals is that claimed and effective context lengths often diverge, the keeper. Many models retrieve a fact placed near the very start or very end of a long context but falter when it is buried in the middle, the pattern nicknamed "lost in the middle." A model rated for a very large window may in practice attend reliably only to a fraction of it, and the test makes that degradation visible rather than assumed.

This matters because long-context claims are easy to state and hard to verify, and applications like retrieval-augmented generation and document analysis depend on the model genuinely using the material it is given, not just tolerating its presence. The test is a cheap, interpretable way to validate a window before relying on it.

Its limitation is that single-fact retrieval is the easy case. Finding one planted sentence is far simpler than reasoning over, aggregating, or cross-referencing many facts spread through a long context, so passing the basic test does not certify true long-context reasoning. Harder variants plant multiple needles or require combining them, and those expose weaknesses the single-needle version misses.
