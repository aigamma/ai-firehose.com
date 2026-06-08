---
title: Mamba
slug: mamba
kind: technique
category: Frontier Architectures
aliases: selective state space model, S6
related: state-space-model, structured-state-space, linear-attention, retentive-network, hyena, world-model
summary: A selective state space model that makes the recurrence input-dependent, so the model decides token by token what to remember and what to ignore, and runs in linear time via a hardware-aware parallel scan instead of quadratic attention. Selectivity is the whole point: it recovers attention's content-based routing that fixed state space models lacked.
---

Mamba, introduced in late 2023, builds on the state space model family and turns on one capability the earlier models lacked: selectivity. Earlier structured state space models used fixed transition matrices, the same dynamics applied to every token, which made them fast but content-blind, unable to preferentially remember an important token or skip an irrelevant one. Mamba makes the key parameters of the recurrence, including the step size and the input and output projections, functions of the current input, so the model decides, token by token, how much new information to write into its hidden state and how much of the old state to keep.

That single change is what does the work, because it recovers a capability fixed SSMs lacked and attention had for free: routing information based on content. With selectivity, a Mamba layer can ignore filler tokens, hold a value in state until it is needed, and reset context at a boundary. The result competes with transformers on language-modeling quality while keeping the linear-time scaling and constant-memory generation that make state space models attractive for long sequences.

The cost of selectivity is that the recurrence is no longer a fixed convolution, so the convolutional training trick used by earlier SSMs does not apply. Mamba solves this with a hardware-aware parallel scan. A scan computes all the cumulative states of a recurrence, and although a recurrence looks inherently sequential, an associative scan can be parallelized across the sequence; Mamba's implementation keeps the large intermediate states in fast GPU memory and fuses the operations so the expensive state never has to be written out to slower memory, which is what makes the input-dependent recurrence practical at scale.

Architecturally, Mamba folds the whole mechanism into a single homogeneous block that interleaves the selective SSM with a gated linear projection, and stacks these blocks with no attention layers at all, contrasting with the transformer's split between an attention sub-layer and a feed-forward sub-layer. A later refinement, Mamba-2, reframed the selective SSM as a form of structured masked attention, drawing an explicit bridge between state space models and linear attention and clarifying that the two families are different views of one underlying computation.

Mamba is significant as one of the strongest demonstrations that an architecture without quadratic self-attention can match transformers on hard sequence tasks, and it has been extended beyond text into vision, audio, and genomics. It is frequently combined with attention in hybrid stacks, where a few attention layers supply precise long-range recall and the Mamba layers carry the bulk of the sequence at low cost. It sits alongside the retentive network and hyena as a leading contender in the search for an efficient successor to the transformer.
