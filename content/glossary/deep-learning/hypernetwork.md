---
title: Hypernetwork
slug: hypernetwork
kind: technique
category: Deep Learning Architectures
aliases: hypernetwork, hypernetworks, HyperNetwork
related: neural-network, lora, parameter-efficient-fine-tuning, fine-tuning, neural-network
summary: A neural network that generates the weights of another network rather than producing a prediction directly. Instead of learning the target weights, you learn a smaller network that outputs them, which lets one model adapt to many tasks or conditions by generating a different set of weights for each.
---

Ordinarily a network's weights are the parameters you learn directly. A hypernetwork moves up a level: it is a network whose output is the weights of a second network, the main model that does the actual task. Rather than storing and training the target weights, you train the hypernetwork to produce them, often from a compact input describing the task, the input, or the desired behavior. The weights become a function to be computed rather than a fixed table to be stored.

The point of the indirection is adaptation and compression. One hypernetwork can generate a whole family of target networks, a different weight set per task, per user, or per condition, so a single trained system adapts on the fly instead of keeping a separate fine-tuned model for each case. And because the hypernetwork is usually much smaller than the weights it produces, it can be a compressed, structured way to represent a large model, generating the full weights only when needed.

The idea connects directly to parameter-efficient fine-tuning. LoRA can be read as a degenerate, static hypernetwork: instead of a network computing the weight update, a small fixed pair of low-rank factors stands in for it, and richer hypernetworks generalize that by letting the adaptation be computed from context rather than fixed. Both rest on the same bet, that the weights needed for a task have far less independent information than their raw count suggests, so they can be produced by something small.

Hypernetworks remain more a versatile research tool than a default building block, showing up in meta-learning, neural architecture search, continual learning, and conditional generation wherever generating weights on demand beats storing them. The recurring tension is that training a network to output another network's weights is harder to stabilize and scale than training the weights directly, which is why the technique is reached for when its specific leverage, fast adaptation or compact representation of many models, is worth that extra difficulty.
