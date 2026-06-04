---
title: Attention Mechanism
slug: attention-mechanism
kind: technique
category: Deep Learning Architectures
aliases: attention, self-attention
related: recurrent-neural-network, lstm, residual-connection, layer-normalization, autoencoder, vanishing-gradient
summary: A mechanism that lets a model compute each output as a content-weighted sum over all input positions, focusing on whatever is most relevant regardless of distance. It removed the fundamental bottleneck of recurrence by giving every position direct, parallel access to every other in a single operation, the shift that produced the transformer.
---

An attention mechanism lets a neural network decide, for each element it is processing, which other elements to focus on and how much. It compares a query against a set of keys to produce relevance scores, normalizes those scores into weights that sum to one, and takes the corresponding weighted sum of values. The output for a position is therefore a blend of information pulled from across the whole input, with the blend determined dynamically by content rather than fixed by architecture.

Attention matters because it removed the fundamental bottleneck of sequential models. A recurrent neural network, even a gated LSTM, must funnel all earlier context through a single hidden state passed step by step, which limits how well distant information survives and forbids parallel computation over a sequence. Attention instead gives every position direct access to every other position in one operation, so a long-range dependency is a single hop away rather than many recurrent steps, and the computation parallelizes across the whole sequence. This shift, articulated in the 2017 paper "Attention Is All You Need," produced the transformer and reshaped the field.

The dominant form is scaled dot-product self-attention. Each input vector is projected into a query, a key, and a value; the dot product of a query with every key gives raw scores, which are scaled down by the square root of the key dimension and passed through a softmax to become attention weights; the output is the weighted sum of the values. Multi-head attention runs several such computations in parallel with different learned projections, letting the model attend to different kinds of relationships at once, and the results are concatenated and mixed. Every attention sublayer in a transformer is wrapped in a residual connection and followed by layer normalization, the same stabilizing pattern used throughout deep networks.

Attention ties the modern landscape together. Self-attention relates positions within one sequence, while cross-attention lets a decoder attend to an encoder's output, generalizing the encoder-decoder pattern of the autoencoder to sequence-to-sequence tasks. Because every position attends directly to every other, gradients also have short paths, sidestepping the vanishing gradient that hampers deep recurrence. Attention now underpins large language models, vision transformers, and multimodal systems, one of the most consequential techniques in contemporary deep learning, though its cost grows quadratically with sequence length and has spurred a large body of work on more efficient variants.
