---
title: GPU
slug: gpu
kind: tool
category: Systems and Infrastructure
aliases: graphics processing unit, GPUs, accelerator
related: tpu, cuda, flops, memory-bandwidth, matrix-multiplication, tensor, mixed-precision-training
summary: A massively parallel processor, originally built for rendering images, that became the dominant hardware for neural networks because deep learning is overwhelmingly dense linear algebra it can execute thousands of operations at once. Its wide, data-parallel design, built to color millions of pixels, turned out to be exactly what matrix multiplication needs, and its fixed memory and compute ceiling is the starting point for every parallelism technique.
---

A GPU is a processor with thousands of small arithmetic cores designed to perform the same operation on many pieces of data at the same time, the opposite of a CPU's handful of powerful cores tuned for fast sequential logic and branching. The GPU was created to color millions of pixels in parallel for graphics, but that same wide, data-parallel design turned out to be exactly what neural networks need, because the core of deep learning is multiplying large matrices, and every entry of a matrix product can be computed independently.

GPUs matter because they are the reason modern deep learning is feasible at all. The dominant operation in a neural network, both in the forward pass and in backpropagation, is matrix-multiplication over large tensors, and a GPU can do orders of magnitude more of these multiply-accumulate operations per second than a CPU; the raw arithmetic rate is measured in flops, and a single data-center GPU delivers throughput that would take a room of CPUs to match. Without this hardware, the large training runs behind today's models would take years instead of weeks.

Internally a GPU groups its cores into blocks that share fast local memory and execute in lockstep, and the whole chip is fed by a wide, high-bandwidth memory system. Two numbers dominate how a workload performs on it: peak compute, how many flops the arithmetic units can sustain, and memory-bandwidth, how fast operands can be moved from memory into those units. Many real workloads, especially inference on one token at a time, are limited not by arithmetic but by how quickly data can be streamed in, which is why memory bandwidth is as important to a practitioner as raw flops, and recent GPUs add dedicated matrix-multiply units, often called tensor cores, that accelerate the low-precision math used in mixed-precision-training.

To get this hardware to run useful work, you write code through a programming model. For most of the field that means cuda, the software stack for programming one dominant vendor's GPUs, on top of which the deep learning frameworks build their operators, and the competing custom accelerator from the cloud side is the tpu, built specifically for tensor workloads rather than adapted from graphics.

A single GPU has a fixed amount of memory and compute, so the largest models do not fit on one device, and that single fact is decisive: it is the starting point for the whole family of parallelism techniques. When a batch is too large in number you use data-parallelism across many GPUs; when a model itself is too large to fit you split it with model-parallelism, tensor-parallelism, or pipeline-parallelism. The economics of the GPU, its cost, memory ceiling, and bandwidth, are what ground the scaling-laws that govern how far a training run can be pushed, since every additional unit of scale must be paid for in GPU-hours.
