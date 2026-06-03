---
title: Layer Normalization
slug: layer-normalization
kind: technique
category: Deep Learning Architectures
aliases: layernorm, LN
related: batch-normalization, residual-connection, attention-mechanism, recurrent-neural-network, activation-function, dropout
summary: A normalization technique that standardizes the activations across the features of a single example to zero mean and unit variance, then rescales them, giving batch-independent normalization that suits sequence models and transformers.
---

Layer normalization standardizes the activations within a single example, computing the mean and variance across that example's own feature dimensions rather than across a batch. It subtracts the mean, divides by the standard deviation, and applies a learned scale and shift, just as batch normalization does, but the statistics come from one example's features instead of from many examples' shared feature. This makes each example's normalization entirely independent of the others in the batch.

Layer normalization matters because that batch independence removes the central weaknesses of batch normalization. There is no difference between training and inference behavior, since no batch statistics are pooled, and performance does not collapse when the batch is small or the batch size is one. Above all, it works cleanly on sequences of variable length, which is why it became the normalization of choice for the recurrent neural network and, decisively, for the transformer.

The mechanism is simple and local. For a given token or hidden vector, layer normalization treats that vector's components as the population to normalize, so a token with unusually large activations is rescaled using only its own values. In a transformer, a normalization layer is applied around every attention mechanism sublayer and every feedforward sublayer, almost always in combination with a residual connection. Modern designs favor the pre-norm arrangement, normalizing the input to each sublayer before the residual addition, because it keeps the residual path clean and makes training deep stacks more stable.

The choice between layer and batch normalization comes down to data shape and where the meaningful statistics live. Batch normalization, normalizing across examples, suits the convolutional neural network on fixed-size image grids; layer normalization, normalizing across features, suits sequence and attention models. Related variants such as RMSNorm simplify the computation further by dropping the mean subtraction, and they are now common in large language models for their efficiency.
