---
title: Kolmogorov Arnold Network
slug: kolmogorov-arnold-network
kind: technique
category: Frontier Architectures
aliases: KAN, KANs, Kolmogorov-Arnold networks
related: neural-ode, energy-based-model, world-model
summary: A network that places learnable nonlinear functions on the connections between nodes instead of fixed activations on the nodes, drawing on the Kolmogorov-Arnold representation theorem. Because each edge is an explicit one-dimensional curve, a trained KAN can be inspected directly, plotted, pruned, sometimes read off as a symbolic formula, which makes it interpretable and parameter-efficient on smooth, scientific problems.
---

A Kolmogorov-Arnold network, or KAN, rethinks where the nonlinearity lives. A standard multilayer perceptron applies a fixed activation function, such as ReLU, at each node, and learns linear weights on the edges between nodes; a KAN inverts this arrangement. The edges carry learnable univariate functions, typically represented as splines, and the nodes simply sum the incoming function outputs. There are no fixed activations and no linear weight matrices in the usual sense; the learnable objects are the shapes of the edge functions themselves.

The architecture is motivated by the Kolmogorov-Arnold representation theorem, a result from the late 1950s stating that any continuous multivariate function can be written as a finite composition of sums of continuous functions of a single variable. In other words, a high-dimensional function can in principle be built entirely from one-dimensional pieces added together, and a KAN is a practical, deepened, trainable generalization of this idea: rather than seeking the exact two-layer decomposition the theorem describes, it stacks many layers of learnable univariate functions and fits them by gradient descent.

The keeper is what the edge-function design buys: inspectability. Because each edge is an explicit one-dimensional curve, a trained KAN can be examined directly, you can plot the learned function on each connection, prune the ones that are near zero, and in favorable cases read off a compact symbolic formula the network has discovered. On smooth, structured, or scientific problems this can give comparable or better accuracy than a much larger multilayer perceptron, with far fewer parameters and a more interpretable result, and the splines can be refined to higher resolution after training, adding capacity locally where the function is complex.

The trade-offs are real and worth stating plainly. The per-edge spline computation is heavier than a simple matrix multiply, so KANs can train more slowly and are harder to accelerate on current hardware, and their advantages are clearest on low-dimensional or physics-flavored tasks rather than large-scale perception or language. KANs connect to neighboring frontier ideas through their emphasis on interpretability and function approximation: like the neural ODE they treat the learned object as a smooth mathematical function rather than an opaque weight tensor, and they are most often proposed for scientific discovery and for components of a world model where understanding the learned relationship is as valuable as the prediction itself.
