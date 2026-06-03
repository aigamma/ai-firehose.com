---
title: Supervised Learning
slug: supervised-learning
kind: technique
category: Core Machine Learning
aliases: supervised machine learning
related: unsupervised-learning, reinforcement-learning, overfitting, cross-validation, decision-tree, support-vector-machine
summary: A machine learning paradigm in which a model learns a mapping from inputs to outputs by training on examples that are already labeled with the correct answer.
---

Supervised learning is the most widely used branch of machine learning. The defining feature is the training data: every example comes as an input paired with the correct output, the label, and the model's job is to learn the function that connects the two. After training on enough labeled pairs, the model should generalize, producing accurate outputs for new inputs it has never seen. The two canonical tasks are classification, where the output is a discrete category (spam or not spam), and regression, where the output is a continuous number (tomorrow's temperature).

Supervised learning matters because most of the commercially valuable problems in machine learning are framed this way. Image recognition, fraud detection, medical diagnosis, machine translation, and credit scoring are all supervised tasks at heart. The paradigm is powerful precisely because the labels give an unambiguous target: the model knows exactly what it is supposed to predict, and progress can be measured directly by comparing predictions against held-out answers.

Mechanically, a supervised learner defines a loss function that quantifies how wrong its predictions are, then adjusts its parameters to drive that loss down across the training set. For models like a Decision Tree the fitting is combinatorial, splitting the data to separate the labels; for differentiable models the loss is minimized by Gradient Descent. The persistent danger is Overfitting: a model can memorize the training labels rather than learn the underlying pattern, which is why practitioners always evaluate on data withheld from training, typically through Cross-Validation.

Supervised learning sits in contrast to Unsupervised Learning, which finds structure in unlabeled data, and Reinforcement Learning, which learns from rewards rather than explicit labels. The dividing line is the supervision signal. Its main practical cost is that labels are expensive: a human often has to annotate every example, which makes large labeled datasets a scarce and valuable resource and motivates semi-supervised and self-supervised methods that try to learn from mostly unlabeled data.
