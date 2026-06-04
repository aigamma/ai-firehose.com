---
title: Gated Recurrent Unit
slug: gated-recurrent-unit
kind: technique
category: Deep Learning Architectures
aliases: GRU, gated recurrent units
related: lstm, recurrent-neural-network, vanishing-gradient, activation-function, sequence-to-sequence, backpropagation
summary: A recurrent network cell that controls its hidden state with two learned gates, an update gate and a reset gate, giving most of the long-range memory of an LSTM with fewer parameters and a simpler structure.
---

A gated recurrent unit is a building block for recurrent networks that uses learned gates to decide how its memory changes from one step to the next. It was introduced by Cho and colleagues in 2014, in the context of encoder-decoder models for machine translation, as a lighter alternative to the lstm. Like the LSTM it is designed to carry information across long stretches of a sequence without the signal decaying, but it does so with a smaller and more streamlined set of components.

The unit has two gates. The update gate decides how much of the previous hidden state to keep versus how much of a freshly computed candidate state to write in, interpolating between the old memory and a proposed new one. The reset gate decides how much of the previous state is allowed to influence that candidate in the first place, so the unit can effectively forget its past when starting a new phrase or pattern. Each gate is a small layer with a sigmoid activation function that outputs values between zero and one, acting as a soft switch. Unlike the LSTM, the gated recurrent unit keeps no separate internal cell state; it exposes a single hidden vector that is both the memory and the output.

The gated recurrent unit matters for the same reason the LSTM does: gating is the mechanism that defeats the vanishing gradient that cripples a plain recurrent-neural-network. When the update gate chooses to preserve the state, the path from one step to a distant later step is close to an identity map, so gradients flow backward through many steps during backpropagation without shrinking toward zero. This is what lets the unit learn dependencies that span dozens or hundreds of tokens, which a simple recurrent cell cannot.

The practical appeal is efficiency. With two gates instead of three and no separate cell state, the gated recurrent unit has fewer parameters and runs faster than an LSTM of the same width, while in many empirical comparisons it reaches similar accuracy. Neither cell dominates the other across all tasks, so the GRU became the default choice when compute or data was limited and the LSTM remained common where the extra capacity helped. Both were workhorses of sequence-to-sequence modeling before self-attention displaced recurrence for most large-scale language work, and both remain useful in streaming and low-resource settings where a compact stateful model is an advantage.
