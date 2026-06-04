---
title: Recurrent Neural Network
slug: recurrent-neural-network
kind: technique
category: Deep Learning Architectures
aliases: RNN, recurrent network
related: lstm, vanishing-gradient, attention-mechanism, backpropagation, activation-function, multilayer-perceptron
summary: A network for sequences that carries a hidden state from one step to the next, so it can process inputs of any length while threading context forward. The same shared weights that give it this memory are also its undoing: applied over and over down a long sequence, they make gradients vanish, which is exactly the limit attention removed.
---

A recurrent neural network processes a sequence one element at a time while maintaining a hidden state, a vector that summarizes everything seen so far. At each step the network combines the current input with the previous hidden state to produce a new hidden state, and optionally an output. Because the same weights are applied at every step, an RNN can handle sequences of any length, which makes it a natural fit for text, speech, and time series where a multilayer perceptron with its fixed input size does not apply.

RNNs were the first widely successful architecture for sequential modeling, framing a sequence as a recurrence rather than a fixed feature vector. The hidden state acts as a form of memory: in principle, information from early in the sequence can influence predictions made much later, and that made RNNs the standard tool for language modeling, machine translation, and handwriting recognition before attention-based models displaced them.

Training uses backpropagation through time, which unrolls the recurrence into a deep feedforward graph, one layer per time step, and applies the usual chain rule, and this is exactly where the trouble lives. The very weight-sharing that lets an RNN handle any length means the gradient is repeatedly multiplied by the same recurrent weight matrix across many steps, which tends to shrink it toward zero or blow it up, the vanishing and exploding gradient problems. So a plain RNN struggles to learn dependencies that span long distances even though its architecture nominally allows them, the strength and the weakness being the same shared weights.

That limitation is the direct reason gated variants were invented. The LSTM and the related GRU add gates and a separate cell state that let gradients flow across many steps without vanishing, extending the effective memory of the network. RNNs and their gated descendants were the dominant sequence models for years, until the attention mechanism and the transformer removed the sequential bottleneck entirely by letting every position attend to every other in parallel, trading the recurrence for direct access.
