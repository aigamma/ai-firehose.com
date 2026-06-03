---
title: Flash Attention
slug: flash-attention
kind: technique
category: Inference and Sampling
aliases: flashattention, fused attention
related: quantization, speculative-decoding, logits, test-time-compute
summary: A memory-efficient, exact algorithm for computing attention that avoids writing the large intermediate attention matrix to GPU memory, instead computing it in tiles on fast on-chip memory, which speeds up both training and inference without changing the result.
---

Flash attention is a way of computing the attention operation that is far more efficient on modern accelerators while producing exactly the same output. Standard attention forms a matrix of scores between every pair of positions in a sequence, applies a softmax to it, and uses the result to mix the values. That score matrix grows with the square of the sequence length, and naively it is written out to the GPU's main memory and read back, which for long sequences dominates both the memory footprint and the time spent.

It matters because attention's cost is overwhelmingly about moving data, not arithmetic. GPUs have a large but slow main memory and a small but very fast on-chip memory, and the standard approach pays repeatedly to shuttle the giant attention matrix between them. By restructuring the computation so that matrix never has to be stored in full, flash attention removes the largest memory bottleneck in transformers, which is what makes long context windows practical and cuts both training and inference time.

The technique works by tiling. It loads small blocks of the query, key, and value matrices into fast on-chip memory and computes the attention for those blocks there, never materializing the full score matrix in slow memory. The challenge is the softmax, which normally needs the whole row of scores at once; flash attention solves this with an online, running formulation that updates the normalization incrementally as each block is processed, so the final result is mathematically identical to standard attention. Because it is exact rather than an approximation, it changes nothing about the model's logits or outputs, only how fast and how cheaply they are produced.

Flash attention has become a default building block in high-performance model serving and training, and it composes with the rest of the efficiency stack. It pairs with quantization, which attacks the cost of the weights, and with latency methods like speculative-decoding, since each targets a different bottleneck. Its impact is most visible at long context lengths and large batch sizes, precisely the regimes where the quadratic attention matrix would otherwise overwhelm memory, and it is a key enabler of the long-context and high-throughput inference that test-time-compute methods lean on.
