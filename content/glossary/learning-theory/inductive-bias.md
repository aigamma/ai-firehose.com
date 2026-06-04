---
title: Inductive Bias
slug: inductive-bias
kind: technique
category: Learning Theory
aliases: inductive bias, learning bias, model bias
related: no-free-lunch-theorem, occams-razor, generalization, double-descent, universal-approximation-theorem, vc-dimension
summary: The set of assumptions a learner uses to generalize beyond its training data, the preferences that pick one hypothesis when the data alone cannot. Any finite sample fits infinitely many functions, so a learner must lean on something, and that something, smoothness, simplicity, the symmetries baked into an architecture, is the currency that buys generalization.
---

Inductive bias is the collection of prior assumptions a learning algorithm brings to a problem, the preferences that let it choose one hypothesis over another when the data alone do not decide. Any finite training set is consistent with infinitely many functions, so to predict a label for an unseen input a learner must lean on something beyond the examples, and that something is its inductive bias. Without it, generalization is impossible, because the data provide no logical basis for preferring one extrapolation over another.

The necessity is not a heuristic observation but a theorem. The no free lunch theorem proves that, averaged over all possible problems, every algorithm performs identically, so any method that beats chance on real tasks does so only because its built-in assumptions happen to fit those tasks. Inductive bias is therefore the currency that buys generalization: a bias toward smooth functions, toward simple explanations as in Occam's razor, or toward symmetries present in the data is what converts memorized examples into reliable prediction, and the art of machine learning is largely the art of choosing a bias aligned with the structure of the domain.

It takes many concrete forms, which is the part worth cataloguing. It can be a hard restriction on the hypothesis space, like fitting only linear functions, captured quantitatively by the VC dimension; a soft preference expressed through regularization that penalizes large weights and so favors simpler solutions; or an architectural commitment, as convolutional networks assume translation equivariance and locality for images, recurrent and attention mechanisms assume structure in sequences, and graph networks assume relational structure. It can even be implicit in the optimizer, since gradient descent on overparameterized models tends to find low-norm or flat-minimum solutions with no explicit penalty, a bias that helps explain the second descent in double descent.

There is a tradeoff at the heart of the concept. A strong bias, like assuming linearity, makes learning data-efficient and stable when the assumption is correct, but caps what the model can represent and causes underfitting when the truth lies outside its reach; a weak bias, as in a very flexible network, can represent almost anything, which the universal approximation theorem guarantees in principle, but demands far more data to pin down the right function and risks overfitting. Matching the strength and shape of the bias to the amount of data and the nature of the task is the recurring design decision, and it is why no single architecture dominates across every domain.
