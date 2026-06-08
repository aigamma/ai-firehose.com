---
title: Monte Carlo Methods
slug: monte-carlo-methods
kind: technique
category: Probability and Information Theory
aliases: Monte Carlo methods, Monte Carlo simulation, Monte Carlo estimation
related: monte-carlo-tree-search, importance-sampling, markov-chain, expectation, variance
summary: A family of techniques that compute hard quantities by random sampling: when an integral, an expectation, or a probability is intractable to calculate exactly, draw many random samples and average. The estimate's error shrinks with the number of samples in a way that, remarkably, does not depend on how many dimensions the problem has.
---

Some quantities are easy to define and impossible to compute exactly: the expected value of a complicated random process, a high-dimensional integral, the probability of a rare event. Monte Carlo methods sidestep the exact calculation by sampling. Draw many random instances, evaluate the quantity on each, and average; by the law of large numbers, that average converges to the true value. The name, after the casino, captures the spirit: harness randomness deliberately to estimate what you cannot derive.

The property that makes Monte Carlo indispensable is how its error scales. The standard error of the estimate falls as one over the square root of the number of samples, and, crucially, that rate is independent of the dimension of the problem. Classical numerical integration grids become hopeless as dimensions grow, the curse of dimensionality, but Monte Carlo's convergence rate does not care whether the integral is over three variables or three thousand, which is why it is the only practical approach for the high-dimensional integrals that fill physics, finance, and machine learning.

The basic recipe has powerful refinements, most of which are about variance reduction, since halving the error otherwise takes four times the samples. Importance sampling draws from a distribution that concentrates on the region that matters, then reweights, cutting variance when the naive sampler would rarely visit the important part. Markov chain Monte Carlo builds a random walk whose stationary distribution is the target, which is how Bayesian inference samples from posteriors no one can write down in closed form. Monte Carlo tree search applies the same sample-and-average idea to decision trees.

Monte Carlo methods run quietly under much of computational science and machine learning: they estimate the intractable expectations in Bayesian inference, the returns in reinforcement learning, and the integrals in physics simulation. The trade they offer is always the same, an exact answer you cannot get exchanged for an approximate one you can, with error you control by spending more samples, which makes "just sample it" one of the most general and reliable tools in all of applied mathematics.
