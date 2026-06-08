---
title: Data Parallelism
slug: data-parallelism
kind: technique
category: Systems and Infrastructure
aliases: data parallel, distributed data parallel, DDP
related: model-parallelism, tensor-parallelism, pipeline-parallelism, gpu, memory-bandwidth, gradient-checkpointing
summary: The most common way to train across many accelerators: each device holds a full copy of the model, processes a different slice of the batch, and the devices average their gradients every step via an all-reduce so all copies stay identical. Its virtue is that it changes nothing about the math, only replicates and averages; its hard limit is that it scales throughput, not model size, since every device must hold the whole model.
---

Data parallelism spreads training across multiple accelerators by splitting the data rather than the model. Every device keeps an identical full copy of the model's parameters, and at each step the training batch is divided into shards, one per device, with each device running the forward and backward pass on its own shard independently. The result is that the same model is trained on a much larger effective batch in the same wall-clock time, because every device is computing in parallel on different examples.

The one point of coordination is the gradient. Because each copy of the model saw different data, each computes a different gradient, and to keep the copies from drifting apart they must be reconciled before the optimizer updates the weights. The standard solution is an all-reduce, a collective communication operation that sums the gradients from every device and shares the average back to all of them, so each copy then applies the same averaged update and after every step all replicas hold byte-identical parameters again. This synchronization is the only communication data parallelism requires, but it happens every step and its cost grows with model size, so it leans on fast interconnect and high memory-bandwidth between devices.

Data parallelism matters because it is the simplest and most widely used form of distributed training, and it is what lets practitioners scale the batch size and finish a run faster by throwing more identical accelerators at it. Its great virtue is that it does not change the model or the math at all; it only replicates and averages. Its limitation is just as fundamental: because every device must hold the entire model, data parallelism alone cannot train a model that does not fit in a single accelerator's memory. It scales throughput, not model size.

When a model does grow too large for one device, data parallelism is combined with the forms of model-parallelism that actually split the parameters: tensor-parallelism, which divides individual layers, and pipeline-parallelism, which divides the layers into stages, while memory-saving methods like gradient-checkpointing further stretch what fits per device. A modern large training run is typically a careful mix of all of these, with data parallelism forming the outer loop that replicates whatever sharded configuration fits on a group of GPUs, so the enormous total flops demanded by the scaling-laws can be reached in a practical amount of time.
