---
title: Learning Rate Schedule
slug: learning-rate-schedule
kind: technique
category: Optimization
aliases: learning rate decay, LR schedule, annealing schedule
related: learning-rate, gradient-descent, stochastic-gradient-descent, momentum, adam, loss-landscape
summary: A rule that varies the learning rate over training rather than holding it fixed, usually large early for fast exploration and shrinking toward the end so the optimizer can settle precisely. With stochastic gradient descent it does double duty, because shrinking the rate also cools the gradient noise exactly when the model needs to converge.
---

A learning-rate schedule sets the step size as a function of how far training has progressed, rather than fixing one value from the first update to the last. The dominant pattern lowers the rate over time, an idea borrowed straight from simulated annealing: take large, exploratory steps early when the parameters are far from any solution, then progressively smaller, more careful steps as the optimizer closes in on a minimum. The rate is high when boldness pays and low when precision does.

The schedule exists because no single learning rate is ideal throughout training, the tension covered under learning rate itself. A high fixed rate makes fast initial progress but then bounces around the bottom of the valley in the loss landscape and never settles; a low fixed rate settles cleanly but wastes enormous time getting there and risks stalling early on a saddle point. A schedule resolves the conflict across time, capturing the speed of a large rate at the start and the precision of a small one at the finish, which usually yields both faster training and a lower final loss than any constant rate.

A handful of standard shapes recur. Step decay multiplies the rate by a factor at fixed milestones; exponential and polynomial decay shrink it smoothly; cosine annealing follows a cosine curve down toward zero and is the common choice for large models, sometimes with warm restarts that periodically jump the rate back up to escape one basin and explore another. Nearly all of these are paired with warmup, a short opening phase that ramps the rate up from near zero to stabilize the volatile first steps, especially for very deep networks and large batches.

A schedule is largely orthogonal to the choice of optimizer and layered on top of it. Even adaptive methods like Adam and RMSprop, which already give each parameter its own effective rate, benefit from an outer schedule on the global rate, because per-parameter adaptation handles direction-to-direction differences but not the overall need to slow down near the end. With stochastic gradient descent the schedule does double duty that is easy to miss: shrinking the rate also shrinks the effective gradient noise, so the exploration that helped early is quieted at exactly the moment the model needs to converge into a minimum. Annealing the step size is, quietly, annealing the temperature of the search.
