---
title: Pipeline Parallelism
slug: pipeline-parallelism
kind: technique
category: Systems and Infrastructure
aliases: pipeline parallel, inter-layer parallelism, pipeline model parallelism
related: model-parallelism, tensor-parallelism, data-parallelism, gpu, gradient-checkpointing, memory-bandwidth
summary: A form of model parallelism that splits a model's layers into consecutive stages on different accelerators and streams micro-batches through them like an assembly line, so a deep model too large for one device fits across several. Many micro-batches keep every stage busy at once (the idle "bubble" shrinks with more of them), and because stages only exchange activations at their boundaries, it tolerates slow links and is the natural way to split across servers.
---

Pipeline parallelism divides a network between its layers. The layers are partitioned into contiguous groups called stages, and each stage is assigned to a different accelerator: the first device holds the early layers, the next the middle, and so on. Data enters the first stage, and its output activations are passed to the second, then the third, flowing through the devices in sequence much like work moving down a factory assembly line, and because each device only stores its slice of the layers, a model far deeper than one accelerator could hold can be trained across the group.

The obvious problem with a strict assembly line is that only one stage is ever active while the others wait, which would waste most of the hardware. Pipeline parallelism solves this by splitting each batch into many smaller micro-batches and feeding them in staggered succession: once the pipeline is full, every stage is working on a different micro-batch at the same time, so all devices stay busy in parallel. The leftover inefficiency at the start and end, when the pipeline is filling and draining and some stages sit idle, is called the bubble, and using more micro-batches shrinks the bubble as a fraction of the total work.

Compared with tensor-parallelism, pipeline parallelism communicates far less and far less often, the keeper: stages only exchange the activations at their boundaries, once per micro-batch in each direction, rather than synchronizing in the middle of every layer. That makes it tolerant of slower links and therefore the natural choice for splitting a model across separate servers, where the interconnect and memory-bandwidth between machines are weaker than inside a single box. Its cost is scheduling complexity and the memory needed to keep activations from in-flight micro-batches around until their backward pass, a pressure often relieved with gradient-checkpointing.

Pipeline parallelism matters because depth is one of the two axes along which models outgrow a single device, and it handles that axis cheaply in communication terms. It is rarely used alone: a large training run typically nests tensor-parallelism inside each stage to make individual layers fit, pipeline-parallelism across stages to fit the depth, and data-parallelism around the whole thing to scale throughput. This layered design is the standard way to assemble enough accelerators to reach the parameter counts and compute the scaling-laws demand.
