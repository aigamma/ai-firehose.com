---
title: Sample Complexity
slug: sample-complexity
kind: technique
category: Learning Theory
aliases: sample complexity, sample efficiency, data efficiency
related: pac-learning, vc-dimension, generalization, empirical-risk-minimization, inductive-bias, no-free-lunch-theorem
summary: The number of training examples a learner needs to reach a target accuracy with a target confidence, the data cost of learning. It scales roughly linearly with the model class's capacity, and it carries a striking asymmetry: tightening the error bar costs far more data than tightening the failure probability.
---

Sample complexity is the data-cost question of machine learning: how many labeled examples does an algorithm need before it can reliably learn a concept? Formally it is the number of training samples required to reach a chosen accuracy with a chosen confidence, making precise the intuition that some problems are learnable from a handful of cases while others demand vast datasets. Where computational complexity counts operations, sample complexity counts examples, and in the data-hungry regime of modern machine learning it is often the binding constraint.

The notion gets its rigorous meaning inside the PAC framework, whose parameters it inherits directly. To be probably approximately correct, a learner must achieve error below a tolerance epsilon with probability at least one minus delta, and the sample complexity is the count of examples sufficient to meet both targets. Standard results show this count growing polynomially in one over epsilon but only logarithmically in one over delta, an asymmetry worth internalizing: demanding higher accuracy is expensive while demanding higher confidence is cheap, so tightening the error bar costs far more data than tightening the failure probability.

The dominant factor in sample complexity is the capacity of the hypothesis class, measured by the VC dimension, and the fundamental theorem of statistical learning shows the required sample count scales roughly linearly with it: a more expressive class, able to fit more patterns, needs proportionally more data to pin down the right hypothesis and keep the generalization gap small. This is the formal version of the everyday observation that complex models need more data, and it is why empirical risk minimization is trustworthy only once the sample size exceeds the level set by the class capacity; below it, low training error says little about true error.

Sample complexity is also why inductive bias is so valuable in practice. A well-chosen bias shrinks the effective hypothesis class, lowers its capacity, and so reduces the examples needed to learn, which is precisely why convolutional structure lets vision models learn from fewer images and why strong priors enable few-shot learning. The no free lunch theorem marks the boundary on this gain: no bias lowers sample complexity across all problems at once, only on those it actually fits, so data efficiency is bought with assumptions and paid for elsewhere. Pursuing better sample efficiency, through transfer learning, pretraining, active learning, and richer priors, is one of the central engineering goals of the field, since data is frequently the scarcest and most expensive resource of all.
