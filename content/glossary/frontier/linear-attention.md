---
title: Linear Attention
slug: linear-attention
kind: technique
category: Frontier Architectures
aliases: linear attention, linear transformer, linearized attention
related: state-space-model, retentive-network, mamba, structured-state-space, hyena
summary: A reformulation of self-attention that removes the softmax so the computation can be reordered into a running summary, reducing the cost from quadratic to linear in sequence length and turning the attention layer into a recurrence.
---

Linear attention is a family of techniques that make the attention mechanism scale linearly with sequence length instead of quadratically. Standard self-attention forms a similarity score between every pair of tokens, passes those scores through a softmax, and uses the result to take a weighted average of the values. The all-pairs score matrix is what costs time and memory proportional to the square of the sequence length. The softmax is also what forces that matrix to be built explicitly, because it couples all the scores in a row together through its normalization.

The key trick is to replace the softmax similarity with a kernel that factorizes. If the similarity between a query and a key can be written as the dot product of two feature maps applied separately to the query and to the key, then the order of operations can be changed. Instead of multiplying queries by keys first to form the big score matrix, the model multiplies keys by values first to form a small fixed-size summary matrix, and then multiplies each query into that summary. By associativity the answer is the same, but the large sequence-by-sequence matrix is never materialized, and the cost drops to linear in length with memory that does not grow with the sequence.

The deeper consequence is that linear attention is mathematically a recurrence. The running summary of keys and values is exactly a hidden state that accumulates as tokens arrive, so a linear attention layer can generate one token at a time in constant memory, just like a state space model. This equivalence is now well understood: linear attention, the deep SSM, and the retentive network are different parameterizations of the same underlying idea, namely a sequence mixer with a linear recurrence and a fixed-size state. Mamba's second formulation makes this connection explicit by casting its selective state space layer as a structured form of linear attention.

Linear attention matters as one of the original and most influential answers to the quadratic cost of transformers, and it remains a live research direction rather than a settled solution. The honest difficulty is quality: a fixed-size state must compress an unboundedly long history, so naive linear attention can underperform softmax attention on tasks that need sharp, precise recall of a specific earlier token. Much of the subsequent work, including gating mechanisms, decay terms as in the retentive network, and input-dependent dynamics as in mamba, is aimed squarely at closing that quality gap while preserving the linear cost. It sits at the center of the broader effort to find an efficient successor to all-pairs attention, alongside structured state space models and the convolutional hyena operator.
