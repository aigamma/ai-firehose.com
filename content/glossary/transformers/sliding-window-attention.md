---
title: Sliding Window Attention
slug: sliding-window-attention
kind: technique
category: Transformers and LLMs
aliases: local attention, windowed attention, sliding-window attention
related: self-attention, context-window, kv-cache, flash-attention, large-language-model
summary: An attention pattern where each token attends only to a fixed window of recent tokens, not the whole sequence, making attention cost linear in length and bounding the KV cache. The clever part is that depth rescues range: because the window applies at every layer, the effective reach grows many windows wide up the stack, exactly as a CNN builds a large receptive field from small filters.
---

Sliding window attention attacks the quadratic cost of full self-attention by limiting how far each token can look. Instead of letting every token attend to all previous tokens, each one attends only to a fixed window of the most recent W tokens, so the work per token becomes constant rather than growing with sequence length, the total attention cost is linear in the sequence, and the kv-cache needed during generation is bounded by the window instead of the full history.

The obvious worry is that a token can no longer see anything older than its window, but depth rescues range, and that is the key idea. Because the window applies at every layer, information propagates outward as it flows up the stack, much as a convolutional neural network builds a large receptive field from small local filters: a token at layer two can be influenced by a neighbor that, at layer one, already absorbed a token further back, so after several layers the effective reach is many windows wide even though each layer is strictly local.

This makes sliding window attention a practical way to extend usable context cheaply, and it was a defining feature of models such as Mistral. It is often combined with other mechanisms, for example interleaving a few full-attention layers, or pairing the window with attention sinks that always keep the first tokens, so the model retains a stable anchor.

The trade is that exact long-range dependencies in a single step are sacrificed for efficiency. When a task genuinely needs precise recall across a very long span, a pure local window can miss it, which is why long-context systems usually blend windowed and global attention rather than relying on either alone.
