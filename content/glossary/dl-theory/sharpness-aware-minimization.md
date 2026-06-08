---
title: Sharpness-Aware Minimization
slug: sharpness-aware-minimization
kind: technique
category: Deep Learning Theory
aliases: SAM
related: flat-minima, loss-landscape, hessian, gradient-descent, generalization, implicit-regularization
summary: An optimizer that minimizes not the loss at a point but the worst-case loss in a small ball around it, steering training toward flat, low-curvature minima. Its contribution is to make flatness a training target rather than an after-the-fact property of solutions, which it buys with a clever two-step update costing roughly two gradients per step.
---

Sharpness-aware minimization is built around the observation that flat minima generalize better than sharp ones. Ordinary gradient descent drives down the loss at the current parameter values, which says nothing about how loss behaves nearby, so it can happily descend into a narrow, steep basin. Sharpness-aware minimization, introduced by Foret and colleagues in 2020, changes the objective so the optimizer cares about the neighborhood: instead of minimizing the loss at the weights, it minimizes the maximum loss over a small ball around them, so a solution is accepted only if the whole local region, not just the center, has low loss.

The method implements this with a clever two-step update that keeps it practical. Each iteration first takes a small ascent step in the gradient direction to find the nearby point of highest loss, the worst case inside the neighborhood, then computes the gradient at that perturbed point and uses it to update the original weights with a normal descent step. So each iteration costs roughly two gradient evaluations instead of one, and the net effect is that the update direction reflects the curvature of the basin: in a sharp basin the ascent step lands somewhere with a very different, larger gradient, which pushes the optimizer toward flatter regions.

Sharpness-aware minimization matters because it converts a descriptive insight into a usable tool, and that is the contribution. The link between flatness and generalization had been understood for years through the Hessian and the loss landscape, but it described a property of solutions after the fact rather than a way to reach them. By optimizing a sharpness-penalized objective directly, sharpness-aware minimization made flatness a training target, and it delivered consistent gains in test accuracy and robustness across image classifiers and, later, language and vision transformers, with especially clear benefits when training data is noisy or limited.

Conceptually, it makes the implicit regularization of stochastic training explicit and controllable. Where small batches and large learning rates bias ordinary training toward flat basins as a side effect, sharpness-aware minimization aims at them deliberately and consistently. It has spawned a family of variants that reduce its overhead or adapt the neighborhood to each parameter's geometry, and it remains active, including debate over exactly which notion of sharpness is right to penalize, since sharpness can be sensitive to reparameterization. As both a practical optimizer and a bridge between landscape geometry and generalization, it is one of the clearest demonstrations that how you search the landscape, not just where you end up, shapes how well a model generalizes.
