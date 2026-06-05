---
title: Mixed Precision Training
slug: mixed-precision-training
kind: technique
category: Systems and Infrastructure
aliases: mixed precision, automatic mixed precision, AMP, FP16 training
related: flops, gpu, memory-bandwidth, gradient-checkpointing, quantization, data-parallelism
summary: Running most of a model's arithmetic in a low-precision floating-point format while keeping a high-precision master copy of the weights and a few sensitive operations in full precision, so training is faster and lighter without losing accuracy. The safeguards, a full-precision master copy and loss scaling to keep tiny gradients representable, are what let it match full precision, and it is distinct from quantization, which compresses a finished model for inference.
---

Mixed precision training runs a model's computation in more than one numeric format at once. Most of the heavy arithmetic, the matrix multiplications of the forward and backward pass, is done in a low-precision floating-point format such as 16-bit, while the parts that are numerically delicate are kept in full 32-bit precision. The name captures the deliberate mixing: low precision where it is safe and fast, high precision where it is necessary for correctness.

It matters for two concrete reasons, speed and memory. Modern accelerators execute low-precision matrix math several times faster than full precision, because their dedicated matrix units are built for it, so the effective flops available to training rise sharply; at the same time, storing activations and gradients in 16 bits instead of 32 roughly halves the memory they consume and halves the data that must move through the chip, easing the memory-bandwidth bottleneck. The combined effect is that mixed precision can nearly double training throughput and let larger models or batches fit on the same gpu, which is why it is on by default in essentially every large run.

The difficulty is that low-precision floating-point has a much smaller range and coarser resolution, so naive use causes numbers to underflow to zero or lose the small differences learning depends on, and the safeguards that handle it are the keeper. It keeps a master copy of the weights in full precision that the optimizer updates, so tiny parameter changes are not lost step after step; it keeps accumulations, such as the sums inside a reduction or the statistics in normalization, in full precision; and it applies loss scaling, multiplying the loss by a large constant before backpropagation so small gradient values land inside the representable range, then dividing it back out before the update. These measures let the result match full-precision training closely while capturing most of the speed.

Mixed precision is distinct from quantization, though the two are often confused: quantization usually compresses a finished model for cheaper inference, frequently with integers, whereas mixed precision is about making training itself faster and lighter while preserving the learning dynamics. It composes with the rest of the efficiency stack, stretching what fits per device alongside gradient-checkpointing and slotting underneath the parallelism techniques like data-parallelism. By lowering the cost of every operation, mixed precision is one of the levers that makes the enormous compute budgets implied by the scaling-laws affordable in practice.
