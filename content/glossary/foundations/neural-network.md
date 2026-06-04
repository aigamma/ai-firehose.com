---
title: Neural Network
slug: neural-network
kind: technique
category: Foundations and History
aliases: artificial neural network, neural net
related: perceptron, deep-learning, connectionism, machine-learning, symbolic-ai, the-bitter-lesson
summary: A model built from many simple units, each a weighted sum followed by a nonlinearity, with the connection strengths learned from data. Nothing in it is a rule: the knowledge is the numbers, and stacking the units deep enough turns that pile of numbers into the substrate of modern AI.
---

The unsettling thing about a neural network is how little is in it. One unit takes a weighted sum of its inputs, adds a bias, and bends the result through a nonlinear activation function; that is the entire vocabulary. There are no rules, no facts, no symbols anywhere in the system, only a large pile of connection weights and a recipe for combining them. Stack enough of these trivial units into layers, let each layer feed the next, and the pile becomes able to recognize faces, translate languages, and write code. Much of deep learning is the discovery that this is genuinely enough.

Why it is enough has a precise answer with a surprising twist. The universal approximation theorem proves that a network with a single hidden layer, made wide enough, can approximate any continuous function to whatever accuracy you want. In principle, one layer suffices for anything. In practice almost no one builds that way, because a shallow network can need an astronomically large number of units to capture what a deep one captures with comparatively few. Depth lets each layer build features on top of the layer below, edges into shapes into objects, so a representation is composed rather than enumerated. The theorem says shallow is possible; reality says deep is efficient, and the distance between those two facts is where the word "deep" earns its keep.

A unit is essentially a perceptron with a smooth activation in place of the original hard threshold, and that smoothness is what makes the whole stack trainable. Because every operation is differentiable, backpropagation can work out how the final error depends on each individual weight by applying the chain rule backward through the layers, and gradient descent can then nudge every weight toward less error. This pairing, available in principle since the 1980s and unleashed by GPUs and large datasets in the 2010s, is the engine. Without an efficient gradient for multilayer networks, the perceptron's notorious inability to handle nonlinear problems would still be a wall.

The strengths are connectionism's strengths made concrete: a network learns from raw data, generalizes to inputs it never saw, and keeps improving as data and compute grow, the scaling behavior the bitter lesson rewards. The cost is written into the same design that grants the power. Because the knowledge is smeared across millions or billions of numbers with no human-readable rule attached, no one can fully say why a given output appeared, the exact transparency an expert system had and a network surrenders. The entire field of interpretability exists to buy back some of what was traded away the moment intelligence was reduced to a pile of weights that happens to work.
