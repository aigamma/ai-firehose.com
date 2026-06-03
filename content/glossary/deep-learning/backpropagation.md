---
title: Backpropagation
slug: backpropagation
kind: technique
category: Deep Learning Architectures
aliases: backprop, error backpropagation, reverse-mode autodiff
related: gradient-descent, chain-rule, multilayer-perceptron, vanishing-gradient, loss-function, stochastic-gradient-descent
summary: The algorithm that computes the gradient of a neural network's loss with respect to every weight by applying the chain rule backward through the network, making gradient-based training of deep models efficient and practical.
---

Backpropagation is the algorithm that makes training deep neural networks possible. To improve, a network needs to know how each of its millions or billions of weights should change to reduce the loss, which means computing the gradient of the loss with respect to every weight. Backpropagation computes all of those derivatives efficiently in a single backward pass, and without it deep learning as we know it would not exist.

It works in two phases. The forward pass runs the input through the network, layer by layer, computing each activation and finally the loss, while caching the intermediate values. The backward pass then applies the chain rule from calculus in reverse, starting at the loss and propagating the gradient back through each layer to the inputs. Because it reuses the cached activations and the gradients already computed for later layers, each weight's derivative is obtained without redundant work. This is an instance of reverse-mode automatic differentiation, and its key property is efficiency: one backward pass costs roughly the same as one forward pass, no matter how many parameters there are.

That efficiency is the whole point. A naive alternative, nudging each weight a little and measuring the change in loss, would require a separate forward pass per weight and is hopeless at scale. Backpropagation gets the entire gradient for the price of about one extra pass, which is what lets optimizers update enormous models on every training step.

The gradients it produces are consumed by an optimizer such as gradient descent or Adam, which uses them to step the weights downhill on the loss landscape. Many phenomena in deep learning are really statements about backpropagation: the vanishing gradient problem is the backward signal shrinking toward zero across many layers, and architectural ideas like the residual connection and normalization layers are in large part devices to keep that backward signal healthy. Its mathematical core is nothing more exotic than the chain rule applied with care.
