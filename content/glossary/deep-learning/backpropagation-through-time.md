---
title: Backpropagation Through Time
slug: backpropagation-through-time
kind: technique
category: Deep Learning Architectures
aliases: BPTT, backpropagation through time
related: backpropagation, recurrent-neural-network, lstm, gradient-clipping, vanishing-gradient
summary: How a recurrent network is trained: unroll the loop across the time steps into one long feed-forward graph, then run ordinary backpropagation over it, so a gradient at the final step flows back through every earlier step. It is also where the vanishing and exploding gradient problems are born, because the same weights are multiplied through over and over.
---

A recurrent network applies the same weights at every step of a sequence, feeding its own state forward in a loop, which makes it unclear at first how to train with backpropagation, an algorithm defined for a fixed feed-forward graph. Backpropagation through time resolves this by unrolling: conceptually lay the recurrence out flat, copying the network once per time step into a single long graph, and then it is just an ordinary feed-forward network that standard backpropagation can handle.

The consequence of unrolling is that the gradient at the last step must travel backward through every step before it. The error at time one hundred propagates back to time one by repeated multiplication through the same recurrent weight matrix, and that repeated multiplication is exactly where the trouble starts: if the relevant factors are less than one the gradient shrinks toward zero over many steps, the vanishing gradient, and if greater than one it blows up, the exploding gradient. This is the mechanical reason plain recurrent networks struggle to learn long-range dependencies.

The fixes follow from the diagnosis. Exploding gradients are tamed bluntly with gradient clipping, capping the update so one huge gradient cannot wreck training. Vanishing gradients needed an architectural answer, which is what the LSTM provided: a gated memory path along which the gradient can flow without being repeatedly attenuated, the constant error carousel. In practice, unrolling over a very long sequence is also expensive, so training often uses truncated backpropagation through time, cutting the unrolled graph into manageable chunks.

Backpropagation through time is worth understanding even in the transformer era, because it explains both why recurrent networks were the natural sequence model and why they were so hard to scale. The transformer's parallel attention sidestepped the whole issue by removing the step-by-step recurrence that BPTT must traverse, which is precisely the deletion that let sequence models finally train efficiently at length.
