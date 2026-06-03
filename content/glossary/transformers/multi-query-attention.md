---
title: Multi-Query Attention
slug: multi-query-attention
kind: technique
category: Transformers and LLMs
aliases: MQA, multi query attention
related: grouped-query-attention, multi-head-attention, kv-cache, self-attention, flash-attention
summary: An attention variant in which all query heads share a single key and value head, shrinking the KV cache to its minimum for fast inference, at a cost to quality that grouped-query attention later softened.
---

Multi-query attention is the aggressive end of a design spectrum for attention at inference time. Standard multi-head attention gives every head its own query, key, and value projection. Multi-query attention keeps a distinct query projection per head but collapses the key and value projections down to a single shared pair that all the query heads read from. It is the limiting case that grouped-query attention generalizes: one shared key-value group instead of several.

The motivation is the same bottleneck that drives most inference optimization. During generation the model caches the keys and values of every past token, and reading that kv-cache back on each decoding step is bound by memory bandwidth, not arithmetic. Multi-query attention cuts the cache to the bone, storing one key-value head instead of dozens, which makes decoding markedly faster and frees memory for longer context and larger batches.

The catch is that sharing a single key-value head across all queries throws away representational capacity. In practice it tended to lower quality and could make training less stable than full multi-head attention. That gap is exactly why grouped-query attention appeared: by keeping a handful of key-value groups rather than one, it recovers most of the quality while preserving most of the speedup, and it has largely superseded pure multi-query attention in new models.

Understanding multi-query attention is still worthwhile, because it names the extreme that the modern compromise is measured against, and the same reasoning, fewer key-value heads to lighten the cache, recurs throughout efficient-inference design.
