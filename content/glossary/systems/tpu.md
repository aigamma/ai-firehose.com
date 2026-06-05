---
title: TPU
slug: tpu
kind: tool
category: Systems and Infrastructure
aliases: tensor processing unit, TPUs
related: gpu, flops, memory-bandwidth, matrix-multiplication, tensor, data-parallelism
summary: A custom chip built specifically to accelerate neural network workloads, organizing its arithmetic around a large systolic array that streams data through a grid of multiply-accumulate units to do matrix multiplication with very high efficiency. Its defining trick is loading weights once and streaming activations across the grid, which slashes the memory accesses per operation that usually bottleneck the work.
---

A TPU is an application-specific accelerator designed from the ground up for machine learning rather than adapted from another purpose. Where a gpu evolved from graphics hardware and remains a general-purpose parallel processor, a TPU is narrower: built to do the matrix-multiplication and related tensor operations at the heart of neural networks, it sacrifices flexibility to do that one job with less wasted silicon and energy. It was introduced by a large cloud provider to serve and train its own models cost-effectively at scale.

The defining feature, and the keeper, is its systolic array, a two-dimensional grid of simple multiply-accumulate units through which data flows in a rhythmic, pipelined pattern. Instead of repeatedly fetching each operand from memory for every multiplication, the array loads a block of weights once and then streams activations across the grid, with each cell passing partial results to its neighbor. This dramatically reduces the number of memory accesses per arithmetic operation, the usual bottleneck, and lets the chip sustain a very high rate of flops on dense matrix math while keeping power and memory-bandwidth pressure low.

TPUs matter because they make the largest training and serving workloads cheaper per unit of compute, and because they show that designing hardware around the specific shape of deep learning, dense low-precision linear algebra over large tensors, pays off. They are typically used in tightly coupled clusters called pods, connected by a dedicated high-speed interconnect so many chips behave like one large accelerator, and that fast interconnect is what makes them well suited to data-parallelism and to splitting very large models across devices, since the parallelism techniques all depend on moving activations and gradients between chips quickly.

In practice TPUs occupy the same niche as data-center GPUs, and the choice between them is largely about software ecosystem, availability, and price rather than capability. They are accessed through high-level frameworks that compile a model down to the array's instructions, so a practitioner rarely programs the systolic array directly. Like any accelerator, a TPU has a fixed compute ceiling and memory capacity, so training a frontier model still requires spreading the work across many of them, and the cost of those chip-hours is part of what the scaling-laws price in.
