---
title: Regression
slug: regression
kind: technique
category: Core Machine Learning
aliases: regression analysis, regressor, regression task
related: supervised-learning, linear-regression, classification, loss-function, overfitting, bias-variance-tradeoff
summary: The supervised task of predicting a continuous number rather than a category, the answer to any "how much" or "how many" question. Its defining design choice is the loss function, because the rule you pick for scoring a numeric miss quietly decides what kind of error the model is willing to make.
---

Regression is the task whose answer is a quantity, not a category. Given inputs paired with their correct numeric answers, a regression model learns a function from features to a real-valued number and then predicts that number for new inputs: a price, a temperature, a person's age, a sensor reading, anything on a continuous scale. This is the dividing line from classification, which chooses from a fixed set of labels. Whenever the question is "how much" or "how many" rather than "which one," the problem is regression, and an enormous share of real-world prediction is fundamentally about magnitudes.

The continuous output also makes regression the natural language of any model that must feed a downstream calculation, since a number can be added, compared, and optimized in ways a bare category cannot, and even classification leans on it internally: a classifier that outputs class probabilities is regressing onto the unit interval before it thresholds. Demand forecasting, risk pricing, dosage estimation, time-to-failure prediction, and the value functions inside reinforcement learning are all regression at heart.

The defining design choice in regression is the loss function, and it is more consequential than it looks because it quietly encodes what kind of mistake you are willing to tolerate. Mean squared error, the average of squared gaps between prediction and truth, is the default; it has clean mathematics and corresponds to assuming Gaussian noise, but squaring makes it obsess over outliers, since one huge miss dominates the average. Mean absolute error penalizes gaps linearly and shrugs off outliers, and the Huber loss interpolates between the two. Choosing among them is not cosmetic: it is choosing whether a few large errors or many small ones is the worse outcome for your problem, a decision the optimizer then faithfully enforces.

Regression is evaluated on a continuous scale rather than by counting hits and misses. Root mean squared error reports the typical size of the error in the units of the target, and the coefficient of determination, R-squared, reports the fraction of the target's variance the model explains, one being perfect and zero being no better than always guessing the mean. Because there is no notion of a "correct class," the failure modes are about systematic bias and the spread of the residuals rather than confusion between categories, which is why plotting the residuals is a staple of regression practice.

Regression shares all the deep machinery of supervised learning with classification, and the two are best understood as the continuous and discrete faces of the same task. Both are fit by minimizing a loss on training data, both are threatened by overfitting, and both are governed by the bias-variance tradeoff. Almost every algorithm has both a classification and a regression form: a decision tree can predict a class or a number, and a neural network differs between the two only in its final layer and loss. Understanding regression as a task, separate from any one algorithm, is what lets a practitioner carry the whole toolbox from one numeric problem to the next.
