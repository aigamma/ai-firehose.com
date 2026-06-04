---
title: Multilayer Perceptron
slug: multilayer-perceptron
kind: technique
category: Deep Learning Architectures
aliases: MLP, feedforward neural network, fully connected network
related: activation-function, relu, backpropagation, gradient-descent, convolutional-neural-network, dropout
summary: The canonical feedforward neural network, layers of fully connected neurons each applying a weighted sum then a nonlinear activation. It is the architectural baseline the whole field descends from, and far from a relic: the position-wise feedforward block inside every transformer layer is an MLP.
---

A multilayer perceptron is the plainest neural network that still works: an input layer, one or more hidden layers, and an output layer, with every neuron in one layer connected to every neuron in the next. Each neuron computes a weighted sum of its inputs plus a bias, then passes that scalar through a nonlinear activation function, and stacking such layers lets the network compose simple transformations into an arbitrarily complex mapping from inputs to outputs.

It is the architectural baseline from which most of deep learning descends, and its history is the field's origin story in miniature. The single-layer perceptron of the 1950s could only separate linearly separable data, a limitation that famously stalled the field; adding hidden layers with nonlinear activations removed the ceiling, and the universal approximation theorem shows that an MLP with even one sufficiently wide hidden layer can approximate any continuous function on a bounded domain to arbitrary precision. Depth, in practice, lets the network represent the same functions far more compactly than width alone.

Mechanically a forward pass multiplies the input vector by a weight matrix, adds a bias, and applies the activation, repeating layer by layer until the output. Without the nonlinear activation the whole stack would collapse into a single linear map, which is why a function like ReLU is essential between layers, and the network learns its weights through gradient descent, with the gradients supplied by backpropagation, which applies the chain rule backward through the layers.

The MLP is the connective tissue of modern architectures, not a relic. A convolutional neural network ends in fully connected layers that act as a classifier head, and the position-wise feedforward block inside every transformer layer is an MLP applied to each token. Understanding the plain MLP, its forward pass, its training by backpropagation, and its reliance on nonlinearity, is the foundation on which the convolutional neural network, the recurrent neural network, and the attention mechanism all build.
