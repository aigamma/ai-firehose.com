---
title: Fully Sharded Data Parallel
slug: fully-sharded-data-parallel
kind: technique
category: Systems and Infrastructure
aliases: FSDP, ZeRO, sharded data parallelism
related: data-parallelism, model-parallelism, tensor-parallelism, pipeline-parallelism, mixed-precision-training, gradient-checkpointing
summary: A distributed strategy that shards a model's parameters, gradients, and optimizer states across data-parallel workers and gathers each layer's weights only when needed, so models far larger than one device's memory train without slicing the model itself. The just-in-time gather is the trick: peak memory is set by the largest single layer that must be materialized, not the whole model, which is the same idea introduced as ZeRO.
---

Fully sharded data parallel trains models that do not fit on a single accelerator while keeping the simplicity of data parallelism. Plain data parallelism replicates the entire model on every worker and has each process a different slice of the batch, which is easy but wasteful: the parameters, the gradients, and the optimizer states (which for an optimizer like Adam are larger than the parameters themselves) are duplicated on every device, so the largest trainable model is capped by one device's memory.

Fully sharded data parallel removes the duplication by sharding all three of those tensors across the workers, so each holds only its slice, and the key move is doing this just in time: right before a layer runs, the workers all-gather its full parameters from their shards, compute the forward or backward pass, and then immediately discard the gathered copy, keeping only their shard. Gradients are reduce-scattered so each worker ends up with the averaged gradient for its slice, and peak memory is therefore set by the largest single layer that must be materialized, not by the whole model, which is what lets a cluster train models orders of magnitude larger than any one device could hold. This is the same idea introduced as ZeRO, whose stages progressively shard optimizer states, then gradients, then parameters.

The cost is communication. Gathering weights and scattering gradients every layer moves a lot of data across the interconnect, so the approach depends on fast links between devices and on overlapping that communication with computation to hide its latency. It composes with the other forms of parallelism: tensor and pipeline parallelism split an individual model across devices for the cases where even one layer is too large, and fully sharded data parallel handles scaling across the replicas.

It also pairs with the standard memory savers, mixed-precision training and gradient checkpointing, which reduce the size of what must be stored and gathered. Together these are the toolkit that makes training models with hundreds of billions of parameters feasible.
