---
title: Conformal Prediction
slug: conformal-prediction
kind: technique
category: Probabilistic Machine Learning
aliases: conformal prediction, conformal inference
related: uncertainty-estimation, calibration, bayesian-inference, classification
summary: A way to turn any model's raw output into a prediction set that is guaranteed, with a chosen probability, to contain the true answer, without assuming anything about the model or the data distribution beyond exchangeability. Instead of a single best guess, it returns a set whose size grows when the model is unsure, and that coverage guarantee is distribution-free and provable.
---

Most uncertainty methods give you a confidence number you then have to trust. Conformal prediction gives you something stronger and stranger: a prediction set that is mathematically guaranteed to contain the true answer at least, say, 90 percent of the time, and it does this for any underlying model, with no assumption about the data distribution beyond a mild one. You wrap your existing classifier or regressor, and out comes not a point prediction but a set, with a coverage promise attached.

The mechanism is disarmingly simple. Hold out a calibration set the model did not train on, and score how wrong the model is on each of those known examples, building up a distribution of its typical error. For a new input, include in the prediction set every candidate answer whose error score falls within that typical range, cutting off at the quantile that corresponds to the coverage you want. Because the calibration examples and the new one are exchangeable, draws from the same pool, the coverage guarantee follows from a counting argument, not from any belief about how the data was generated.

The keeper property is that the set size becomes the honest signal. On an easy, familiar input the prediction set collapses to a single confident answer; on a hard or unusual one it widens to include several, visibly flagging the model's uncertainty rather than hiding it behind a smooth probability. A wide set is the method admitting, in a principled way, that it does not know, which is exactly the behavior a downstream decision wants.

Conformal prediction matters because it is model-agnostic, cheap, and comes with a real guarantee, a rare combination in uncertainty estimation, where most methods trade rigor for tractability. Its honest limits are that the guarantee is marginal (it holds on average, not for every individual input or subgroup unless you work harder) and that it assumes exchangeability, which distribution shift breaks. Even so, as a way to attach a trustworthy, distribution-free hedge to a black-box model, it has become one of the most practical tools for deploying predictions you can actually act on.
