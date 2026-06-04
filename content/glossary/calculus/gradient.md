---
title: Gradient
slug: gradient
kind: technique
category: Calculus and Analysis
aliases: gradients, grad, nabla
related: partial-derivative, derivative, directional-derivative, jacobian, hessian, chain-rule
summary: The vector of all of a function's partial derivatives, which points in the direction of steepest increase and whose length is that steepest rate. It is arguably the single most important object in machine learning, because training a model is, almost literally, the act of repeatedly stepping against it.
---

The gradient bundles a function's separate sensitivities into one geometric object: it is the vector whose components are the partial derivatives of a scalar function, one per input. Its defining property is directional. At any point, the gradient points in the direction in which the function increases most steeply, and its length is the rate of that steepest ascent. Step directly against it and you descend the function as fast as is locally possible, which is the entire idea of how a model learns.

The gradient is arguably the single most important object in machine learning, because training is the act of following it. A loss function assigns an error to every setting of a model's parameters, and its gradient with respect to those parameters tells the optimizer which way and how strongly to adjust each one. Gradient descent just takes repeated small steps opposite the gradient. Every modern network, from a small classifier to a frontier language model, is fit by computing this vector and stepping against it, over and over, billions of times.

The gradient ties the rate of change in any direction to a single vector through the directional derivative: the rate of change along a given unit direction is the dot product of the gradient with that direction. This is why the gradient points the way of steepest ascent, since a dot product is largest when the two vectors align. It also explains a key geometric fact that recurs in constrained optimization: the gradient is always perpendicular to the level sets, the contours of constant value, because moving along a contour changes nothing and so has zero dot product with the gradient.

In practice the gradient is almost never formed by hand. Automatic differentiation, via the chain rule applied backward through a computation graph, which is backpropagation, produces it exactly and cheaply for functions with billions of inputs. The gradient sits in the middle of a hierarchy of derivative objects: it is the first-order derivative of a scalar function, the Jacobian generalizes it to vector-valued functions by stacking many gradients as rows, and the Hessian is its own derivative, the matrix describing how the gradient itself changes and thus the local curvature that second-order optimizers exploit.
