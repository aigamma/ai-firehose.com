---
title: State Space Model
slug: state-space-model
kind: technique
category: Frontier Architectures
aliases: SSM, state space models, deep state space model
related: structured-state-space, mamba, linear-attention, retentive-network, hyena, neural-ode
summary: A sequence model that carries information forward through a continuously evolving hidden state, computing each output from that state rather than from explicit pairwise comparisons across the sequence, which lets it scale linearly with sequence length.
---

A state space model, or SSM, is a sequence model borrowed from control theory and signal processing. It describes a system by a hidden state vector that evolves step by step, and it reads the output off that state. In its classical continuous form the state has a derivative governed by a matrix A, the input enters through a matrix B, and the output is projected out by a matrix C. Discretized to operate on a token sequence, this becomes a linear recurrence: the next state is a fixed linear function of the previous state plus the current input, and the next output is a linear function of the new state. Everything the model knows about the past is compressed into that single running state.

State space models matter because they offer an escape from the cost structure of the transformer. Self-attention compares every token to every other token, which costs time and memory that grow with the square of the sequence length. An SSM instead summarizes the past in a fixed-size state, so generation costs the same per token no matter how long the context, and the whole sequence can be processed in time that grows only linearly. That makes very long contexts, such as genomes, audio waveforms, or book-length documents, tractable in a way quadratic attention is not.

The recurrence can be run two ways, and this duality is the source of the architecture's practical speed. At training time the same computation can be unrolled as a global convolution: the model precomputes a long kernel from the A, B, and C matrices and convolves it with the input, which is highly parallel on a GPU. At inference time the model switches to the step-by-step recurrent form, which needs only the current state and so generates tokens in constant memory. One set of parameters, two execution modes, chosen to suit training versus deployment.

The difficulty that long held SSMs back was memory: a naively parameterized linear recurrence either forgets the distant past or becomes numerically unstable. The breakthrough was choosing the state matrix carefully so the state can retain information across thousands of steps, which is the contribution of the structured state space line of work and its HiPPO initialization. Building on that foundation, mamba added input-dependent dynamics, letting the model decide what to keep and what to discard based on the content of each token rather than using fixed coefficients.

State space models sit in the same family as several other sub-quadratic sequence models, including linear attention, the retentive network, and the convolutional hyena operator. All of them replace explicit all-pairs attention with a mechanism that mixes information across time at lower cost, and the boundaries between these formulations are blurry: a linear attention layer can be rewritten as a recurrence, and an SSM can be rewritten as a convolution. The unifying goal is a sequence mixer whose cost scales gracefully with length while still capturing long-range structure.
