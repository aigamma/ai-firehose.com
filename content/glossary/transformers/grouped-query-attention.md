---
title: Grouped-Query Attention
slug: grouped-query-attention
kind: technique
category: Transformers and LLMs
aliases: GQA, grouped query attention
related: multi-head-attention, self-attention, kv-cache, flash-attention, context-window, large-language-model
summary: An attention variant that lets several query heads share one key and value projection instead of each head owning its own, shrinking the KV cache and the memory bandwidth that actually bottleneck inference, with little quality loss. It is the middle of the spectrum between full multi-head attention and the extreme multi-query attention, and it is now a default in modern open-weight models.
---

Grouped-query attention is a small change to multi-head attention that pays off heavily at inference time. In standard multi-head attention, every attention head has its own query, key, and value projections; grouped-query attention keeps a separate query projection per head but lets a group of query heads share one key and value projection. It sits on a spectrum between two extremes: with as many key-value heads as query heads it is ordinary multi-head attention, and with a single shared key-value head it becomes multi-query attention.

The reason this matters is the kv-cache, and the keeper is what it reveals about the bottleneck. When a large language model generates text one token at a time, it stores the keys and values of every past token so it does not recompute them, and the size of that cache, and the memory bandwidth needed to read it back on every decoding step, are the main bottleneck of autoregressive generation, not the raw arithmetic. By cutting the number of key-value heads, grouped-query attention shrinks the cache and the bandwidth proportionally, which speeds up generation and lets the model serve longer context windows and larger batches within the same memory budget.

Multi-query attention took this idea to its limit and was fast, but sharing a single key-value head across all queries noticeably hurt quality and made training less stable. Grouped-query attention recovers most of that quality by keeping a handful of groups, so each cluster of query heads still attends through its own keys and values, close enough to full multi-head attention in accuracy while capturing most of the speedup.

Because of this favorable trade, grouped-query attention has become a default in many modern open-weight models. It composes naturally with flash-attention, which optimizes how the attention computation moves through GPU memory, and with the kv-cache it is designed to slim down. It is one of the clearest examples of an architectural choice driven not by accuracy but by the economics of serving.
