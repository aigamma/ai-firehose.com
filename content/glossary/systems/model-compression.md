---
title: Model Compression
slug: model-compression
kind: technique
category: Systems and Infrastructure
aliases: model compression, model optimization
related: quantization, knowledge-distillation, qlora, gpu
summary: The set of techniques for shrinking a trained model so it runs faster and cheaper with minimal quality loss, the bridge between the large model you trained and a deployable one, spanning quantization, pruning, distillation, and low-rank methods.
---

Model compression is what stands between a model that is impressive in a research result and one that is affordable to serve. Training pushes toward large models because scale buys capability, but serving that model to many users, or running it on a phone or a car, demands that it be small, fast, and cheap. Compression reduces a trained model's size and compute while trying to give up as little accuracy as possible.

It is really a family of complementary techniques. Quantization stores weights and runs arithmetic in fewer bits, often dropping from 16-bit to 8-bit or 4-bit, cutting memory and bandwidth, the dominant lever for large language models. Pruning removes parameters that contribute little, either scattered individual weights or whole structured units like neurons and attention heads, leaving a leaner network. Knowledge distillation trains a small student model to imitate a large teacher, transferring much of the capability into a fraction of the parameters. Low-rank methods factor large weight matrices into smaller ones, the same idea behind LoRA-style adapters.

These are frequently stacked: a model might be distilled, then pruned, then quantized, each step shaving cost.

The governing tension is compression versus quality. Every technique can be pushed until accuracy degrades, and the art is finding how far a given model and task tolerate before the loss matters. Because inference, not training, is where the lifetime cost of a deployed model accumulates, compression is often where the real economics of shipping AI are decided.
