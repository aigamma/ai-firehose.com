---
title: Decision Tree
slug: decision-tree
kind: technique
category: Core Machine Learning
aliases: decision trees, classification tree, regression tree
related: random-forest, overfitting, supervised-learning, support-vector-machine, regularization
summary: A supervised learning model that makes predictions by asking a sequence of simple yes-or-no questions about the features, splitting the data at each step until it reaches a leaf that holds the answer.
---

A decision tree is a supervised model shaped like a flowchart. Starting at the root, it asks a question about one feature (is income above a threshold?), branches based on the answer, and repeats at the next node, narrowing the data with each split until it reaches a leaf, where it outputs a prediction. For classification the leaf holds a class label; for regression it holds a numeric value. The path from root to leaf is a chain of conditions, which makes any single prediction easy to read and explain.

Decision trees matter for two reasons: interpretability and flexibility. Because a prediction is just a sequence of plain conditions, a tree is one of the few models a non-specialist can read directly, which is valuable wherever decisions must be justified. Trees also handle numeric and categorical features together, need little data preprocessing, ignore irrelevant features naturally, and capture nonlinear interactions without any manual feature engineering. They underpin the most successful tabular-data methods in practice.

A tree is built greedily and top down. At each node the algorithm searches over features and split points for the division that best separates the data, measured by a purity criterion such as Gini impurity or information gain for classification, or variance reduction for regression. It then recurses on each resulting subset. Left unchecked this process continues until every leaf is pure, which produces a tree that has memorized the training data: deep, fully grown trees are notorious for Overfitting. The remedies are to limit depth, require a minimum number of samples per leaf, or prune branches after the fact, all forms of Regularization that trade a little training accuracy for better generalization.

Decision trees connect to the rest of core machine learning mainly as the building block of ensembles. A single tree is high-variance, swinging substantially with small changes in the data, but averaging many decorrelated trees cancels that variance, which is exactly what a Random Forest and gradient-boosted trees do, and why those ensembles, not lone trees, win on most tabular problems. Conceptually a tree contrasts with a Support Vector Machine: a tree carves feature space into axis-aligned rectangles through a series of local decisions, rather than separating the classes with one globally optimal boundary.
