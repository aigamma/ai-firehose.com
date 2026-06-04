---
title: Linear Regression
slug: linear-regression
kind: technique
category: Core Machine Learning
aliases: linear regression, ordinary least squares, OLS
related: logistic-regression, gradient-descent, loss-function, overfitting, regularization
summary: The simplest supervised model, fitting a straight-line relationship between inputs and a continuous target by minimizing squared error. Its importance is not as a cutting-edge tool but as the skeleton inside almost everything more elaborate: understand its one idea and you understand the bones of logistic regression and the neural network alike.
---

Linear regression is the model you come to understand everything else through. It predicts a continuous value as a weighted sum of the input features plus an offset, and fitting it means choosing the weights so the line, or hyperplane in many dimensions, sits as close to the data as possible, where closeness is the squared error between predictions and truth. That single objective, minimize the mean squared error, is its entire identity, and its plainness is exactly why it is the right place to start.

It can be solved two ways, and the fact that they agree is the instructive part. There is a closed-form solution, the normal equations, that computes the optimal weights directly with linear algebra, and there is gradient descent, which reaches the same answer by stepping downhill on the error surface. Because squared error traces a smooth bowl with a single minimum, the two routes land in the same place, which makes linear regression the cleanest possible illustration of what fitting a model even means: there is one best answer, and both a direct calculation and an iterative search arrive at it.

Its importance is foundational rather than cutting-edge, and the key realization is how much hides inside it. It is fast and interpretable, each weight being simply the effect of one feature, and it is the base case that fancier methods generalize: logistic regression swaps the continuous output for a probability, and a neural network with no hidden layers and no activation function is, literally, linear regression. Understanding this one model is understanding the skeleton that the rest of supervised learning puts flesh on.

Its assumptions are also its limits, and naming them is part of using it well. It presumes a roughly linear relationship, it is sensitive to outliers because squared error punishes a large miss disproportionately, and with many features it can overfit, which is why the regularized variants, ridge and lasso, add a penalty on the weights to keep the fit honest. Reach past linear regression when the relationship genuinely curves, but reach for it first, because the answer it gives is the one every more complex model is measured against.
