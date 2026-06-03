---
title: Causal Attention
slug: causal-attention
kind: technique
category: Transformers and LLMs
aliases: causal attention, masked self-attention, causal masking
related: self-attention, multi-head-attention, decoder-only-model, next-token-prediction, kv-cache
summary: Self-attention with a mask that stops each position from attending to future tokens, enforcing the left-to-right constraint that lets a model train on next-token prediction over a whole sequence at once; the mechanism that makes decoder-only LLMs autoregressive.
---

Causal attention is ordinary self-attention with one rule added: a token may attend to itself and to earlier tokens, but never to later ones. This is implemented with a mask that zeroes out the attention weights to future positions before the softmax, so information can only flow backward in the sequence. The "causal" name reflects that the present cannot depend on the future.

This constraint is what makes autoregressive language modeling work. The goal is to predict each next token from only the tokens before it, and during training you want to do that for every position in the sequence simultaneously for efficiency. Causal masking makes that safe: even though the whole sequence is processed in one parallel pass, no position can cheat by looking at the answer (the tokens that come after it). Without the mask, the model would trivially see the token it is supposed to predict.

It is the defining difference between a decoder-only language model and a bidirectional encoder like BERT, which uses unmasked attention so every token sees the entire input, appropriate for understanding tasks but not for generation.

The causal structure has a useful consequence at inference: because a token's attention never depends on future tokens, the keys and values of past tokens are fixed once computed, which is exactly what the kv-cache stores and reuses to make generation efficient.
