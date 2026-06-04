---
title: Bayesian Optimization
slug: bayesian-optimization
kind: technique
category: Advanced Optimization
aliases: BO, sequential model-based optimization
related: evolutionary-strategy, simulated-annealing, gradient-descent
summary: A sample-efficient optimizer for expensive black-box functions that fits a probabilistic surrogate of the objective, predicting both a value and a calibrated uncertainty everywhere, and uses an acquisition function to spend each costly evaluation on the single most informative point. It is the standard tool for hyperparameter tuning, where every query means a full training run.
---

Bayesian optimization is the method of choice when each evaluation of the objective costs minutes, hours, or real money, so you cannot afford the thousands of queries gradient descent or an evolutionary strategy would consume. Its canonical use is hyperparameter tuning, finding the learning rate, depth, and regularization that make a model train best when assessing any single configuration means running a full training job. The entire goal is to reach a good optimum in as few evaluations as possible, and every design choice serves that.

It does so by being model-based and deliberate. Bayesian optimization fits a probabilistic surrogate, most often a Gaussian process, to the points evaluated so far, and the surrogate predicts not just an expected objective value at every untried point but a calibrated uncertainty about that prediction, low where data is dense and high where the space is unexplored. This map of belief and doubt over the whole search space is what lets the method reason about where to look next instead of merely reacting to its last sample.

The next point is chosen by maximizing an acquisition function, a cheap criterion computed from the surrogate that scores how worthwhile each candidate would be to evaluate. Popular choices like expected improvement and upper confidence bound explicitly balance exploitation, sampling where the surrogate predicts a good value, against exploration, sampling where its uncertainty is large and a surprise might hide. The method then evaluates the true expensive objective only at that single winning point, folds the result back into the surrogate, and repeats, so each costly query is spent on the most informative location the current belief can identify, which is the whole reason it reaches good solutions in dramatically fewer evaluations than gradient-free competitors.

This makes Bayesian optimization the standard tool for sample-constrained tuning across machine learning, drug and materials discovery, expensive simulations, and physical experiment design. Its limitation mirrors its strength: maintaining and inverting the Gaussian process grows costly as evaluations accumulate, and it is built for low-dimensional, expensive problems rather than the high-dimensional, cheap-gradient setting where gradient descent dominates. Within the derivative-free family it is the sample-efficient, model-based extreme, contrasting with the model-free random search of simulated annealing and the population sampling of evolutionary strategies.
