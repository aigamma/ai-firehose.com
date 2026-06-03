---
title: Perceptron
slug: perceptron
kind: technique
category: Foundations and History
aliases: perceptrons
related: neural-network, connectionism, machine-learning, deep-learning, ai-winter, symbolic-ai
summary: An early single-layer neural model introduced by Frank Rosenblatt in 1958 that learns a linear decision boundary from labeled examples. It is the ancestor of the modern artificial neuron and of connectionism.
---

The perceptron is the foundational learning model of connectionism, introduced by Frank Rosenblatt in 1958. It computes a weighted sum of its inputs, adds a bias, and outputs one of two classes depending on whether that sum crosses a threshold. Crucially, it learns: when it misclassifies an example, the perceptron learning rule nudges each weight a little in the direction that would have produced the right answer. Run over a dataset, this procedure provably converges to a separating boundary whenever one exists. Rosenblatt built it in hardware, the Mark I Perceptron, and it learned to classify simple images, which drew enormous early attention to the idea of machines that learn from data.

The perceptron matters because it is the direct ancestor of the artificial neuron used in every neural network today. A modern network is essentially a large stack of perceptron-like units with smooth activation functions in place of the hard threshold, trained by gradient descent rather than the original rule. Understanding the single unit, a linear combination of inputs followed by a nonlinearity, is the key that unlocks the rest of deep learning, because the whole edifice is built by composing and layering this one primitive.

The model also carries one of the most consequential cautionary tales in the field. In their 1969 book Perceptrons, Marvin Minsky and Seymour Papert proved that a single-layer perceptron cannot learn functions that are not linearly separable, the canonical example being exclusive-or (XOR). A lone perceptron simply cannot draw the boundary XOR requires. This limitation was real but narrow: stacking perceptrons into multiple layers removes it entirely. At the time, however, there was no known way to train such multilayer networks, and the negative result helped drain funding and enthusiasm from connectionist research, contributing to the first AI winter.

The resolution arrived in the 1980s with backpropagation, an efficient way to compute the gradients needed to train multilayer networks, which made the deep stacking of perceptron-like units practical. The perceptron thus sits at a hinge in the history of the field: powerful enough to prove that machines could learn, limited enough to nearly stall the connectionist program for a decade, and simple enough that its descendants now scale to billions of parameters.
