---
title: Kernel Fusion
slug: kernel-fusion
kind: technique
category: Systems and Infrastructure
aliases: kernel fusion, fused kernel, operator fusion
related: cuda, gpu, memory-bandwidth, flash-attention, flops, mixed-precision-training
summary: A performance optimization that merges several elementary tensor operations into a single GPU kernel so intermediate results stay in fast on-chip memory instead of round-tripping through main memory, cutting the data movement that dominates memory-bound work. The math is unchanged, but the bytes moved collapse, which is why fusing a chain of element-wise ops can give a multiple-fold speedup, and why flash-attention is essentially one aggressive fusion.
---

Kernel fusion speeds up deep learning by attacking the real bottleneck of many operations, which is moving data rather than computing on it. On a GPU, a kernel is a single function launched across thousands of threads, and a naive execution runs one kernel per tensor operation: a kernel to add, another to scale, another to apply an activation. Each kernel reads its inputs from the GPU's large but comparatively slow main memory and writes its output back, so a chain of small operations bounces a tensor in and out of memory once per step; for memory-bound work, where there is little arithmetic per byte, this round-tripping, not the math, sets the runtime, and the fast arithmetic units stall waiting on memory-bandwidth.

Fusion merges a sequence of such operations into one kernel that does all the steps while the data sits in fast on-chip registers and shared memory, and that is the win. The fused kernel reads the input from main memory once, performs the add, the scale, and the activation in place, and writes the final result back once, eliminating every intermediate write and re-read; because the eliminated traffic was the limiting factor, collapsing many memory-bound element-wise operations into a single pass can give a multiple-fold speedup even though the amount of arithmetic is unchanged. The arithmetic intensity, the ratio of compute to memory traffic, rises, shifting the operation away from being bandwidth-starved.

Element-wise and reduction chains are the classic targets, but the most consequential examples fuse larger structures. Flash-attention is essentially an aggressive fusion of the attention computation: it fuses the score matrix multiply, the softmax, and the value multiply into one kernel that never materializes the full attention matrix in main memory, which is what lets it scale to long sequences. Modern frameworks automate much of this through compilers that detect fusible subgraphs and emit fused kernels, and through hand-written fused kernels for hot paths.

Fusion is one of the highest-leverage GPU optimizations precisely because so much of deep learning is memory-bound rather than compute-bound. It pairs with mixed-precision training, which shrinks each value and so further reduces the bytes a kernel must move, and it is a standard reason a compiled model runs faster than the same operations executed eagerly one at a time. The limit is that fusion helps most where memory traffic dominates; an operation that is already compute-bound, like a large dense matrix multiply, gains little from fusing element-wise work around it.
