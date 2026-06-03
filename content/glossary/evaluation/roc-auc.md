---
title: ROC AUC
slug: roc-auc
kind: technique
category: Evaluation and Benchmarks
aliases: AUC, AUROC, area under the ROC curve
related: precision-and-recall, f1-score, calibration, perplexity
summary: The area under the receiver operating characteristic curve, a threshold-independent measure of how well a binary classifier ranks positives above negatives. It equals the probability that a random positive is scored higher than a random negative; 0.5 is chance, 1.0 is perfect.
---

ROC AUC is the area under the receiver operating characteristic curve, a single number that summarizes how well a binary classifier separates the two classes across every possible decision threshold. The ROC curve itself plots the true positive rate (recall) against the false positive rate as the threshold sweeps from strict to permissive. The area under that curve, AUC, condenses the whole curve into one scalar between 0 and 1. It has a clean probabilistic meaning: AUC equals the probability that the classifier assigns a higher score to a randomly chosen positive example than to a randomly chosen negative one.

It matters because it evaluates ranking quality without committing to a threshold. Metrics like the f1-score and a single precision-and-recall pair describe one operating point, but the right threshold is often unknown at evaluation time or differs across deployments. AUC steps back and asks whether the model's scores order the examples correctly at all, which is the prerequisite for any threshold to work. This makes it the default summary metric for binary classifiers in medicine, credit risk, fraud, and ranking, and a convenient way to compare two models with one number that does not depend on where either happens to set its cutoff.

Computing it does not actually require drawing the curve. Because AUC equals the probability that a random positive outranks a random negative, it can be calculated directly from the scores as a rank statistic, equivalent to the normalized Mann-Whitney U statistic: count the fraction of positive-negative pairs that are correctly ordered, crediting half for ties. An AUC of 1.0 means every positive is scored above every negative (perfect separation), 0.5 means the scores are no better than random, and below 0.5 means the model is ranking in reverse. The metric is computed once over the full test set and needs no chosen threshold, which is the whole point.

ROC AUC has well-known limitations. On heavily imbalanced data it can be optimistic and misleading, because the false positive rate has a large negative denominator that masks a flood of false positives among a rare positive class; in that regime the area under the precision-recall curve is the more honest summary. AUC is also purely a measure of ranking and ordering, so it is invariant to any monotonic rescaling of the scores and therefore says nothing about calibration: a model with perfect AUC can still attach wildly wrong probabilities to its predictions. And a single AUC averages over operating points a practitioner may never use, so two models with equal AUC can behave very differently at the threshold that actually matters.

ROC AUC is the threshold-free counterpart to the threshold-bound f1-score and the precision-and-recall pair, measuring discrimination (does the model rank positives above negatives) as distinct from calibration (are the attached probabilities correct), two properties that can diverge completely. Like perplexity for language models, it scores the quality of the model's underlying numbers rather than the correctness of a single hard decision, which is why it is reported alongside, not instead of, point metrics.
