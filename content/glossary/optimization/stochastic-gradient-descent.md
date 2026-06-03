---
title: Stochastic Gradient Descent
slug: stochastic-gradient-descent
kind: technique
category: Optimization
aliases: SGD, mini-batch gradient descent
related: gradient-descent, learning-rate, momentum, adam, loss-function, learning-rate-schedule
summary: A variant of gradient descent that estimates the gradient from a small random sample of the data at each step rather than the full dataset, trading exact gradients for far cheaper and more frequent parameter updates.
---

Stochastic gradient descent is the practical form of gradient descent used to train almost every modern neural network. Plain batch gradient descent computes the gradient of the loss function over the entire training set before taking a single step, which is accurate but prohibitively slow once a dataset has millions of examples. Stochastic gradient descent instead draws one example, or more commonly a small random mini-batch, estimates the gradient from just that sample, and updates the parameters immediately. Over an epoch it makes thousands of small steps instead of one large one.

The word stochastic refers to the randomness introduced by sampling. Each mini-batch gradient is a noisy estimate of the true full-data gradient, correct on average but wrong on any individual step. This noise is not purely a cost. It lets the optimizer escape shallow traps that would stall an exact method, jittering the parameters out of a poor local minimum or off a saddle point where the true gradient is near zero. The same noise is why the loss curve during training is jagged rather than perfectly smooth.

Mechanically each update still follows the gradient descent rule: move the parameters a small amount against the estimated gradient, scaled by the learning rate. Mini-batch size is the knob that trades variance for throughput. Larger batches give smoother, more reliable gradient estimates and use hardware more efficiently, but they take fewer steps per epoch and can converge to sharper, less generalizable solutions. Smaller batches are noisier but often generalize better. Because the noise scale and the step size interact, the learning rate usually needs retuning when the batch size changes.

Stochastic gradient descent is the foundation that the accelerated and adaptive optimizers build on. Momentum smooths the noisy SGD trajectory by averaging recent gradients, while Adam and RMSprop additionally rescale each parameter's step by a running estimate of its gradient magnitude. A learning-rate schedule is almost always layered on top, lowering the step size over training so the noise that helped early exploration does not prevent the model from settling into a minimum at the end.
