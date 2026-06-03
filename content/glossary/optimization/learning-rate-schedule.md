---
title: Learning Rate Schedule
slug: learning-rate-schedule
kind: technique
category: Optimization
aliases: learning rate decay, LR schedule, annealing schedule
related: learning-rate, gradient-descent, stochastic-gradient-descent, momentum, adam, loss-landscape
summary: A rule that changes the learning rate over the course of training rather than holding it fixed, typically starting larger for fast early progress and shrinking toward the end so the optimizer can settle precisely into a minimum.
---

A learning-rate schedule is a recipe for varying the learning rate as training proceeds. Instead of choosing one step size and using it from the first update to the last, a schedule specifies the rate as a function of the step or epoch count. The most common pattern lowers the rate over time, an idea borrowed from simulated annealing: take large, exploratory steps early when the parameters are far from any solution, then progressively smaller, more careful steps later as the optimizer approaches a minimum.

It matters because no single learning rate is ideal throughout training, a tension described under learning rate itself. A high fixed rate makes fast initial progress but then bounces around the bottom of the valley in the loss landscape and never settles. A low fixed rate settles cleanly but wastes enormous time getting there and risks stalling early in a shallow local minimum or on a saddle point. A schedule resolves the conflict across time: it captures the speed of a large rate at the start and the precision of a small rate at the finish, which usually yields both faster training and a lower final loss than any constant rate.

There are several standard shapes. Step decay multiplies the rate by a factor at fixed milestones. Exponential and polynomial decay shrink it smoothly. Cosine annealing follows a cosine curve down to near zero and is widely used for training large models, sometimes with warm restarts that periodically jump the rate back up to escape a basin and explore another. Almost all of these are paired with warmup, a short opening phase that ramps the rate up from near zero, which stabilizes the volatile first steps of training, especially for very deep networks and large batch sizes.

A schedule is largely orthogonal to the choice of optimizer and is layered on top of it. Even adaptive methods like Adam and RMSprop, which already give each parameter its own effective rate, benefit from an outer schedule on the global learning rate, since the per-parameter adaptation handles direction-to-direction differences but not the overall need to slow down near the end. With stochastic gradient descent the schedule does double duty: shrinking the rate also shrinks the effective gradient noise, so the exploration that helped early on is quieted exactly when the model needs to converge into a minimum.
