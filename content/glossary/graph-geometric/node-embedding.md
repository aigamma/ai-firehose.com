---
title: Node Embedding
slug: node-embedding
kind: technique
category: Graph and Geometric Learning
aliases: node embeddings, graph embedding
related: graph-neural-network, message-passing, graph-convolution, embedding-model, latent-space, manifold-hypothesis
summary: A learned vector representation of a node, placing each node at a coordinate in a continuous space so that graph-proximate or functionally similar nodes lie close together, the graph counterpart of a word embedding. The decisive split is shallow (one fixed vector per node) versus GNN-based, which is inductive: it computes embeddings from features and local structure, so it can embed nodes never seen in training.
---

A node embedding places a node of a graph at a coordinate in a continuous space, the graph counterpart of a word or token embedding. The goal is to map the discrete, relational structure of a graph into a vector space where geometric closeness reflects graph closeness: nodes that are neighbors, that share many neighbors, or that play similar structural roles should land near one another. Once nodes live in such a space, standard machine learning tools that expect vectors, classifiers, clustering, nearest-neighbor search, can be applied to graph data directly.

Node embeddings matter because they are the bridge between irregular graph structure and the rest of the machine learning toolkit. With good embeddings you can predict a node's label, score whether two nodes should be linked by measuring the distance between their vectors, recommend items, or retrieve similar entities, all as ordinary vector operations. The same vectors serve many downstream tasks, which is why learning them well is often the central objective when working with graphs.

There are two broad ways to produce them, and the contrast is the keeper. Shallow methods, such as random-walk approaches that adapt the skip-gram idea from word embeddings, learn one independent vector per node by treating short walks over the graph as sentences and pushing co-visited nodes together. Modern methods instead use a graph neural network: through several rounds of message passing or graph convolution, each node aggregates information from its neighborhood, and its final hidden state is its embedding. The neural approach has a decisive advantage, it is inductive, computing embeddings as a function of node features and local structure, so it can embed nodes and even entire graphs never seen during training, whereas shallow methods must relearn a vector for every new node.

Node embeddings connect to the broader geometry of representation learning. The space they inhabit is a learned latent space, and the manifold hypothesis applies: meaningful nodes tend to concentrate on a low-dimensional surface within the embedding space, so distance along the data manifold, not just raw coordinates, carries the semantics. In this sense an embedding model for graphs is doing the same job as one for text or images, turning discrete objects into geometry where similarity becomes distance, with the difference that the structure being encoded is the connectivity of the graph itself.
