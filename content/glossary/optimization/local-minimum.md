---
title: Local Minimum
slug: local-minimum
kind: technique
category: Optimization
aliases: local minima, local optimum
related: loss-landscape, loss-function, saddle-point, local-attractor-basin, gradient-descent, stochastic-gradient-descent
summary: A point in the loss landscape lower than its whole neighborhood but not necessarily the lowest overall, where the gradient vanishes and a downhill optimizer comes to rest. Classical theory feared getting trapped in a bad one; the surprise of deep learning is that in high dimensions true local minima are rare and the ones you reach are nearly as good as the best.
---

A local minimum is a low point of the loss landscape relative to its surroundings: the loss is smaller than at every nearby point, so the gradient is zero with no downhill direction within reach, and the curvature bends upward in every direction. An optimizer that only ever moves downhill, which is what gradient descent does, naturally settles into a local minimum and stops, because from there every small step would raise the loss. The whole question is whether that resting place is good enough.

That question is the contrast with the global minimum, the single lowest point in the entire landscape. Classical optimization theory feared that gradient descent might get trapped in a poor local minimum far above the global best and hand back a bad solution as final, and for small or carefully shaped problems the fear is justified, the textbook reason a descent method can fail to find the best answer: it found a basin bottom, just not the deepest one.

Deep learning overturns this picture, and seeing why is one of the more illuminating facts in the field. In the extremely high-dimensional landscape of a large network, for a critical point to be a true local minimum the curvature must bend upward in every one of millions of directions at once, which is statistically rare; almost always at least one direction bends down, making the point a saddle, not a minimum. And the local minima that do exist tend to cluster at nearly the same low loss as the global minimum, so falling into one of them is usually fine. The classical trap is largely a non-problem at scale.

The geometry around a minimum still matters, just for a different reason than getting stuck. The basin of attraction surrounding it, the local attractor basin, decides which starting points flow into it, and the width of that basin is tied to generalization: wide, flat minima tend to generalize better than sharp, narrow ones. The noise in stochastic gradient descent helps here, bumping the optimizer out of sharp, shallow minima and biasing it toward wider basins, and momentum can carry it across small barriers that plain gradient descent would never leave. The modern worry is not which minimum traps you but which minimum generalizes.
