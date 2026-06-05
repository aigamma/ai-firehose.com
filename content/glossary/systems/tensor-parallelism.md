---
title: Tensor Parallelism
slug: tensor-parallelism
kind: technique
category: Systems and Infrastructure
aliases: tensor parallel, intra-layer parallelism, tensor model parallelism
related: model-parallelism, pipeline-parallelism, data-parallelism, matrix-multiplication, gpu, memory-bandwidth
summary: A form of model parallelism that splits the work inside a single layer, dividing each large matrix multiplication into slices computed on different devices, then combining the partial results, so a layer too big for one device can still be evaluated. Because it synchronizes many times per pass, it is extremely sensitive to interconnect speed and is therefore the innermost split, confined to devices joined by the fastest links.
---

Tensor parallelism splits computation within a layer rather than between layers. Its target is the large matrix-multiplication that dominates each layer of a transformer, the weight matrices that can individually be too large to hold or multiply on one device, and it partitions such a matrix into slices, places each slice on a different accelerator, has every device multiply its own slice against the shared input, and then combines the partial outputs into the result the full matrix would have produced.

Concretely, a weight matrix can be cut along its columns so each device produces a different chunk of the output activations, after which the chunks are concatenated, or cut along its rows so each device produces a partial sum that must then be added together. A transformer layer is arranged so one matrix is split column-wise and the next row-wise, which means the devices only need to synchronize once per pair of matrices through an all-reduce that sums the partial results; still, that synchronization happens many times per forward and backward pass, far more often than in data-parallelism, so tensor parallelism is extremely demanding on interconnect speed and memory-bandwidth.

Because the communication is so frequent and latency-sensitive, tensor parallelism is the keeper's constraint: it is normally confined to accelerators that are physically close and joined by the fastest available links, typically the GPUs inside a single server connected by a high-speed bus. Pushing it across slower network links between servers usually costs more in communication than it saves in compute, and this locality is what defines its role in a larger parallel layout: tensor parallelism is the innermost split, used to make a single layer fit and run across a tight group of devices.

Tensor parallelism matters because it directly attacks the per-layer memory and compute wall that even pipeline-parallelism cannot, since pipelining only helps if each individual layer already fits on its assigned device. It composes with the other techniques to build the full configuration of a large run: tensor-parallelism within a server, pipeline-parallelism across servers, and data-parallelism replicating the whole arrangement. Together they let a model whose individual layers exceed one accelerator's memory be trained at the scale the scaling-laws call for.
