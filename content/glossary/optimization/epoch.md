---
title: Epoch
slug: epoch
kind: technique
category: Optimization
aliases: training epoch
related: batch-size, stochastic-gradient-descent, learning-rate, overfitting
summary: One complete pass of training over the entire dataset, normally many parameter updates since models train on mini-batches. How many epochs to run trades underfitting against overfitting, though for large-language-model pretraining the corpus is so vast the model often sees it barely once.
---

An epoch is one full sweep through all the training data. Because models train on mini-batches rather than the whole dataset at once, a single epoch is actually many parameter updates, one per batch, continuing until every example has been seen exactly once; run a second epoch and the model sees the whole dataset again, usually reshuffled so the batches differ. Counting epochs is how training duration is normally measured.

The number of epochs is a basic training decision with a clear tension on either side. Too few and the model has not yet learned the data, underfitting; too many and it begins memorizing the training set at the expense of generalization, overfitting. The right number is found empirically by watching validation performance, and early stopping automates the choice by ending training when that performance stops improving rather than after a fixed count, which is why a generous epoch budget plus early stopping is a common default.

It helps to keep three terms straight, since they are often confused. An iteration, or step, is one batch update; an epoch is however many iterations it takes to cover the dataset once, so iterations per epoch equals the dataset size divided by the batch size. A telling exception to the many-epochs norm is large-language-model pretraining, where the corpus is so vast that the model often sees the data for only a single pass, or even less, making the epoch a less central unit there than in classical training, where dozens or hundreds of passes are routine. When data is effectively unlimited, you stop counting passes and start counting tokens.
