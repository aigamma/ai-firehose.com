---
title: Machine Learning
slug: machine-learning
kind: technique
category: Foundations and History
aliases: ML
related: artificial-intelligence, deep-learning, neural-network, perceptron, connectionism, the-bitter-lesson
summary: A branch of artificial intelligence in which systems improve at a task by learning patterns from data rather than following rules written by hand. The program is fit to examples instead of being explicitly programmed.
---

Machine learning is the approach to artificial intelligence in which behavior is learned from data rather than specified by a programmer. Instead of writing rules that say how to recognize a cat, you supply many labeled images and let an algorithm adjust its internal parameters until it predicts the labels well. Arthur Samuel, who built a checkers program that improved by playing itself, described the goal in 1959 as giving computers "the ability to learn without being explicitly programmed." That shift, from coding the answer to fitting it, is the central move of the field.

The reason machine learning matters is that for most interesting problems nobody can write down the rules. There is no compact rulebook that distinguishes spoken words, reliably translates languages, or detects fraud, but there is abundant data in which the patterns are latent. Machine learning extracts those patterns. This data-driven philosophy is exactly what the bitter lesson argues has won repeatedly over hand-engineered knowledge: general methods that learn from more data and more computation tend to overtake carefully crafted rule systems.

Mechanically, a learning system has three parts: a model with adjustable parameters, a loss function that scores how wrong its predictions are, and an optimization procedure, usually some form of gradient descent, that tunes the parameters to reduce the loss. The work splits into three classical settings. Supervised learning fits input-output pairs, as in classification and regression. Unsupervised learning finds structure in unlabeled data, as in clustering. Reinforcement learning learns by acting in an environment and receiving rewards, the setting of Samuel's self-playing checkers and of modern game-playing agents.

Machine learning is broader than its most famous subset. A neural network is one model family among many, alongside decision trees, support vector machines, and linear models, and deep learning is the particular branch that stacks many neural layers. The recurring challenge across all of them is generalization: a model must perform on data it has never seen, not merely memorize the training set. Guarding against overfitting, where a model learns noise instead of signal, is the discipline that separates a model that works in deployment from one that only looked good in the lab.
