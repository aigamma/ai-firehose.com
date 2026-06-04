---
title: Generalization
slug: generalization
kind: technique
category: Learning Theory
aliases: generalize, generalization gap, out-of-sample performance
related: vc-dimension, pac-learning, double-descent, inductive-bias, empirical-risk-minimization, sample-complexity
summary: The ability of a trained model to perform well on new, unseen data from the same distribution, rather than merely fitting the examples it saw. It is the entire goal of supervised learning, and the central open puzzle of the field is why hugely overparameterized networks, which can memorize random labels, generalize anyway.
---

Generalization is the whole point of machine learning. A model that simply memorizes its training set has learned nothing useful; what matters is performance on data it has never seen, on fresh draws from the same underlying distribution that produced the training data. The gap between a model's error on the training set and its expected error on new data is the generalization gap, and keeping that gap small while also keeping training error low is the dual objective every learning procedure is really chasing.

The classical account is the bias-variance tradeoff. A model too simple has high bias, unable to represent the target and underfitting both training and test data; a model too flexible has high variance, fitting the training data and its noise so closely that it swings wildly on new inputs, the failure called overfitting. The sweet spot sits between, with just enough capacity to capture the signal but not so much that it chases the noise, which is why capacity measures like the VC dimension matter: they bound how large the generalization gap can be for a model class of a given flexibility.

Statistical learning theory makes these intuitions rigorous, and a practical toolbox operationalizes them. A PAC guarantee is precisely a high-probability bound on the generalization gap, sample complexity tells you how many examples drive that gap below a tolerance, and empirical risk minimization generalizes well exactly when the model class is restricted enough that low sample error reliably implies low true error, while no method generalizes for free, since the no free lunch theorem ties any above-chance generalization to an inductive bias matched to the problem. In practice, regularization penalizes complex solutions, early stopping halts before overfitting, data augmentation enlarges the effective sample, dropout injects noise against fragile co-adaptation, and a held-out validation and test set estimate the gap before deployment.

Deep learning has complicated the classical story in instructive ways, and explaining it is one of the most active questions in current theory. Modern networks have far more parameters than training examples and can fit random labels perfectly, which by old reasoning should mean catastrophic overfitting, yet they often generalize remarkably well, and the double descent curve shows test error falling a second time once a model is pushed well past the interpolation threshold, contradicting the simple U-shaped tradeoff. Why overparameterized models generalize, through implicit regularization, the geometry of the loss landscape, and the optimizer's bias toward flat or simple solutions, is the puzzle the field is still working out.
