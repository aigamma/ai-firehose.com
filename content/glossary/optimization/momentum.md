---
title: Momentum
slug: momentum
kind: technique
category: Optimization
aliases: heavy ball method, Nesterov momentum
related: gradient-descent, stochastic-gradient-descent, learning-rate, adam, rmsprop, loss-landscape
summary: An enhancement to gradient descent that gives the optimizer inertia: it steps not by the raw gradient but by a running average of recent gradients, a velocity. The payoff is in narrow ravines, where the back-and-forth components cancel while the true downhill direction accumulates, turning a zig-zagging crawl into a smooth glide.
---

Momentum gives gradient descent inertia. Instead of stepping purely by the gradient under its feet, the optimizer keeps a velocity vector, an exponentially decaying average of recent gradients, and steps by that. The image is a heavy ball rolling down the loss landscape: it does not react only to the slope directly beneath it but carries the momentum of where it has already been, accelerating down long consistent grades and shrugging off small bumps that would deflect a weightless point.

The reason this helps is a geometry that defeats plain gradient descent: the long, narrow ravine, steeply walled across and gently sloped along its length. There the raw gradient points mostly across the valley, so the optimizer zig-zags between the walls while creeping only slowly toward the minimum at the far end. Momentum dissolves the problem almost exactly. The across-valley components of successive gradients point in opposite directions and cancel in the running average, while the along-valley components all point the same way and accumulate. Oscillation is damped, progress toward the real minimum speeds up, and the pathology that most slows naive descent simply goes away.

The mechanism is two coupled steps: update the velocity as a blend of its old value, scaled by a momentum coefficient (commonly around 0.9), and the new gradient, then move the parameters by that velocity scaled by the learning rate. The coefficient sets how much history is retained, higher values giving more inertia and smoothing but a greater tendency to overshoot. A widely used refinement, Nesterov momentum, peeks ahead by evaluating the gradient at the point the velocity is about to carry the parameters to rather than at the current point, which yields a slightly more responsive, less overshoot-prone correction.

Momentum is a core ingredient of the optimizers that dominate deep learning. Stochastic gradient descent with momentum is a strong, well-understood baseline, and its smoothing is doubly valuable there because it averages away some of the noise that mini-batch sampling injects. Adam fuses this same first-moment momentum with the per-parameter scaling of RMSprop, which is why Adam can be read in one line as momentum plus adaptive learning rates. The heavy ball, it turns out, is one of the most reused ideas in all of optimization.
