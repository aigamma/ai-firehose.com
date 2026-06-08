---
title: Batch Normalization
slug: batch-normalization
kind: technique
category: Deep Learning Architectures
aliases: batchnorm, BN
related: layer-normalization, dropout, residual-connection, convolutional-neural-network, gradient-descent, activation-function
summary: A layer that normalizes each feature's pre-activations across the current mini-batch to zero mean and unit variance, then rescales with learned parameters, which lets deep networks train faster and tolerate higher learning rates. Its defining quirk and weakness is a train/inference asymmetry: it uses live batch statistics while training and running averages at inference, so it falters when batches are tiny.
---

Batch normalization is a layer that normalizes the activations flowing through it. For each feature it computes the mean and variance across the examples in the current mini-batch, subtracts the mean, and divides by the standard deviation, producing zero-mean unit-variance values, then applies two learned parameters per feature, a scale and a shift, so the network can recover any distribution it needs rather than being forced to keep the normalized one. Introduced in 2015, it became a standard component of deep convolutional networks almost immediately.

It matters because it makes deep networks substantially easier and faster to train. By keeping the distribution of each layer's inputs stable as the weights of earlier layers shift, it reduces the sensitivity of training to initialization and permits much higher learning rates without divergence. The original paper framed the benefit as reducing internal covariate shift; later analysis argued the deeper effect is a smoother optimization landscape that makes gradient descent better behaved. Either way the empirical payoff is faster convergence and a mild regularizing effect from the noise that batch statistics inject.

The mechanism carries an important asymmetry between training and inference, and it is the catch. During training the normalization uses the statistics of the live mini-batch, so each example is influenced by the others in its batch. At inference there is no batch to pool over, so the layer instead uses running averages of the mean and variance accumulated during training. This dependence on batch statistics is also batch normalization's main weakness: it degrades when the batch is very small and does not fit naturally with sequence models of variable length.

Those limitations are precisely why alternatives exist. Layer normalization normalizes across the features of a single example instead of across the batch, which removes the batch dependence and is the form used throughout transformers. Batch normalization remains the default in the convolutional neural network, typically placed between a convolution and its activation function and composing well with the residual connection. It also interacts with dropout, and stacking the two carelessly can hurt, so practitioners are deliberate about their order.
