---
title: Retentive Network
slug: retentive-network
kind: technique
category: Frontier Architectures
aliases: RetNet, retention mechanism
related: linear-attention, state-space-model, mamba, structured-state-space, hyena
summary: A transformer-style architecture whose retention mechanism replaces self-attention with a decayed linear recurrence, distinctive for supporting three mathematically equivalent compute modes, parallel, recurrent, and chunkwise, so it trains like a transformer yet generates in constant memory. Its fixed decay is both strength and limit: clean and parallelizable, but content-blind where mamba adapts.
---

A retentive network, commonly called RetNet, swaps the self-attention sub-layer for a mechanism called retention. Retention keeps the query, key, and value projections familiar from attention but drops the softmax, instead weighting each past token by an exponential decay that depends on how far back it is: recent tokens count more, distant tokens fade, and because the decay is multiplicative the whole operation can be written as a simple linear recurrence over a running state. In effect retention is a form of linear attention with a built-in forgetting factor.

The headline property is that the same retention layer can be computed in three mathematically equivalent ways, each suiting a different phase of a model's life, and that triple is the headline. The parallel form expresses retention as a masked matrix product over the whole sequence, training efficiently on GPUs much like ordinary attention; the recurrent form processes one token at a time, carrying only the fixed-size state forward, giving generation that costs the same per token and uses constant memory no matter how long the context; and a chunkwise form splits a long sequence into blocks, computing within each block in parallel and passing the state between blocks recurrently, balancing throughput and memory for very long inputs.

This three-mode duality targets a specific pain point of the transformer. Transformers train well in parallel but generate expensively: producing each new token requires attending over a key-value cache that grows without bound as the sequence lengthens, so memory and latency climb with context length. RetNet's recurrent inference form removes that growing cache entirely, holding the past in a small state, which makes long-context generation cheaper and steadier; the aim is to keep the transformer's training efficiency while gaining a recurrent network's inference efficiency.

The retentive network belongs to the same sub-quadratic family as the state space model, linear attention, and mamba, and the kinship is mathematical, not merely thematic: RetNet's decayed recurrence is essentially a state space model with a particular fixed, complex-valued state transition, and also a gated form of linear attention. The fixed decay is both its strength and its limitation, giving clean, parallelizable dynamics but, unlike mamba, not adapting what it retains based on content. RetNet thus sits as one well-defined point in the broader design space of efficient sequence mixers that seek to succeed all-pairs attention.
