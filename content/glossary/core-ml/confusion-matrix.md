---
title: Confusion Matrix
slug: confusion-matrix
kind: technique
category: Core Machine Learning
aliases: error matrix, contingency table
related: classification, precision-and-recall, cross-validation, supervised-learning, overfitting, roc-auc
summary: A table that breaks a classifier's predictions down by predicted class against true class, turning a single accuracy number into a full picture of which classes it confuses with which. Its real value is that it separates the two kinds of error a single number fuses together, false alarms and misses, which usually carry very different costs.
---

A confusion matrix exists because a single accuracy number hides the information you most need. It is a square table with one row and one column per class, where each cell counts how many examples of a given true class were predicted as a given class. The diagonal holds the correct predictions, and every off-diagonal cell holds a specific kind of mistake. The name says it exactly: the table shows which classes the model confuses with which, turning one summary statistic into a full map of the model's error structure.

That map matters because two classifiers with identical accuracy can fail in completely different ways, one missing rare positives while another raises constant false alarms, and only the breakdown by predicted-versus-true reveals the difference. The point is sharpest under class imbalance, where the confusion matrix exposes the trap that a model can post high accuracy by ignoring a minority class entirely, since its handful of errors barely move the average. For any serious classification problem, the matrix, not the accuracy, is the honest report card.

In the binary case its four cells have standard names that anchor the whole vocabulary of evaluation: true positives and true negatives on the diagonal, and the two error types off it, false positives (a negative wrongly flagged, a false alarm) and false negatives (a positive wrongly missed). Almost every classification metric is a ratio built from these four counts. Precision is true positives over all predicted positives; recall is true positives over all actual positives; the F1 score is their harmonic mean. Reading these straight off the cells is the skill the matrix exists to teach.

The deepest value of the confusion matrix is that it separates the two failure modes a single number fuses together, and those two errors usually carry very different costs. In medical screening a false negative, a missed disease, may be far worse than a false positive, an unnecessary follow-up test; in a spam filter the reverse holds, since a real message lost to the spam folder costs more than a stray advertisement let through. The matrix lays both error types out explicitly so a practitioner can choose an operating point that reflects those costs, typically by moving the decision threshold to trade false positives against false negatives along the curve that ROC AUC summarizes.

The confusion matrix is the first thing to compute when a classification model is evaluated, ideally on held-out data from cross-validation so the counts reflect genuine generalization rather than memorized training examples. It extends naturally to many classes, where the off-diagonal pattern reveals systematic confusions, a digit recognizer mixing up four and nine, that point straight at where the model, or the data, needs work. It is the substrate beneath nearly every classification metric, the diagnostic that turns a verdict of "wrong" into a precise account of how, and therefore into a guide for what to fix.
