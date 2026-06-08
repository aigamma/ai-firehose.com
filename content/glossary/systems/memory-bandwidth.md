---
title: Memory Bandwidth
slug: memory-bandwidth
kind: tool
category: Systems and Infrastructure
aliases: bandwidth, memory-bound, HBM bandwidth
related: gpu, tpu, flops, kv-cache, flash-attention, mixed-precision-training
summary: The rate at which data moves between an accelerator's memory and its arithmetic units, frequently the true bottleneck in deep learning since many workloads stall waiting for data rather than compute. Whether a workload is bound by compute or bandwidth turns on its arithmetic intensity, and generating text one token at a time is strongly memory-bound: each step must read the entire model's weights from memory to produce one token.
---

Memory bandwidth is the speed at which an accelerator can transfer data between its main memory and the cores that do arithmetic, usually quoted in bytes per second, and it is a distinct resource from raw compute. A gpu or tpu is rated both for how many flops its arithmetic units can perform and for how fast its memory system can feed them operands, and these two numbers limit different workloads; memory bandwidth is the often-overlooked one, yet for a large share of real deep learning it is the constraint that actually determines performance.

The reason bandwidth matters so much is that the arithmetic units can almost always compute faster than memory can supply data. Whether an operation is limited by compute or by bandwidth depends on its arithmetic intensity, the number of arithmetic operations it performs per byte of data it reads and writes: operations with high intensity, such as a large dense matrix-multiplication that reuses each loaded value many times, keep the arithmetic units busy and are compute-bound, while operations with low intensity, which touch a lot of data but do little math with each value, finish their arithmetic and then sit idle waiting for the next bytes, are memory-bound, and run at a fraction of the chip's rated flops.

This distinction explains much of the behavior of large language models in practice. Generating text one token at a time is strongly memory-bound: each step does only a little computation but must read the entire model's weights and the growing kv-cache from memory, so latency is governed almost entirely by bandwidth, not by peak flops. This is also why the kv-cache and long context windows are expensive, since both inflate the volume of data that must be streamed every step, and why the prefill phase that processes a whole prompt at once is comparatively compute-bound while decoding is bandwidth-bound.

Because so much of deep learning is limited by data movement, many of the field's most important optimizations are really about bandwidth rather than arithmetic. Flash-attention restructures attention specifically to avoid moving a large intermediate matrix through slow memory; mixed-precision-training and quantization shrink each value so more useful data fits in the same bandwidth; and fast device-to-device links matter precisely because the parallelism techniques are limited by how quickly activations and gradients can be exchanged. Understanding whether a workload is compute-bound or memory-bound is the first question in making it faster, and it is as central to reaching the scale the scaling-laws describe as raw compute is.
