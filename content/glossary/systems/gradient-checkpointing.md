---
title: Gradient Checkpointing
slug: gradient-checkpointing
kind: technique
category: Systems and Infrastructure
aliases: activation checkpointing, gradient checkpoint, rematerialization
related: backpropagation, gpu, memory-bandwidth, mixed-precision-training, pipeline-parallelism, model-parallelism
summary: A memory-saving technique that trades extra computation for lower memory during training, storing only a few activations on the forward pass and recomputing the rest on the fly during backpropagation. It is a direct trade of flops for memory, typically about a third more compute to drop peak activation memory from growing with the number of layers to growing with its square root, worth it whenever memory, not compute, is the binding constraint.
---

Gradient checkpointing fits larger models or longer sequences into limited accelerator memory by recomputing intermediate values instead of storing them. To see the problem it solves, recall that backpropagation needs the activations produced during the forward pass in order to compute gradients on the way back; normally every layer's activations are kept in memory from the forward pass until they are used in the backward pass, and for a deep network or a long sequence these stored activations can consume more memory than the model's own weights.

The technique works by saving only a small subset of activations, the checkpoints, during the forward pass and discarding the rest. When backpropagation reaches a region whose activations were thrown away, it recomputes them by running that region's forward pass again, starting from the nearest saved checkpoint, then calculates the gradients as usual and discards the recomputed activations once more. This is why it is also called rematerialization: the missing activations are regenerated on demand rather than remembered, and with checkpoints spread evenly through the network, peak activation memory drops dramatically, often from growing with the number of layers to growing only with its square root.

The cost of this saving is time, and naming the trade is what matters. Every checkpointed region is computed twice, once on the original forward pass and once again during the backward pass, which typically adds roughly a third to the total training compute, so gradient checkpointing is a direct trade of flops for memory, worth making whenever memory, not compute, is the binding constraint, common when training large models, using long context windows, or running on a gpu with limited capacity. Because the recomputation reads and writes activations, its real cost also depends on memory-bandwidth, not arithmetic alone.

Gradient checkpointing is one of several memory levers mixed and matched in large training runs. It composes naturally with mixed-precision-training, which shrinks each stored value, and with the parallelism techniques: it is especially valuable in pipeline-parallelism, where activations from many in-flight micro-batches would otherwise pile up, and more broadly within any model-parallelism scheme straining a device's memory. By relaxing the memory ceiling on each accelerator, it lets practitioners push toward the model sizes and sequence lengths the scaling-laws reward without buying more hardware.
