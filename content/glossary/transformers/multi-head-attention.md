---
title: Multi-Head Attention
slug: multi-head-attention
kind: technique
category: Transformers and LLMs
aliases: multi-head self-attention, MHA, attention heads
related: self-attention, transformer, positional-encoding, kv-cache, large-language-model
summary: The form of self-attention transformers actually use: run several attention operations in parallel, each in its own learned subspace, then combine them, so the model can attend to several kinds of relationship at once. Because the per-head width is the model width divided by the number of heads, it costs about the same as one full-width attention while buying far more expressiveness, and the division of labor among heads emerges from training.
---

Multi-head attention is the form of self-attention that transformers actually use. Rather than computing a single attention pattern over the sequence, the model runs several attention operations side by side, each called a head, and concatenates their results. The motivation is simple: one weighted average over the sequence can only express one notion of relevance at a time, but language has many relationships running at once, so several heads let the model attend to several things in parallel.

Mechanically, the model projects the input vectors down into a lower-dimensional space separately for each head, producing a distinct set of query, key, and value vectors per head; each head then performs ordinary scaled dot-product attention within its own subspace, yielding its own output, and those per-head outputs are concatenated back together and passed through a final linear projection that mixes them into the layer's result. Crucially, the per-head dimension is the full model dimension divided by the number of heads, so multi-head attention costs about the same as a single full-width attention while buying far more expressiveness, a near-free upgrade.

The value of splitting into heads is specialization, and that it emerges unbidden is the striking part. When researchers inspect a trained model, different heads often appear to track different things: some follow syntactic dependencies like the link between a verb and its subject, some resolve which earlier noun a pronoun refers to, some track long-range topic or positional patterns. No head is told what to learn; the division of labor emerges from training alone. This redundancy also makes the model robust, since many heads carry overlapping signal and pruning a few rarely breaks it.

Multi-head attention connects directly to the rest of the transformer. It consumes the order information injected by positional encoding, since the bare attention operation is permutation invariant; it is the dominant consumer of the kv-cache during generation, because the keys and values of every head for every past token must be stored to avoid recomputation; and its quadratic cost in sequence length is the main reason the context window is bounded, which is why variants like multi-query and grouped-query attention share keys and values across heads to shrink that memory footprint.
