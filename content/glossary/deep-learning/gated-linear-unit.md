---
title: Gated Linear Unit
slug: gated-linear-unit
kind: technique
category: Deep Learning Architectures
aliases: GLU, SwiGLU, GEGLU
related: activation-function, relu, multilayer-perceptron, transformer, residual-connection, softmax
summary: A feedforward block that multiplies one linear projection of its input by a second projection passed through a nonlinearity, so the layer learns a continuous, content-dependent gate on its own signal, unlike ReLU's fixed threshold. The swish-gated variant, SwiGLU, is now standard inside large transformer feedforward blocks, a tweak with a famously thin theoretical justification that earned permanent adoption anyway.
---

A gated linear unit is a feedforward layer that splits its input into two parallel linear projections and combines them by element-wise multiplication, where one projection is passed through a nonlinearity first and acts as a gate on the other. Introduced by Dauphin and colleagues in 2017 for convolutional language modeling, the design lets the layer modulate its own output: the gate, with values that suppress or amplify, decides how much of the paired linear signal survives at each position. This multiplicative interaction is more expressive than a single linear layer followed by a pointwise activation, because the gating value depends on the input rather than being a fixed shape applied to every coordinate.

A gate gives a network a clean way to control information flow, and the contrast with ReLU is the point. Where a plain ReLU simply zeroes negative inputs at a fixed threshold, a gated linear unit learns, from a separate projection, a continuous and context-dependent factor that scales the signal. The original motivation was to ease gradient flow in deep stacks, since the linear path that is not squashed by a saturating nonlinearity carries gradients more readily, much as a residual connection does, and in practice the gating consistently improves the quality of feedforward blocks for a given parameter budget.

The variants differ only in which nonlinearity sits on the gate. The plain gated linear unit uses a sigmoid; replacing it with a GELU gives GEGLU, and with the SiLU or swish gives SwiGLU. Shazeer's 2020 study of these variants found the swish-gated form, SwiGLU, gave the best results, and noted with characteristic understatement that the gains came without a clean theoretical explanation. Because a gated unit uses two input projections instead of one, implementations typically shrink the hidden width so the total parameter count matches an ordinary two-layer feedforward block, keeping the comparison fair.

The gated linear unit became a default in the feedforward sublayer of large transformer language models. Where the original transformer used a simple two-layer feedforward network with a single activation between the layers, many modern models, including widely used open-weight families, replace it with a SwiGLU block. It is a small architectural substitution with an outsized footprint, sitting inside nearly every layer of models trained at scale, and one of the clearest cases where an empirical tweak with a thin justification nonetheless earned permanent adoption.
