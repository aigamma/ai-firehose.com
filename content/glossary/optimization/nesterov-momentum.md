---
title: Nesterov Momentum
slug: nesterov-momentum
kind: technique
category: Optimization
aliases: Nesterov accelerated gradient, NAG, lookahead momentum
related: momentum, gradient-descent, stochastic-gradient-descent, learning-rate, convexity, loss-landscape
summary: A refinement of momentum that samples the gradient at a look-ahead point, where the velocity is about to carry the parameters, rather than where they are now. The result anticipates an overshoot instead of reacting to it after the fact, and in convex theory it reaches the optimal convergence rate any gradient-only method can achieve.
---

Nesterov momentum is a small change to ordinary momentum with an outsized effect on both its behavior and its theory. Plain momentum builds a velocity, an exponential average of past gradients, and steps along it, carrying inertia through consistent directions and damping oscillation across a ravine. Its flaw is one of timing: it computes the gradient where the parameters are now, then adds the inherited velocity on top, so the velocity is being steered by information from a point the optimizer is already leaving. Nesterov fixes the timing by first taking the momentum step to a look-ahead position, evaluating the gradient there, and only then forming the update. The gradient is sampled where the parameters are about to be, not where they are.

That look-ahead gives the method a built-in correction. If the velocity is about to overshoot, carrying the parameters past a minimum or up the far wall of a valley, the gradient at the look-ahead point already points back, so the update is tempered before the overshoot happens rather than after. Standard momentum only learns of the overshoot on the next step, once it has already occurred. The practical result is that Nesterov momentum oscillates less and tolerates a slightly more aggressive setting than plain momentum, because its anticipation keeps the trajectory in check.

The reason the method is famous lies in convex optimization theory. Yurii Nesterov showed this accelerated scheme attains a provably faster convergence rate for smooth convex functions than ordinary gradient descent, improving the error after a given number of steps from a rate scaling like one over the step count to one over its square. It was a landmark result, reaching the best rate any method using only gradients can achieve, and the look-ahead is precisely the ingredient that buys the acceleration. The informal intuition that it anticipates rather than reacts is the shadow of that formal guarantee.

In deep learning the convexity assumptions behind the theorem do not hold, but Nesterov momentum remains a useful, well-behaved option, available as a flag on most stochastic gradient descent implementations and folded into adaptive optimizers in variants like Nadam, which is Adam with Nesterov-style look-ahead. Its advantage over heavy-ball momentum on non-convex neural landscapes is modest and problem-dependent, so it is a sensible default rather than a guaranteed win, but it costs essentially nothing extra and carries the strongest theoretical pedigree of the first-order momentum methods.
