---
title: Graph Neural Network
slug: graph-neural-network
kind: technique
category: Graph and Geometric Learning
aliases: GNN
related: message-passing, graph-attention-network, graph-convolution, node-embedding, geometric-deep-learning, transformer
summary: A neural network that operates directly on graph-structured data, learning representations of nodes, edges, and whole graphs by repeatedly aggregating information from each node's neighbors.
---

A graph neural network is a model that takes a graph as input, a set of nodes connected by edges, and learns vector representations that respect that connectivity. Unlike a multilayer perceptron, which assumes its inputs are independent feature vectors, or a convolutional neural network, which assumes a regular grid of pixels, a GNN makes no assumption about a fixed layout. It handles the irregular, relational structure that grids and sequences cannot: molecules, social networks, citation graphs, road maps, knowledge bases, and the mesh of a 3D shape.

Graph neural networks matter because an enormous fraction of real data is fundamentally relational, and discarding the relations throws away the signal. A molecule is not a bag of atoms; its behavior depends on which atoms bond to which. A user in a recommender system is defined partly by who they connect to. By learning on the graph itself, a GNN can predict properties of nodes (will this account commit fraud), of edges (will these two people become friends), or of an entire graph (is this molecule toxic). The same architecture serves all three tasks because they all rest on the same learned node representations.

The core mechanism is message passing. Each node starts with a feature vector, and in every layer it gathers messages from its immediate neighbors, combines them with a permutation-invariant aggregator such as a sum or mean, and updates its own vector through a small neural network. Stacking k such layers lets information flow across k hops, so a node's final representation summarizes its entire k-hop neighborhood. The aggregation must be invariant to the order of the neighbors, because a graph has no canonical ordering of nodes; this built-in symmetry is a form of inductive bias and the reason GNNs generalize on relational data.

The earliest and most widely used variant is the graph convolution, which generalizes the convolution from regular grids to arbitrary neighborhoods. A richer variant is the graph attention network, which learns to weight each neighbor's message by relevance rather than treating them uniformly. These are not separate model families so much as different choices of how a node listens to its neighbors. The output of any of them is a node embedding, a learned coordinate in a vector space where graph-proximate or functionally similar nodes land close together.

Graph neural networks sit at the heart of geometric deep learning, the program that organizes architectures by the symmetries of their data. From that viewpoint a GNN is the canonical model for data with permutation symmetry, just as a convolutional neural network is the canonical model for translation symmetry on a grid. The connection runs deeper still: a transformer is a graph neural network on the complete graph, where every token attends to every other token, and self-attention is message passing with attention-weighted edges over that fully connected graph. Adding positional encoding to a transformer is, in graph terms, supplying the structural information that a generic complete graph would otherwise lack.
