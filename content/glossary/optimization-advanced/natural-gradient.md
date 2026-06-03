---
title: Natural Gradient
slug: natural-gradient
kind: technique
category: Advanced Optimization
aliases: natural gradient descent, Fisher information optimization
related: gradient-descent, newtons-method, mirror-descent, geodesic, conjugate-gradient
summary: An optimization method that rescales the gradient by the inverse Fisher information matrix, following the direction of steepest descent in the geometry of the model's probability distributions rather than in raw parameter coordinates.
---

The natural gradient corrects a subtle but consequential assumption hidden inside ordinary gradient descent: that the distance between two parameter settings is just the Euclidean distance between their coordinate values. For a model that outputs probability distributions, this is the wrong notion of distance. A small numerical change to one parameter might leave the predicted distribution almost unchanged, while an equally small change to another might transform it completely. Steepest descent in raw coordinates therefore moves too timidly in some directions and too aggressively in others, and its behavior depends arbitrarily on how the model happens to be parameterized.

The natural gradient measures distance instead by how much the output distribution actually changes, using the Kullback-Leibler divergence as the yardstick. Locally, that divergence is described by the Fisher information matrix, which acts as a metric tensor on the space of distributions, turning it into a curved manifold. The natural gradient is the ordinary gradient multiplied by the inverse of this Fisher matrix. The result is the direction of steepest descent measured in the intrinsic geometry of the model, not in the accidental geometry of its coordinates, so the update is invariant to reparameterization: rescale or rename the parameters and the natural gradient still points the same way through distribution space.

Structurally this looks exactly like Newton's method, a gradient premultiplied by the inverse of a curvature matrix, but the curvature object is different. Newton uses the Hessian of the loss, which encodes the shape of the error surface. The natural gradient uses the Fisher information, which encodes the shape of the family of distributions and is always positive semidefinite, so it cannot produce the ascent steps that destabilize Newton far from a minimum. This connects directly to information geometry, where a natural-gradient step is the first-order move along a geodesic on the statistical manifold, and it is a close cousin of mirror descent, which likewise replaces Euclidean geometry with one matched to the problem.

In practice the Fisher matrix is as large as the Hessian and just as infeasible to invert directly for a big network, so the method survives through approximations. K-FAC factors the Fisher into manageable per-layer blocks; natural policy gradients and Trust Region Policy Optimization use a Fisher-based step to keep reinforcement learning updates from changing the policy too drastically in one move. The enduring idea is that the right preconditioner for a probabilistic model is dictated by its information geometry, not by the arbitrary axes its weights are written in.
