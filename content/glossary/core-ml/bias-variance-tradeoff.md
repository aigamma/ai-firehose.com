---
title: Bias-Variance Tradeoff
slug: bias-variance-tradeoff
kind: technique
category: Core Machine Learning
aliases: bias variance tradeoff, bias-variance decomposition
related: overfitting, underfitting, regularization, cross-validation, random-forest
summary: The classical decomposition of a model's error into bias, the error from being too simple, and variance, the error from being too sensitive to the training sample, which pull against each other so neither reaches zero alone. It is the organizing principle of classical machine learning, and the place modern deep learning most visibly broke the rules.
---

The bias-variance tradeoff is the closest thing classical machine learning has to a unifying law. Take a model's expected error on new data and it splits into three pieces: bias, the error from wrong or oversimplified assumptions, how far the model's average prediction sits from the truth; variance, the error from sensitivity to the particular training sample, how much the prediction would jump if you retrained on a different draw of data; and irreducible noise that no model can touch. Nearly every modeling decision is a move in the space those first two terms define.

The reason it is a tradeoff and not just a list is that bias and variance pull in opposite directions. A simple model makes strong assumptions, so it is stable across samples but systematically wrong, high bias and low variance, which is underfitting. A complex model can fit almost anything, so it tracks the noise and lurches with the sample, low bias and high variance, which is overfitting. Classically there is no setting that zeroes both, so every model lives somewhere on a U-shaped error curve, and the craft is to find its bottom: enough capacity to capture the truth, little enough to ignore the noise.

That single picture turns debugging from guesswork into diagnosis. High error on both training and validation data means bias dominates and the model needs more capacity. Low training error with high validation error means variance dominates and the model needs more constraint or more data. The standard tools map straight onto the terms: regularization buys a little bias to shed a lot of variance, an ensemble like a random forest averages away variance while keeping bias low, and cross-validation locates the curve's minimum empirically.

Then deep learning broke the picture, which is exactly what makes the tradeoff worth understanding deeply. Networks with billions of parameters have the capacity to memorize their training data outright, so the classical curve says they should overfit catastrophically, yet they generalize beautifully. The reconciliation, named double descent by Belkin and colleagues in 2019, is that the U-curve is only the first half of the story: push capacity past the interpolation threshold, the point where the model fits the training data exactly, and the test error, having risen, starts to fall again, sometimes below the classical sweet spot. The tradeoff is not wrong, it is incomplete, describing the underparameterized regime that ruled machine learning for fifty years but not the overparameterized one the modern field actually lives in. Knowing both halves is knowing why a result that should be impossible under the old rules is the foundation of the new ones.
