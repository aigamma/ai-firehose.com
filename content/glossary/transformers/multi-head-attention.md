---
title: Multi-Head Attention
slug: multi-head-attention
kind: technique
category: Transformers and LLMs
aliases: multi-head self-attention, MHA, attention heads
related: self-attention, transformer, positional-encoding, kv-cache, large-language-model
summary: A transformer component that runs several attention computations in parallel, each in its own learned subspace, so different heads can capture different kinds of relationships before their outputs are combined.
---

Multi-head attention is the form of self-attention that transformers actually use. Rather than computing a single attention pattern over the sequence, the model runs several attention operations side by side, each called a head, and concatenates their results. The motivation is simple: one weighted average over the sequence can only express one notion of relevance at a time, but language has many relationships running at once, so several heads let the model attend to several things in parallel.

Mechanically, the model takes the input vectors and projects them down into a lower-dimensional space separately for each head, producing a distinct set of query, key, and value vectors per head. Each head then performs ordinary scaled dot-product attention within its own subspace, yielding its own output. Those per-head outputs are concatenated back together and passed through a final linear projection that mixes them into the layer's result. Crucially, the per-head dimension is the full model dimension divided by the number of heads, so multi-head attention costs about the same as a single full-width attention while buying far more expressiveness.

The value of splitting into heads is specialization. When researchers inspect a trained model, different heads often appear to track different things: some follow syntactic dependencies like the link between a verb and its subject, some resolve which earlier noun a pronoun refers to, and some track long-range topic or positional patterns. No head is told what to learn; the division of labor emerges from training. This redundancy also makes the model robust, since many heads can carry overlapping signal and pruning a few rarely breaks it.

Multi-head attention connects directly to the rest of the transformer. It consumes the order information injected by positional encoding, since the bare attention operation is permutation invariant. It is the dominant consumer of the kv-cache during generation, because the keys and values of every head for every past token must be stored to avoid recomputation. And its quadratic cost in sequence length is the main reason the context window is bounded, which is why variants such as multi-query and grouped-query attention share keys and values across heads to shrink that memory footprint in large language models.
