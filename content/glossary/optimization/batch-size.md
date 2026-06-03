---
title: Batch Size
slug: batch-size
kind: technique
category: Optimization
aliases: batch size, mini-batch size
related: epoch, stochastic-gradient-descent, learning-rate, gradient-descent
summary: The number of training examples used to compute each gradient update; it trades off the stability of the gradient estimate, memory use, and training speed, and interacts closely with the learning rate.
---

The batch size is how many examples the model looks at before taking one optimization step. At one extreme, full-batch gradient descent uses the entire dataset per update, which is accurate but slow and memory-hungry; at the other, pure stochastic gradient descent updates on a single example, which is noisy. Almost all real training uses mini-batches in between, a few dozen to a few thousand examples, to balance these.

The choice has real consequences. A larger batch gives a smoother, lower-variance estimate of the true gradient and uses hardware more efficiently (GPUs love big parallel matrix multiplies), but it costs more memory and, past a point, can generalize slightly worse, since the very noise of small batches acts as a mild regularizer that helps escape sharp minima. A smaller batch is noisier and slower per example processed but can find flatter, more generalizable solutions.

Batch size and learning rate are coupled: bigger batches generally tolerate, and often need, a larger learning rate, captured by heuristics like the linear scaling rule. In practice the batch size is often set by what fits in GPU memory, and when the desired batch is too large to fit, gradient accumulation sums gradients over several smaller batches before updating, simulating a large batch on limited hardware.
