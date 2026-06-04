---
title: Flat Minima
slug: flat-minima
kind: technique
category: Deep Learning Theory
aliases: flat minimum, wide minima, sharp minima
related: loss-landscape, hessian, generalization, sharpness-aware-minimization, implicit-regularization, stochastic-gradient-descent
summary: Minima where the loss stays low across a wide neighborhood of the weights, low-curvature basins empirically linked to better generalization than narrow, sharp ones. The reason is robustness: the test loss surface is a slightly shifted copy of the training one, so a wide basin stays low under the shift while a sharp one falls off its steep wall.
---

Flat minima are solutions in the loss landscape whose surrounding region is broad and shallow rather than narrow and steep. At a flat minimum you can perturb the weights by a noticeable amount and the training loss barely rises; at a sharp minimum the same perturbation sends the loss climbing fast. The distinction is about the geometry of the basin, not its depth, since two minima can have identical training loss yet very different widths. The idea dates to Hochreiter and Schmidhuber in 1997 and became central once researchers began asking why some zero-loss solutions generalize and others do not.

The reason flatness is thought to matter is the gap between training loss and test loss. The test loss surface is a slightly shifted copy of the training surface, because the test data differs from the training data, and that single fact drives everything: if a minimum is sharp, the small shift can move you off the steep wall into high loss, so the solution is fragile to the train-to-test change, whereas if the minimum is flat, the shifted surface is still low across the whole wide basin and the solution is robust. Flatness is a proxy for insensitivity to perturbation, and minimum-description-length arguments add an information-theoretic reading: a flat minimum needs fewer bits to specify because its parameters can be stated imprecisely.

Curvature makes the notion quantitative. The local sharpness of a minimum is read off the Hessian of the loss: large eigenvalues mean steep directions and a sharp minimum, small eigenvalues a flat one. This ties flat minima directly to implicit regularization, because the noise in stochastic gradient descent and the use of larger learning rates and smaller batch sizes biases training away from sharp basins toward flat ones. Large-batch training, by contrast, tends to find sharper minima and often generalizes worse, one of the more reproducible observations linking optimization choices to test performance.

Because flatness correlates with generalization, the field built optimizers that target it on purpose. Sharpness-aware minimization explicitly seeks parameters whose entire neighborhood has low loss rather than just a low value at a point, and related methods average weights along the trajectory to settle into wider basins. Flat minima are not a complete theory of generalization, since flatness can be reparameterized and is not invariant in every sense, and the debate over those caveats is active. Still, the picture of training as a search for wide, stable valleys is one of the most useful intuitions in deep learning, tying together curvature, optimizer noise, and why overparameterized models do not simply overfit.
