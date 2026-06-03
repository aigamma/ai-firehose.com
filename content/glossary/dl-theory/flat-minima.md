---
title: Flat Minima
slug: flat-minima
kind: technique
category: Deep Learning Theory
aliases: flat minimum, wide minima, sharp minima
related: loss-landscape, hessian, generalization, sharpness-aware-minimization, implicit-regularization, stochastic-gradient-descent
summary: Minima of the loss where the loss stays low across a wide neighborhood of the parameters, a low-curvature basin that is empirically linked to better generalization than a narrow, sharp minimum.
---

Flat minima are solutions in the loss landscape whose surrounding region is broad and shallow rather than narrow and steep. At a flat minimum you can perturb the weights by a noticeable amount and the training loss barely rises; at a sharp minimum the same perturbation sends the loss climbing quickly. The distinction is about the geometry of the basin, not its depth: two minima can have identical training loss yet very different widths. The idea dates to Hochreiter and Schmidhuber in 1997 and became central once researchers began asking why some zero-loss solutions generalize and others do not.

The reason flatness is thought to matter is the gap between the training loss and the test loss. The test loss surface is a slightly shifted copy of the training surface, because the test data differs from the training data. If a minimum is sharp, that small shift can move you off the steep wall and into high loss, so the solution is fragile to the train-to-test change. If the minimum is flat, the shifted surface is still low across the whole wide basin, so the solution is robust. Flatness is therefore a proxy for insensitivity to perturbation, and minimum description length arguments give it an information-theoretic reading too: a flat minimum needs fewer bits to specify because its parameters can be stated imprecisely.

Curvature makes the notion quantitative. The local sharpness of a minimum is read off the hessian of the loss, the matrix of second derivatives: large eigenvalues mean steep directions and a sharp minimum, small eigenvalues mean a flat one. This connects flat minima directly to implicit-regularization, because the noise in stochastic-gradient-descent and the use of larger learning rates and smaller batch sizes bias training away from sharp basins and toward flat ones. Large-batch training, by contrast, tends to find sharper minima and often generalizes worse, one of the more reproducible observations linking optimization choices to test performance.

Because flatness correlates with generalization, the field built optimizers that target it on purpose. Sharpness-aware-minimization explicitly seeks parameters whose entire neighborhood has low loss, rather than just a low value at a point, and related methods average weights along the trajectory to settle into wider basins. Flat minima are not a complete theory of generalization, since flatness can be reparameterized and is not invariant in every sense, and the debate over those caveats is active. Still, the picture of training as a search for wide, stable valleys in the loss landscape is one of the most useful intuitions in deep learning and ties together curvature, optimizer noise, and why overparameterized models do not simply overfit.
