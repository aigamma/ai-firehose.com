---
title: Dropout
slug: dropout
kind: technique
category: Deep Learning Architectures
aliases: dropout regularization
related: batch-normalization, multilayer-perceptron, activation-function, gradient-descent, convolutional-neural-network
summary: A regularizer that randomly zeroes a fraction of a layer's units on every training step, so each pass runs a different thinned subnetwork. The effect is to train an exponentially large ensemble of weight-sharing subnetworks at once and average them, which stops neurons from co-adapting into fragile arrangements and curbs overfitting.
---

Dropout, on each training step, randomly sets a fraction of the units in a layer to zero, so every forward pass runs through a different thinned version of the network, with a randomly chosen subset of neurons temporarily removed along with their connections. The fraction dropped, the dropout rate, is a hyperparameter, commonly around 0.5 for fully connected layers and lower for convolutional ones. Introduced in 2012, it was a key ingredient in early deep learning successes.

It is a simple and effective remedy for overfitting, the tendency of a high-capacity network to memorize its training data rather than generalize. By making units unreliable, dropout prevents them from co-adapting into fragile arrangements that depend on the exact presence of specific other units, pushing each neuron to learn features useful on their own across many random contexts, which yields representations that generalize better to unseen data.

The mechanism is best understood as training an ensemble, and that is the key idea. Because each step samples a different subnetwork from an exponentially large family that shares weights, dropout approximately trains all of them at once and averages their predictions. At inference dropout is turned off and the full network is used, with activations scaled to account for the units present during training, an approximation to averaging over that ensemble. The randomness is applied only in the forward pass; gradient descent then updates only the units active on that step.

Dropout interacts with the other tools of deep learning, and its role has shifted over time. It composes with normalization, though stacking dropout and batch normalization carelessly can hurt because they perturb activation statistics in conflicting ways, so practitioners order them deliberately. In large modern models dropout is used more sparingly, since massive datasets and other regularizers reduce the need for it, but it remains a standard, well-understood lever for controlling overfitting in the multilayer perceptron and the convolutional neural network.
