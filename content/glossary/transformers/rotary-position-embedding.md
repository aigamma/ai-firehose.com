---
title: Rotary Position Embedding
slug: rotary-position-embedding
kind: technique
category: Transformers and LLMs
aliases: RoPE, rotary embeddings, rotary positional encoding
related: positional-encoding, self-attention, multi-head-attention, context-window, transformer
summary: The positional encoding in most current LLMs: rotate each query and key vector by an angle proportional to its position, so the dot product between them, and therefore the attention score, depends only on their relative distance. It uses no learned parameters and, because position enters as a rescalable rotation angle, extends to longer contexts gracefully.
---

Rotary position embedding, almost always called RoPE, is the positional encoding used in most current large language models. It addresses the same need as any positional encoding, giving a permutation-invariant transformer a sense of word order, but it does so in a way that makes the relative distance between two tokens fall out of the math directly, rather than tagging each token with an absolute slot. That relative behavior is much of why RoPE extends to longer sequences more gracefully than the older additive schemes.

The core idea is rotation. Instead of adding a position vector to the token embedding, RoPE pairs up the coordinates of each query and key vector and rotates each pair by an angle proportional to the token's position, using a spread of rotation frequencies across the pairs. The decisive property is that the dot product between a rotated query at one position and a rotated key at another depends only on their difference in position, not on where either sits absolutely, and since attention scores are exactly those dot products, the attention a token pays to another becomes a function of how far apart they are, the relative-position behavior wanted, achieved without any extra learned parameters.

RoPE is applied inside each attention layer, to the query and key vectors just before their scores are computed, and not to the value vectors. Because the rotation depends only on position, it composes cleanly with the rest of self-attention and adds negligible compute, and it is compatible with the kv-cache: each token's keys are rotated once when first computed and stored in their rotated form, so caching works exactly as it does without RoPE.

A major practical reason RoPE became dominant is context extension. Because position enters as a rotation angle with a known frequency structure, the scheme can be stretched to lengths beyond training by interpolating or rescaling those angles, which underlies popular methods for growing a model's context window after the fact. RoPE thus connects the abstract requirement to encode order with the very concrete engineering goal of longer contexts, which is why it has largely displaced the original sinusoidal and learned absolute positional encodings in modern transformer design.
