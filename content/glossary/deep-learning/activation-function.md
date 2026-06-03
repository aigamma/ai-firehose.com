---
title: Activation Function
slug: activation-function
kind: technique
category: Deep Learning Architectures
aliases: activation, nonlinearity, transfer function
related: relu, multilayer-perceptron, vanishing-gradient, backpropagation, lstm, gradient-descent
summary: The nonlinear function applied to a neuron's weighted sum, which gives a neural network the ability to model nonlinear relationships; without it, stacked layers would collapse into a single linear map.
---

An activation function is the nonlinear function a neuron applies to its weighted sum of inputs before passing the result on. After a layer computes a linear combination of its inputs plus a bias, the activation transforms that scalar elementwise, introducing the curvature that lets the network represent relationships a straight line cannot. Common choices include the sigmoid, the hyperbolic tangent, ReLU, and ReLU's many variants.

The activation function matters because it is what makes depth meaningful. A composition of purely linear layers is itself just one linear layer, so a network without nonlinear activations, no matter how many layers it has, could only ever fit a linear function. Inserting a nonlinearity between layers breaks that collapse and is what allows a multilayer perceptron to satisfy the universal approximation theorem and a deep network to build complex features from simple ones. The activation is the single ingredient that separates deep learning from linear regression stacked on itself.

The mechanism interacts tightly with training, because backpropagation must pass gradients through the activation, multiplying by its derivative at each layer. This makes the shape of the function consequential. The classic sigmoid and tanh saturate for large positive or negative inputs, where their derivative approaches zero, and multiplying many such small derivatives across a deep network is a primary cause of the vanishing gradient. The bounded, smooth tanh and the gating sigmoid are still valuable in specific roles, such as the gates of an LSTM, where their range between zero and one is exactly what is wanted.

The history of deep learning is partly a history of better activation functions. The shift from saturating sigmoids to the non-saturating ReLU was a major reason very deep networks became trainable, and later refinements like Leaky ReLU, GELU, and SiLU trade off smoothness, the handling of negative inputs, and gradient behavior. Choosing an activation is a real design decision: it shapes how gradients flow, how fast gradient descent converges, and whether a deep stack trains at all.
