---
title: Message Passing
slug: message-passing
kind: technique
category: Graph and Geometric Learning
aliases: message-passing neural network, MPNN, neighborhood aggregation
related: graph-neural-network, graph-convolution, graph-attention-network, node-embedding, self-attention, transformer
summary: The core computation of a graph neural network: each node gathers messages from its neighbors, aggregates them with a permutation-invariant operator, and updates itself, repeated layer by layer. Three choices, message, aggregate, update, generate almost the whole zoo of GNNs, and the abstraction reaches all the way to the transformer: self-attention is message passing on the complete graph.
---

Message passing is the unifying recipe behind almost every graph neural network. In one round, each node sends a message along each of its edges, every node aggregates the messages arriving from its neighbors with a permutation-invariant operator, and each node updates its own state by combining the aggregated message with its previous state. Three pieces define a layer: a message function that decides what to send, an aggregation function that combines what arrives, and an update function that produces the new node vector. Most published architectures are just particular choices of these three.

This pattern matters because it gives the field a single abstraction that captures a sprawling zoo of models. Graph convolution, the graph attention network, and many bespoke architectures all reduce to message passing with different message and aggregation choices, and naming the common skeleton lets researchers reason about expressive power and limitations in general rather than model by model, while giving engineers one efficient primitive to optimize, the sparse gather-scatter operation, that accelerates the entire family.

The aggregation step must be invariant to the ordering of a node's neighbors, because a graph carries no inherent order over the nodes adjacent to a given vertex. Sum, mean, and max are the standard choices, and the choice is consequential: a sum can count neighbors and preserves the most information, a mean normalizes away degree, and a max captures the single most salient signal. This permutation invariance is the symmetry that defines the whole approach and the reason a message-passing network is the natural model for data with no canonical layout.

After k rounds, a node's representation has absorbed information from everything within k hops, producing a node embedding that encodes both the node's own features and the structure of its surrounding neighborhood, and reading out all node states with another permutation-invariant pool yields a representation of the whole graph. Two practical failure modes shape design: stacking too many rounds causes over-smoothing, where every node's vector converges to the same value and distinctions wash out, and over-squashing, where information from an exponentially growing neighborhood is crushed through a fixed-width vector across a graph bottleneck.

Message passing connects directly to the transformer. Self-attention is message passing on the complete graph: every token is a node, every pair of tokens is an edge, the message is the value vector, and the attention score is a learned, content-dependent edge weight. Viewing attention this way, through the lens of geometric deep learning, explains why transformers need positional encoding (a complete graph has no built-in geometry to tell positions apart) and why graph attention networks and transformers are close relatives rather than unrelated inventions.
