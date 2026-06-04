---
title: Classification
slug: classification
kind: technique
category: Core Machine Learning
aliases: classifier, binary classification, multiclass classification, multi-label classification
related: supervised-learning, logistic-regression, support-vector-machine, precision-and-recall, cross-entropy, regression
summary: The supervised task of sorting an input into one of a fixed set of categories, the default shape of a machine learning problem. Its deepest reach is hidden in plain sight: a language model predicting its next token is doing classification over the vocabulary, so the task that recognizes spam also writes prose.
---

Classification is the task of sorting an input into one of a fixed, finite set of categories: spam or not spam, the digit zero through nine, the species of an iris. The model is shown inputs paired with their correct categories during training, and afterward must assign one of those categories to inputs it has never seen. This is what separates it from regression, whose output is a continuous number rather than a label, and it is the shape into which an enormous fraction of machine learning problems are cast, because the moment a task is framed as choosing from a fixed menu, the whole toolbox of classifiers becomes available.

The structure of the label set defines the sub-varieties. Binary classification has exactly two classes and is the simplest and most studied case. Multiclass has three or more mutually exclusive classes, each input getting exactly one. Multi-label relaxes the exclusivity, letting an input carry several labels at once, as a photo might be tagged both beach and sunset. A great deal of practical work is the act of reducing a messy real problem to one of these three clean shapes.

Mechanically, most modern classifiers do not emit a hard label but a vector of scores, one per class, converted into probabilities by a softmax, with the highest-probability class chosen. Training adjusts the model so those predicted probabilities match the true labels, usually by minimizing cross-entropy. Logistic regression is the canonical linear classifier and, not coincidentally, the exact form of the output layer of most neural classifiers. The probabilistic output is valuable in its own right, because a calibrated confidence lets a system abstain or escalate when it is unsure rather than blindly guess.

Evaluating a classifier is more subtle than counting correct answers, and getting this wrong is the most common beginner's mistake. Raw accuracy is misleading whenever the classes are imbalanced: a detector for a disease present in one percent of patients can be ninety-nine percent accurate by always predicting "healthy" while catching no cases at all. This is why classification is judged with precision and recall, which separate the two ways a prediction can be wrong, and with the confusion matrix that lays out every combination of predicted and true class. Which metric matters depends on which error is costlier in the application, a judgment the math cannot make for you.

The reach of classification is wider than it first appears, and that is the thing to remember. It is the setting in which capacity, overfitting, and generalization were first studied, and the output mode of most deep networks. But its deepest instance is hidden in plain sight: next-token prediction in a language model is classification over the vocabulary, choosing the next token from tens of thousands of options, and object detection is classification applied to many image regions at once. The humble task that recognizes handwritten digits is, scaled up, the same task that writes essays.
