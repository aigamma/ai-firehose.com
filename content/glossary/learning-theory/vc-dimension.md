---
title: VC Dimension
slug: vc-dimension
kind: technique
category: Learning Theory
aliases: VC dimension, Vapnik-Chervonenkis dimension, VC
related: pac-learning, sample-complexity, generalization, inductive-bias, empirical-risk-minimization, double-descent
summary: A measure of a model class's capacity, the size of the largest set of points it can label in every possible way. It governs how many samples you need and how tightly training error predicts true error, and its most instructive feature is its failure: the VC dimension of a modern network is enormous, yet such networks generalize, which is what pushed the field past it.
---

The VC dimension, named for Vladimir Vapnik and Alexey Chervonenkis, quantifies how flexible a family of classifiers is, not by counting parameters but by asking how many points the family can fit in every possible way. A class is powerful in this sense if it can carve up data into many different labelings, and that power is exactly what makes it both able to learn rich patterns and liable to memorize noise. Capacity, the theory insists, is about expressive flexibility, not raw parameter count, though the two often track each other.

The definition rests on shattering. A set of points is shattered by a class if, for every possible assignment of binary labels to those points, some classifier in the class realizes that labeling, and the VC dimension is the size of the largest set the class can shatter. For lines in the plane the answer is three: any three points in general position can be split in all eight ways by a line, but no set of four can, since the exclusive-or arrangement defeats every line. In d dimensions a linear classifier with a bias has VC dimension d plus one, matching the intuition that more parameters usually buy more capacity.

VC dimension matters because it turns a vague notion of complexity into a single number that drives the core theorems of learning. A class is PAC learnable if and only if its VC dimension is finite, the sample complexity for a given accuracy grows roughly in proportion to it, and the fundamental theorem of statistical learning bounds the generalization gap by a quantity that grows with the VC dimension and shrinks as the square root of the sample size. Fewer effective degrees of freedom relative to the data means a tighter guarantee that low training error implies low test error, which is the quantitative backbone of the bias-variance tradeoff and of model selection: a class with small VC dimension is safe but may be too rigid to express the target, a strong inductive bias, while a large one expresses more but risks overfitting.

The catch, and the most instructive thing about it, is that VC dimension is a worst-case, distribution-free quantity, and it badly mispredicts modern overparameterized networks, whose VC dimension is astronomical yet which generalize well. The double descent phenomenon, where test error falls again past the point of zero training error, lies entirely outside what classical VC bounds anticipate. VC dimension remains essential for understanding capacity and for the theory of simpler models, but it is not the whole story for deep learning, which is precisely what pushed the field toward data-dependent and algorithm-dependent measures of complexity.
