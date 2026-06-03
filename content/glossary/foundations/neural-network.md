---
title: Neural Network
slug: neural-network
kind: technique
category: Foundations and History
aliases: artificial neural network, neural net
related: perceptron, deep-learning, connectionism, machine-learning, symbolic-ai, the-bitter-lesson
summary: A machine learning model composed of layers of simple interconnected units, loosely inspired by biological neurons, whose connection weights are learned from data. It is the core model family behind deep learning and most modern AI.
---

An artificial neural network is a model built from many simple units, called neurons, arranged in layers and joined by weighted connections. Each neuron computes a weighted sum of its inputs, adds a bias, and passes the result through a nonlinear activation function; the outputs of one layer become the inputs of the next. The single unit is essentially a perceptron with a smooth activation in place of a hard threshold, and the network is what you get by composing many of them. Knowledge is not stored as rules but distributed across the connection weights, which is the defining commitment of connectionism.

Neural networks matter because they are the model family underneath nearly all of modern AI, from image recognition to language models. Their power comes from a property formalized as the universal approximation theorem: a network with even a single sufficiently wide hidden layer can approximate any continuous function to arbitrary accuracy. In practice, depth, stacking many layers, is what makes this efficient, because each layer can build features on top of the layer below, learning a hierarchy of representations from raw pixels or characters up to abstract concepts. This is why the term deep learning came to name networks with many layers.

The mechanism that makes them learnable is the pairing of two ideas. Backpropagation efficiently computes the gradient of the loss with respect to every weight by applying the chain rule backward through the layers, and gradient descent uses that gradient to adjust the weights toward lower error. This combination, practical since the 1980s and dramatically scaled in the 2010s, is the engine that trains the network. Without an efficient way to compute gradients for multilayer networks, the perceptron's inability to handle nonlinear problems would have remained a barrier.

The strengths and weaknesses of neural networks are the strengths and weaknesses of connectionism made concrete. They learn directly from raw data, generalize to unseen inputs, and improve with more data and more computation, exactly the scaling behavior the bitter lesson celebrates. The cost is interpretability: a trained network is millions or billions of numbers with no human-readable rules, so explaining a specific decision is hard, the opposite of a transparent expert system. Much current research, including the neuro-symbolic effort to combine networks with explicit reasoning, is aimed at keeping the learning while recovering some of that lost transparency.
