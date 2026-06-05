---
title: Data Leakage
slug: data-leakage
kind: technique
category: Evaluation and Benchmarks
aliases: data leakage, train-test leakage, target leakage
related: benchmark-contamination, cross-validation, overfitting, mmlu
summary: A methodological flaw in which information from outside the training set, especially from the test set or the future, slips into training, so a model scores far better in evaluation than it will in reality; the most common reason a model looks great and then fails in deployment. It hides in mundane places, preprocessing before the split, a feature that encodes the target, duplicate rows across splits, and rarely requires any intent.
---

Data leakage is when a model is accidentally given information at training time that it will not have at prediction time, so its evaluation is dishonestly easy. The score looks excellent, everyone celebrates, and then the model collapses in production, because the conditions that inflated the test score do not exist in the real world. It is the single most common cause of results that fail to reproduce in deployment.

It hides in mundane places, the keeper. Preprocessing the whole dataset, computing a normalization or imputing missing values, before splitting into train and test lets statistics of the test set bleed into training. A feature can quietly encode the target, or encode the future in a time-series problem, so the model "predicts" what it was effectively told. Duplicate or near-duplicate rows landing in both train and test let the model memorize answers it will be tested on. None of this requires intent; it is usually an honest pipeline mistake.

At the scale of large language models, leakage has a notorious cousin: benchmark contamination, where the test questions themselves appear in the pretraining data, so a model's benchmark score reflects memorization rather than ability.

Prevention is discipline about the boundary between what the model may see and what it will be judged on: split first and fit all preprocessing only on the training fold, respect time order so the future never informs the past, deduplicate across splits, and audit features for any that could not exist at prediction time. Proper cross-validation helps, but only if the splitting happens before any data-dependent step.
