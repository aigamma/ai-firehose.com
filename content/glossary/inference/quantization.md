---
title: Quantization
slug: quantization
kind: technique
category: Inference and Sampling
aliases: model quantization, post-training quantization
related: flash-attention, speculative-decoding, logits, test-time-compute
summary: The technique of storing and computing a model's weights and activations at lower numerical precision, for example 8-bit or 4-bit integers instead of 16-bit floats, to shrink memory use and speed up inference with minimal loss of accuracy.
---

Quantization reduces the number of bits used to represent a model's numbers. A trained network normally stores its weights as 16-bit or 32-bit floating-point values, but those high-precision numbers are expensive to keep in memory and to move across the hardware during inference. Quantization maps each value onto a smaller set of levels, commonly 8-bit integers and increasingly 4-bit, so the model occupies a fraction of the space and arithmetic runs on cheaper integer units.

It matters because memory bandwidth, not raw compute, is the dominant cost of serving large language models. Every generated token requires reading the entire weight matrix out of memory, so halving or quartering the size of those weights directly cuts latency and lets bigger models fit on smaller or fewer accelerators. Quantization is what allows a model that would otherwise demand a data-center GPU to run on a single consumer card or even a laptop, which is the engine behind the local-inference ecosystem.

The core operation is choosing a scale (and sometimes a zero point) that maps a range of floating-point values onto the available integer levels, then rounding each value to the nearest level. The art lies in limiting the error that rounding introduces. Post-training quantization simply converts an already-trained model and works well down to 8 bits, while pushing to 4 bits and below usually requires more care: per-group scales, holding sensitive outlier weights at higher precision, or quantization-aware training that exposes the rounding to the model during fine-tuning so it can adapt.

Quantization is one lever in a larger inference-efficiency toolkit and composes with the others. It pairs naturally with memory-efficient kernels like flash-attention and with latency tricks like speculative-decoding, since each attacks a different part of the cost. The trade-off is precision against footprint: aggressive low-bit formats can begin to distort the model's logits and degrade quality on hard tasks, so practitioners pick the bit width that holds accuracy where it counts while capturing as much of the memory and speed savings as possible.
