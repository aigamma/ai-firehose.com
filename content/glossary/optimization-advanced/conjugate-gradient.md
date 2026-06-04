---
title: Conjugate Gradient
slug: conjugate-gradient
kind: technique
category: Advanced Optimization
aliases: CG, conjugate gradient method
related: gradient-descent, newtons-method, lbfgs, trust-region, loss-landscape
summary: An iterative method that minimizes a quadratic by stepping along directions chosen never to undo each other's progress, reaching the exact minimum in at most n steps using only gradients and no curvature matrix. It is near-Newton speed at gradient-descent memory cost, which is why it solves the giant linear systems of scientific computing.
---

Conjugate gradient was built to cure the signature failure of steepest descent: the slow zig-zag down a stretched valley. On an elongated bowl, gradient descent steps perpendicular to the contours, so each step partly undoes the progress of the last and the optimizer crawls back and forth while only inching toward the minimum. Conjugate gradient captures much of the speed of second-order optimization while using only first-order information, and it does so by choosing its directions far more cleverly.

The fix is to pick search directions that do not interfere. Two directions are conjugate with respect to the curvature when a line search along one does not spoil the minimization already achieved along the others, so by building each new direction to be conjugate to all the previous ones, the method never has to revisit a direction it has already optimized. For a quadratic in n variables it therefore reaches the exact minimum in at most n steps, and usually far fewer when the curvature is favorable.

What makes it practical at scale is how cheaply it builds those conjugate directions: each iteration combines the current gradient with the previous search direction using a single scalar, needing only gradient evaluations and a few vectors of storage, and it never forms or inverts the Hessian that makes Newton's method intractable. That combination, near-Newton convergence on quadratics at gradient-descent memory cost, is why conjugate gradient is the default workhorse for very large sparse linear systems across scientific computing.

For the non-quadratic loss landscapes of machine learning, nonlinear conjugate gradient variants apply the same recurrence with periodic restarts, since the conjugacy guarantee holds only locally where the surface looks quadratic. In deep learning it is most visible inside other algorithms than as a top-level optimizer: trust region and Hessian-free methods use it as their inner solver to approximately apply an inverse Hessian without ever building one, and it stands conceptually beside L-BFGS as the other great way to get curvature-aware steps from gradients alone.
