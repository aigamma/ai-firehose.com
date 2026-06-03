---
title: Weight Initialization
slug: weight-initialization
kind: technique
category: Deep Learning Architectures
aliases: weight initialization, Xavier initialization, He initialization
related: activation-function, vanishing-gradient, exploding-gradient, batch-normalization, relu
summary: How a neural network's weights are set before training begins; a poor scheme makes signals vanish or explode as they pass through the layers and stalls learning, while principled schemes like Xavier and He keep activations and gradients well-scaled.
---

Before a network can learn, its weights have to start somewhere, and that starting point matters far more than it might seem. The weights are set randomly, but the scale of that randomness is critical. If the initial weights are too small, the signal shrinks as it passes through each layer until activations and gradients are effectively zero in the deeper layers, and learning stalls. If they are too large, the signal grows and explodes. Either way a deep network fails to train, not because the architecture is wrong but because it was initialized badly.

The fix is to choose the initial variance so that the magnitude of activations, and of gradients flowing back, is roughly preserved from layer to layer. Xavier (Glorot) initialization does this for symmetric activations like tanh by scaling the variance to the number of inputs and outputs of a layer; He initialization adapts the scale for ReLU, which zeroes half its inputs. These principled schemes replaced naive uniform initialization and were one of the practical unlocks that made training deep networks reliable.

Good initialization works alongside the other stabilizers of deep training. Normalization layers and residual connections also keep signals well-behaved across depth, and together they are why very deep networks train at all. Initialization gets training off to a healthy start; the others keep it healthy.
