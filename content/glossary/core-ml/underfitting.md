---
title: Underfitting
slug: underfitting
kind: technique
category: Core Machine Learning
aliases: underfit, underfitted
related: overfitting, bias-variance-tradeoff, regularization, cross-validation
summary: The opposite failure to overfitting: a model too simple to capture the real pattern, so it does poorly on the training data and on new data alike. It is the easy failure to diagnose, high error everywhere, and the floor you have to clear before overfitting is even worth worrying about.
---

Underfitting is the failure you can see coming. Where an overfit model is secretly broken, scoring beautifully on its training data while failing on everything else, an underfit model fails honestly and in plain sight: it is too simple, too rigid, to capture the real structure in the data, so it does poorly on the examples it trained on and equally poorly on new ones. Training error is high and test error is roughly as high, because the model never learned much of anything. Fitting a straight line to data that clearly curves is the textbook case, and the symptom, bad everywhere, makes it the easy pathology to recognize.

It matters because it is the other way a model can fail, and the cure is the exact reverse of the cure for overfitting, which is why mixing them up wastes effort pushing the wrong lever. An overfit model needs to be reined in; an underfit model needs to be set free: add features, raise the polynomial degree or tree depth, cut back excessive regularization, or switch to a more expressive model class. The first job in diagnosing a struggling model is deciding which of the two failures you are looking at, because the two demand opposite moves.

In the vocabulary of the bias-variance tradeoff, underfitting is the high-bias regime. Bias is the error baked in by a model's own assumptions, the systematic gap between the shapes it can express and the shape the truth actually has. An underfit model has high bias and low variance: its predictions are stable across different training samples but consistently off, because it is imposing a form the data does not have. Reducing that bias means adding capacity, which raises variance, which is exactly the tension the tradeoff names, and underfitting is simply living too far toward the rigid end of it.

Underfitting is the lower bound on a model's usefulness, the floor you have to clear before overfitting becomes a concern at all. The healthy workflow often starts on purpose at that floor, with a simple model that underfits, then adds capacity until training error is acceptable, then reins the new capacity back in with regularization and checks the result with cross-validation so it does not tip over into overfitting. Good modeling is the search for the balance point between these two errors, and underfitting marks the side you should always pass through first.
