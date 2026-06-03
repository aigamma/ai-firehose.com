---
title: Regularization
slug: regularization
kind: technique
category: Core Machine Learning
aliases: regularize, L1 regularization, L2 regularization, weight decay
related: overfitting, underfitting, bias-variance-tradeoff, cross-validation, support-vector-machine
summary: A family of techniques that constrain or penalize a model's complexity during training in order to reduce overfitting and improve how well it generalizes to new data.
---

Regularization is the deliberate practice of constraining a model so it does not fit its training data too closely. The most common form adds a penalty term to the loss function that grows with the size of the model's parameters, so the optimizer must balance fitting the data against keeping the parameters small. Simpler, smaller-weight solutions are favored, and the model is discouraged from contorting itself to chase every fluctuation in the training set. Regularization is the most direct lever against Overfitting.

Regularization matters because unconstrained flexible models almost always overfit, and adding more data is not always possible. By penalizing complexity, regularization lets a practitioner use an expressive model class while keeping its effective capacity in check, capturing the genuine signal without memorizing the noise. In the vocabulary of the Bias-Variance Tradeoff, it trades a small increase in bias for a large reduction in variance, which usually lowers total error on unseen data.

The two classic penalties behave differently. L2 regularization, also called weight decay, penalizes the sum of squared weights and shrinks them all smoothly toward zero without eliminating any. L1 regularization penalizes the sum of absolute weights and drives many of them exactly to zero, performing feature selection by producing a sparse model. A strength parameter controls how hard the penalty pushes, and it is typically chosen by Cross-Validation: set it too high and the model underfits, too low and the regularization fails to bite. Beyond these penalties, dropout, early stopping, and data augmentation are all regularizers in spirit, since each constrains what the model can learn.

Regularization connects to nearly every other core technique. A Support Vector Machine builds it directly into its objective by maximizing the margin, which is a form of L2 control. Ensemble averaging in a Random Forest is an implicit regularizer that reduces variance. The unifying idea is the recognition that the goal of training is not to fit the training data perfectly but to generalize, and that the path to generalization runs through controlled simplicity rather than unconstrained fit.
