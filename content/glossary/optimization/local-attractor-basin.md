---
title: Local Attractor Basin
slug: local-attractor-basin
kind: technique
category: Optimization
aliases: basin of attraction, attractor basin
related: local-minimum, loss-landscape, gradient-descent, stochastic-gradient-descent, saddle-point, loss-function
summary: The catchment area around a local minimum, the set of starting points that flow downhill into it. Which basin a model lands in is effectively decided early, by initialization and the high-learning-rate opening of training, and the basin's width is tied to generalization: wide and flat tends to generalize, sharp and narrow tends not to.
---

A local attractor basin is the catchment area of a local minimum in the loss landscape. Release a ball anywhere inside the basin, let it roll downhill, and it ends at the same minimum at the bottom; formally it is the set of starting parameter values from which a gradient-following optimizer converges to that particular minimum. The landscape is partitioned into many such basins, one per minimum, separated by the ridges and saddle points that mark where the flow tips one way rather than another.

The basin reframes what actually decides the outcome of training: not only the optimizer, but which basin the initial parameters fall into and how the early trajectory navigates between basins. Two runs from different random initializations can descend into different basins and reach genuinely different solutions even at similar loss. The decisive consequence is that the basin is chosen early, by the initialization scheme and the opening high-learning-rate phase of training, long before any fine-tuning, which is why those early choices matter so much more than their brief duration would suggest.

The geometry of the basin is tied directly to generalization, one of the most useful ideas in modern optimization. A wide, flat basin means the loss stays low across a broad region of parameter space, so small perturbations to the weights barely change the error, and such solutions tend to perform well on unseen data. A narrow, sharp basin means the model sits at the bottom of a steep pit where any displacement spikes the loss, and these tend to generalize worse. Much of the practical art of training is, implicitly, steering toward wide basins.

The optimizers in common use interact with basins in revealing ways. The sampling noise in stochastic gradient descent acts like a temperature, letting the optimizer hop the low barriers between basins and tending to settle in wider, flatter ones, because narrow basins are easy to be knocked out of. Momentum supplies inertia that can carry the parameters across a ridge into a neighboring, possibly better, basin that plain gradient descent would never escape. A learning-rate schedule then cools this exploration over time, freezing the optimizer into one basin as the rate shrinks toward the end. The whole trajectory is a slow commitment from many possible basins down to the one the model ships with.
