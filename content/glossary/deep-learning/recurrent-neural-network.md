---
title: Recurrent Neural Network
slug: recurrent-neural-network
kind: technique
category: Deep Learning Architectures
aliases: RNN, recurrent network
related: lstm, vanishing-gradient, attention-mechanism, backpropagation, activation-function, multilayer-perceptron
summary: A neural network for sequential data that maintains a hidden state passed from one time step to the next, letting it process inputs of variable length while carrying context forward through the sequence.
---

A recurrent neural network processes a sequence one element at a time while maintaining a hidden state, a vector that summarizes everything seen so far. At each time step the network combines the current input with the previous hidden state to produce a new hidden state, and optionally an output. Because the same weights are applied at every step, an RNN can handle sequences of any length, which makes it a natural fit for text, speech, and time series where a multilayer perceptron with its fixed input size does not apply.

RNNs matter because they were the first widely successful architecture for sequential modeling, framing a sequence as a recurrence rather than a fixed feature vector. The hidden state acts as a form of memory: in principle, information from early in the sequence can influence predictions made much later. This made RNNs the standard tool for language modeling, machine translation, and handwriting recognition before attention-based models displaced them.

Training an RNN uses backpropagation through time, which unrolls the recurrence into a deep feedforward graph, one layer per time step, and applies the usual chain rule. This is exactly where the difficulty lies. Repeatedly multiplying gradients by the same recurrent weight matrix across many steps tends to shrink them toward zero or blow them up, the vanishing gradient and exploding gradient problems. The result is that a plain RNN struggles to learn dependencies that span long distances, even though its architecture nominally allows them.

This limitation is the direct reason gated variants were invented. The LSTM and the related GRU add gates and a separate cell state that let gradients flow across many steps without vanishing, extending the effective memory of the network. RNNs and their gated descendants were the dominant sequence models for years, until the attention mechanism and the transformer removed the sequential bottleneck entirely by letting every position attend to every other in parallel.
