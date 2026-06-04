---
title: Batch Size
slug: batch-size
kind: technique
category: Optimization
aliases: batch size, mini-batch size
related: epoch, stochastic-gradient-descent, learning-rate, gradient-descent
summary: How many examples go into each gradient update, the dial between a full-batch gradient (accurate, slow, memory-hungry) and single-example SGD (noisy, fast). The non-obvious cost of large batches is worse generalization, because the very noise of small batches acts as a mild regularizer, and the dial is coupled to the learning rate.
---

The batch size is how many examples the model looks at before taking one optimization step, and it spans a spectrum. At one extreme, full-batch gradient descent uses the entire dataset per update, accurate but slow and memory-hungry; at the other, pure stochastic gradient descent updates on a single example, fast but very noisy. Almost all real training lives in between, on mini-batches of a few dozen to a few thousand examples, to balance the two.

The choice has consequences beyond speed, and the surprising one is about generalization. A larger batch gives a smoother, lower-variance estimate of the true gradient and uses hardware far more efficiently, since GPUs love big parallel matrix multiplies, but it costs more memory and, past a point, can generalize slightly worse, because the very noise of small batches acts as a mild regularizer that helps the optimizer escape sharp minima. A smaller batch is noisier and slower per example but can find flatter, more generalizable solutions. Bigger is not simply better.

Batch size and learning rate are coupled, which is the practical fact most worth remembering: bigger batches generally tolerate, and often need, a larger learning rate, captured by heuristics like the linear scaling rule that raises the rate in proportion to the batch. In practice the batch size is often set by what fits in GPU memory, and when the batch you want is too large to fit, gradient accumulation sums gradients over several smaller batches before updating, simulating a large batch on limited hardware. Tune the batch and you have implicitly changed the learning rate too.
