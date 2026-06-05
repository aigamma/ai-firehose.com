---
title: Pre-Normalization
slug: pre-normalization
kind: technique
category: Transformers and LLMs
aliases: Pre-LN, pre-layer-norm, pre-norm
related: layer-normalization, residual-connection, transformer, self-attention, feed-forward-network, vanishing-gradient
summary: A transformer design choice that applies layer normalization to the input of each sublayer rather than to its output, leaving the residual pathway clean and untouched. That single placement is what makes very deep models train stably, the difference between a hundred-layer stack that converges smoothly and one that needs delicate tuning or fails outright.
---

Pre-normalization, usually written Pre-LN, is the now-standard arrangement of normalization inside a transformer block. The question it answers is small but consequential: where exactly does layer normalization go relative to the residual connection? In the original transformer the normalization was applied after each sublayer and after the residual addition, an arrangement called post-normalization or Post-LN; pre-normalization instead normalizes the input to each sublayer before it enters attention or the feed-forward network, and adds the sublayer's output back to an unnormalized residual stream. Nearly every large language model trained in recent years uses the pre-norm form.

The reason the placement matters is the health of the residual pathway. With pre-normalization the residual connection runs straight through the block untouched by any normalization, so a signal can travel from the first layer to the last along an unobstructed identity path, and gradients flow back along the same path without being repeatedly rescaled, which directly relieves the vanishing-gradient problem that otherwise plagues very deep stacks. Post-norm, by contrast, places a normalization step squarely on the residual path at every layer, which destabilizes training as depth grows and typically forces a long, carefully tuned learning-rate warmup to keep the early steps from diverging.

The practical payoff is that pre-normalization lets transformers be made much deeper and trained with less fragility. Models with dozens or hundreds of layers train reliably under pre-norm where the same depth under post-norm would require delicate tuning or simply fail to converge. The tradeoff, observed in careful studies, is modest: post-norm models that do train successfully can reach slightly better final quality because the in-path normalization regularizes the representations, but the robustness and scalability of pre-norm almost always win in practice. A common refinement adds a single normalization at the very end of the stack, before the output projection, to control the magnitude of the residual stream that pre-norm otherwise lets grow.

Pre-normalization is one of a small cluster of architectural decisions that, taken together, made very large transformers trainable, alongside good weight initialization, residual connections, and stable normalization variants like RMSNorm. It is rarely discussed in introductions because it sounds like a mere implementation detail, yet that is the keeper's whole point: that single choice, which side of each sublayer the normalization sits on, quietly governs how deep and how stably the network can be pushed.
