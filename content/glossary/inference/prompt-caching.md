---
title: Prompt Caching
slug: prompt-caching
kind: technique
category: Inference and Sampling
aliases: prompt caching, prefix caching, context caching
related: kv-cache, context-window, continuous-batching, retrieval-augmented-generation
summary: A serving optimization that stores the model's computed key-value state for a fixed prompt prefix so later requests sharing it skip recomputing, cutting both latency and cost for long, reused system prompts and documents. Because attention is causal, only an exact prefix match is reusable, which makes one discipline decisive: put the stable content at the very front and the variable query at the end.
---

Prompt caching exploits the fact that many requests to a language model begin with the same long, unchanging text: a detailed system prompt, a set of tools and instructions, a few-shot block, or a document a user is asking repeated questions about. Processing that prefix, the prefill phase, is expensive, and doing it again on every request is pure waste when the prefix has not changed, so prompt caching computes the prefix once, stores the resulting kv-cache, and reuses it, so subsequent requests start their real work where the shared prefix ends.

Mechanically it keys the cache on the exact prefix (often by hashing the token sequence) and restores the stored key-value state instead of recomputing it, usually with a time-to-live so stale entries are evicted. Because attention is causal, only an exact prefix match is reusable: the cached state is valid up to the first token that differs, after which computation must proceed normally.

The payoff is twofold. Latency drops because the costly prefill is skipped, especially noticeable for agents and chat sessions that resend a large standing context every turn, and cost drops too, because providers that expose prompt caching typically bill cached input tokens at a steep discount compared to fresh ones. For retrieval-augmented generation and tool-using agents, where a big static instruction block or document dominates the prompt, the savings can be large.

The main discipline is prompt structure. Put the stable, reusable content at the very front and the variable content (the user's actual query) at the end, so the cacheable prefix is as long as possible, since reordering a prompt so the dynamic part leads would defeat the cache entirely.
