---
title: LoRA
slug: lora
kind: technique
category: Training and Fine-Tuning
aliases: low-rank adaptation, LoRA adapters
related: parameter-efficient-fine-tuning, fine-tuning, pretraining, catastrophic-forgetting, transfer-learning
summary: A parameter-efficient fine-tuning method that freezes a pretrained model and injects small, trainable low-rank weight matrices, so a large model is adapted by training a tiny fraction of its parameters.
---

LoRA, short for Low-Rank Adaptation, is a technique for adapting a large pretrained model without updating all of its weights. Instead of changing the original weight matrices, LoRA freezes them and adds a small, trainable update alongside each one. The key idea is that this update is constrained to be low-rank, meaning it is expressed as the product of two thin matrices whose inner dimension (the rank) is small, often 8, 16, or 64. The model's effective weights become the frozen original plus this learned low-rank correction. It is the most widely used member of the parameter-efficient fine-tuning family.

LoRA matters because it makes fine-tuning large models dramatically cheaper and more flexible. A multi-billion-parameter model might be adapted by training only a fraction of a percent of its parameters, which slashes the memory needed for optimizer state and gradients and shrinks the saved result from many gigabytes to a few megabytes. Because the original weights are untouched, a single base model can host many swappable LoRA adapters, one per task or customer, loaded and unloaded on demand. This turns fine-tuning from a heavyweight operation into something practical on modest hardware.

The method rests on the observation that the weight change needed to specialize a model usually has low intrinsic rank: the adaptation lives in a small subspace, so a full-rank update is wasteful. Concretely, for a frozen weight matrix the update is written as the product of a down-projection and an up-projection, the up-projection initialized to zero so training begins exactly at the pretrained behavior. Only those two small matrices receive gradients. A scaling factor controls how strongly the adapter influences the output. Once training is done, the low-rank product can optionally be merged back into the frozen weights, adding zero inference latency.

Beyond efficiency, freezing the base weights gives LoRA a useful side effect: it limits catastrophic forgetting, because the model's general knowledge in the original parameters cannot be overwritten, only supplemented. Variants extend the idea, with QLoRA combining LoRA with a quantized (compressed) base model so even very large models fit on a single GPU, and methods that adapt the rank per layer.

LoRA is the canonical realization of parameter-efficient fine-tuning and the default way most practitioners now customize foundation models. It depends on pretraining for the frozen backbone it adapts, it is a lightweight form of fine-tuning, and it embodies transfer learning by reusing general representations while training only a thin task-specific layer on top.
