---
title: Decision Tree
slug: decision-tree
kind: technique
category: Core Machine Learning
aliases: decision trees, classification tree, regression tree
related: random-forest, overfitting, supervised-learning, support-vector-machine, regularization
summary: A model that predicts by asking a sequence of plain yes-or-no questions about the features, narrowing the data at each step until it reaches an answer. It is one of the very few models a non-specialist can read directly, and a single tree is unstable enough that its real importance is as the building block of the ensembles that dominate tabular data.
---

A decision tree predicts the way a careful person troubleshoots: by asking a sequence of narrowing questions. Starting at the root it asks a question about one feature, is income above a threshold, branches on the answer, asks again at the next node, and keeps narrowing the data until it reaches a leaf holding the prediction, a class label or a number. The path from root to leaf is just a chain of plain conditions, which gives the tree a property almost no other model has: a non-specialist can read exactly why it made any single prediction, which is priceless wherever a decision must be justified.

Beyond legibility, trees are unfussy. They handle numeric and categorical features together, need almost no preprocessing, ignore irrelevant features automatically, and capture nonlinear interactions without any hand-built feature engineering, which is why they work so well on the messy, mixed-type tables that make up most real-world data. The price of all that flexibility is paid in variance, and it is steep.

A tree is grown greedily and top down. At each node the algorithm searches over features and split points for the division that best separates the data, scored by a purity measure such as Gini impurity or information gain, then recurses on each piece. Left unchecked it keeps splitting until every leaf is pure, which means it has memorized the training data: a deep, fully grown tree is a textbook overfitter, and worse, it is unstable, a small change in the data able to reshape the whole tree. The remedies, limiting depth, requiring a minimum number of samples per leaf, or pruning branches after the fact, are all forms of regularization that trade a little training accuracy for generalization.

That instability is exactly why a single tree is rarely the final answer and almost always a component. Because one deep tree is low-bias but high-variance, averaging many decorrelated trees cancels the variance while keeping the low bias, which is precisely what a random forest and gradient-boosted trees do, and why those ensembles, not lone trees, win most tabular problems. The decision tree is best understood as the legible, weak primitive from which the strongest classical models are assembled: too unstable to trust alone, too useful to discard.
