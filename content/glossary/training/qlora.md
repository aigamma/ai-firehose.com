---
title: QLoRA
slug: qlora
kind: technique
category: Training and Fine-Tuning
aliases: quantized low-rank adaptation, quantized LoRA
related: lora, parameter-efficient-fine-tuning, quantization, fine-tuning, mixed-precision-training
summary: A memory-efficient method that freezes a large model quantized to 4-bit and trains small low-rank LoRA adapters on top, letting a single consumer GPU fine-tune models that would otherwise need a cluster. It works because the frozen base never updates (so it can stay compressed) and is dequantized to higher precision on the fly for each operation, so storage is 4-bit but the math is not.
---

QLoRA combines two ideas to make fine-tuning large models affordable: quantize the frozen base model down to 4 bits so it barely fits in memory, then train only small low-rank adapters on top of it, the LoRA recipe. The base weights are never updated, so they can stay in their compressed form throughout training, and all the learning happens in the lightweight adapters, whose gradients and optimizer state are tiny. The result is that a model which would normally require many high-end GPUs to fine-tune can be adapted on a single consumer card.

Making 4-bit training work without wrecking quality took a few specific innovations, and the central one is the keeper. The 4-bit NormalFloat data type is information-theoretically suited to the roughly normal distribution of neural network weights; double quantization compresses the quantization constants themselves for further savings; and paged optimizers use the GPU's unified memory to absorb the memory spikes that would otherwise cause out-of-memory errors during training. Crucially, computation happens by dequantizing weights to a higher precision on the fly for each operation, so the math is done at adequate precision even though storage is 4-bit.

The impact was practical and large: QLoRA put fine-tuning of capable open models within reach of individuals and small teams, and it became a default for instruction-tuning and domain adaptation on limited hardware. Quality is typically very close to full-precision LoRA and often close to full fine-tuning, with the gap depending on the task.

Like LoRA, it inherits the deployment convenience of adapters: the small trained weights can be stored, shared, and swapped cheaply, and merged back into the base model if a single set of weights is preferred at serving time.
