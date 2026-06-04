---
title: Integral
slug: integral
kind: technique
category: Calculus and Analysis
aliases: integration, integrals, antiderivative
related: derivative, taylor-expansion, gradient, partial-derivative, convexity, chain-rule
summary: The accumulation of a continuously varying quantity into a total, such as the area under a curve, and the inverse of the derivative. In machine learning it matters because probability is built on it: every expectation, every normalizing constant, every continuous loss is an integral, and the fact that most of them cannot be solved exactly is why so much of the field is sampling.
---

An integral accumulates a quantity that varies continuously, summing infinitely many infinitesimal contributions into a finite total. The definite integral of a function over an interval is the signed area between its graph and the horizontal axis, defined rigorously as the limit of sums of thin rectangles as their width shrinks to zero. The indefinite integral, or antiderivative, runs the derivative backward: it is the family of functions whose derivative is the given function. The fundamental theorem of calculus ties the two together, showing that differentiation and integration are inverse operations and that a definite integral can be evaluated through an antiderivative.

The integral matters in machine learning because probability is built on it. A continuous probability density means nothing except through integration: the probability of an event is the integral of the density over a region, the normalizing constant that makes a density valid is an integral over all outcomes, and an expectation, the average of a function under a distribution, is an integral of that function weighted by the density. Training objectives are very often expectations, so the loss a model minimizes is frequently an integral in disguise, and reasoning about it correctly means reasoning about integration.

The decisive practical fact is that most integrals arising in modeling cannot be solved in closed form, and that single obstacle shapes much of the field's machinery. High-dimensional integrals over latent variables or parameters are approximated rather than computed: Monte Carlo sampling estimates an expectation by averaging over random draws, and variational methods replace an intractable integral with a tractable bound. This is why probabilistic and generative models look the way they do, why sampling is so central to them, and why the word "intractable" appears so often, since it almost always means an integral nobody can do.

The integral is the natural counterpart to the derivative that anchors the rest of this category. Where the derivative and the gradient report instantaneous rates of change, the integral accumulates change back into totals, and the two are bound by the fundamental theorem. The same accumulation idea appears in continuous-time models, where a system's state is the integral of its rate of change, including the neural differential equations that treat a network's forward pass as integration along a trajectory. Understanding integration alongside differentiation completes the basic toolkit on which probability, expectation, and continuous modeling all rest.
