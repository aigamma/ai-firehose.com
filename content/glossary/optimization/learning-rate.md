---
title: Learning Rate
slug: learning-rate
kind: technique
category: Optimization
aliases: step size, alpha
related: gradient-descent, stochastic-gradient-descent, learning-rate-schedule, momentum, adam, loss-landscape
summary: The scalar that decides how far gradient descent steps each update, multiplying the gradient before it is subtracted from the parameters. It is the single most important hyperparameter in training, and the reason no single value is ever right is that the ideal step changes as training proceeds and differs across parameters.
---

The learning rate answers one question, asked again at every step: given the downhill direction, how far do we actually walk before looking again? After the gradient of the loss is computed, the optimizer does not move by the full gradient but multiplies it by the learning rate, a small positive scalar, and subtracts that. It is the smallest piece of the training recipe and the one most likely to decide whether training succeeds or fails outright, which is why it is the hyperparameter to tune first.

It sits at the center of the speed-versus-stability tradeoff that governs all of training. Set it too high and the steps overshoot the bottom of each valley in the loss landscape, bouncing across the walls or diverging to infinity; set it too low and training is stable but glacial, and more likely to stall in the first shallow minimum or flat region it meets. The usable band is often narrow and problem-specific, which is why practitioners search over learning rates on a logarithmic scale, trying 0.1, 0.01, 0.001, rather than tuning any other single value first.

The reason a single good value is so hard to pin down is that the ideal step size is not constant: it changes through training and even across parameters. Early on, far from any solution, large steps make rapid progress; late in training, near a minimum, those same large steps stop the model from settling. And different directions in the loss landscape curve by wildly different amounts, so a step right for one parameter is wrong for another. Those two facts motivate the two standard responses: a learning-rate schedule that shrinks the global step over time, and adaptive optimizers like Adam and RMSprop that hand each parameter its own effective rate by dividing by a running estimate of its gradient magnitude.

Because its effect is so outsized, a small industry of tricks exists just to find and exploit the usable band. The learning-rate range test briefly ramps the rate up and watches where the loss starts to fall and where it explodes, bracketing the good region; warmup starts deliberately small and ramps up to avoid early instability while the parameters are still random. Momentum interacts with it too, since accumulated velocity effectively amplifies the step, so the two are tuned together. Get the learning rate right and most other choices become forgiving; get it wrong and nothing else can rescue the run.
