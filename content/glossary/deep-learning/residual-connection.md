---
title: Residual Connection
slug: residual-connection
kind: technique
category: Deep Learning Architectures
aliases: skip connection, residual, shortcut connection, ResNet
related: vanishing-gradient, batch-normalization, layer-normalization, convolutional-neural-network, backpropagation, attention-mechanism
summary: A shortcut that adds a layer's input directly to its output, so the layer only has to learn a residual correction rather than the full mapping. The addition gives the gradient an unobstructed identity path backward, which is what made networks of hundreds of layers trainable for the first time, one of the quietly load-bearing ideas in deep learning.
---

A residual connection, also called a skip connection, routes the input of a layer or block directly to its output by addition, so the block computes its transformation plus an identity copy of what came in. Where a plain block would output some function of its input, a residual block outputs that function added to the input itself, so the layer is only responsible for learning the residual, the difference between the desired output and the input, which is often far easier than learning the full mapping from scratch.

Residual connections made genuinely deep networks trainable for the first time. Before they were introduced in the ResNet architecture in 2015, stacking more layers past a point made networks harder to optimize and actually raised training error, a degradation problem distinct from overfitting; the skip path turned this around and enabled networks of hundreds or even a thousand layers. The gain came not from added capacity but from a far better optimization landscape, which is the counterintuitive part: the fix for "too deep to train" was not fewer layers but an easier path for the gradient.

That path is the mechanism. During backpropagation the addition sends the gradient backward along two routes, one through the block and one straight through the identity shortcut, and the identity path carries the gradient unattenuated to earlier layers, sidestepping the repeated shrinking that causes the vanishing gradient in deep stacks. A useful intuition is that a deep residual network behaves like an ensemble of many shorter paths of varying depth, so it degrades gracefully and trains stably.

The residual connection is now a near-universal building block. It is paired with batch normalization in convolutional networks and with layer normalization in transformers, where every attention sublayer and feedforward sublayer is wrapped in a residual connection. Few ideas have been as quietly load-bearing: without it, the very deep convolutional neural network and the modern transformer would both be far harder to train.
