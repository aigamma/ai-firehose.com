---
title: Sparse Attention
slug: sparse-attention
kind: technique
category: Transformers and LLMs
aliases: sparse attention, sparse transformer
related: self-attention, sliding-window-attention, long-context, flash-attention, grouped-query-attention, transformer
summary: Attention computed over a chosen subset of token pairs instead of all of them, trading the transformer's full all-pairs interaction for a pattern that scales far better with sequence length. It rests on the observation that most of the attention in a trained model is local or structured, so the full quadratic computation is largely wasted.
---

Full self-attention compares every token with every other, so its cost grows with the square of the sequence length, which is the wall that makes very long contexts expensive. Sparse attention attacks that wall directly: instead of all pairs, compute attention over only a chosen subset of them, picked so the model keeps most of what full attention bought while paying a fraction of the cost.

The design is which pairs to keep. Fixed patterns connect each token to a local window plus a few global anchor tokens, capturing nearby detail and a shared summary while dropping the long-range middle. Strided and block patterns let information hop across the sequence in a few steps rather than one. Learned or dynamic patterns let the model choose at runtime which tokens attend to which, more flexible but harder to make fast on real hardware. Each is a bet about which connections actually carry signal.

The fact that licenses the whole approach is empirical: in a trained transformer most attention weight concentrates locally and on a handful of special tokens, so the dense all-pairs matrix is mostly near-zero. Sparse attention simply declines to compute the parts that were going to be negligible anyway, which is why a good pattern can approach dense quality at a fraction of the cost rather than degrading smoothly with how much it drops.

Sparse attention sits in the same family as the other efficiency moves: sliding-window attention is one fixed case of it, flash attention makes the dense computation cheaper without changing the math, and grouped-query attention shrinks a different bottleneck. The honest limit is that fixed sparsity can miss exactly the rare long-range dependency that mattered, and proving a pattern preserves quality is harder than proposing it, which is why dense attention with a fast kernel often wins until sequences grow long enough that quadratic cost is simply unaffordable.
