---
title: Machine Learning
slug: machine-learning
kind: technique
category: Foundations and History
aliases: ML
related: artificial-intelligence, deep-learning, neural-network, perceptron, connectionism, the-bitter-lesson
summary: A branch of artificial intelligence in which a system improves at a task by fitting patterns in data instead of following hand-written rules. It answers a specific obstacle: most of what we know how to do, we cannot say how we do, so we supply examples and let the program recover the rule.
---

We can recognize a friend's face in a crowd, catch the sarcasm in a sentence, and keep a bicycle upright, and we cannot explain how we do any of it. Michael Polanyi named this gap "we know more than we can tell," and it is the exact obstacle machine learning exists to route around. For most tasks worth automating, nobody can write the rulebook, because the knowledge is tacit, lodged below the level we can put into words. So instead of coding the answer, machine learning fits it: you supply many examples and an algorithm adjusts its own parameters until it reproduces them, recovering a rule no person could have written down.

This inverts the older meaning of programming. Arthur Samuel, whose 1959 checkers program improved by playing thousands of games against itself, gave the field its name with a paper titled "Some Studies in Machine Learning Using the Game of Checkers." (The definition often quoted as his, learning "without being explicitly programmed," is a later paraphrase, but it captures the move exactly.) Letting a system get better with experience rather than with more instructions is the bet the whole field rests on, and the bitter lesson is its long-run scoreboard: general methods that learn from more data and more computation have repeatedly overtaken systems hand-built from human expertise.

A learning system has three parts, and they recur in everything from linear regression to a frontier model: a model with adjustable parameters, a loss function that scores how wrong its current predictions are, and an optimization procedure, almost always a form of gradient descent, that tunes the parameters to drive the loss down. The classical settings differ mainly in what the data looks like. Supervised learning fits labeled input-output pairs; unsupervised learning finds structure in unlabeled data; reinforcement learning learns from rewards earned by acting, the setting of Samuel's self-playing checkers.

The catch that defines the craft is that fitting the examples is not the goal; performing on examples never seen is. A model with enough capacity can memorize its training data perfectly and stay useless, having absorbed the noise instead of the pattern, which is overfitting. Guarding against it, by holding out data the model is never allowed to see during training and trusting only those numbers, is the discipline that separates a system that works in the world from one that merely looked good in the lab. Nearly everything else in the field is a variation on one tension: fit the data closely enough to capture the signal, but not so closely that you also capture its accidents.
