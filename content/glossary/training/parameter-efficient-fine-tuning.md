---
title: Parameter-Efficient Fine-Tuning
slug: parameter-efficient-fine-tuning
kind: technique
category: Training and Fine-Tuning
aliases: PEFT, parameter efficient fine-tuning
related: lora, fine-tuning, transfer-learning, catastrophic-forgetting, pretraining, knowledge-distillation
summary: A family of fine-tuning methods that adapt a large pretrained model by training only a small number of new or selected parameters while freezing the rest, reaching near-full-fine-tuning quality at a fraction of the cost. The shared bet is that the adjustment needed to specialize a model is small and low-dimensional, which is what lets one frozen base serve many swappable megabyte-sized adapters.
---

Parameter-efficient fine-tuning (PEFT) adapts a large pretrained model without updating all of its weights. Full fine-tuning trains every parameter, which for a multi-billion-parameter model is expensive in memory, slow, and produces a full-size copy of the model per task; PEFT instead freezes the vast majority of the pretrained weights and trains only a small set, either a handful of newly inserted parameters or a carefully chosen subset of existing ones. The aim is to reach task performance close to full fine-tuning while touching a tiny fraction of the parameters.

PEFT matters because it makes specializing foundation models practical at scale. By training so few parameters, it slashes the memory needed for gradients and optimizer state, often enough to fine-tune a model that would otherwise not fit on available hardware, and it shrinks each adapted result from gigabytes to megabytes, so one frozen base model can serve many lightweight task-specific add-ons swapped in and out on demand. This turns fine-tuning from a heavyweight operation into something routine, and it is now the default way most practitioners customize large models.

The family contains several mechanisms. The best known is LoRA, which adds trainable low-rank matrices alongside frozen weights; adapter methods insert small bottleneck layers between existing layers and train only those; prefix-tuning and prompt-tuning prepend a small set of trainable vectors to the input or to each layer, steering the frozen model without altering it; and selective methods, such as training only the bias terms, update a chosen sliver of the original parameters. What unites them is one bet: that the adjustment needed to specialize a model is small and low-dimensional, so most of the weights can stay fixed.

A valuable side effect of freezing the backbone is robustness to catastrophic forgetting. Because the original parameters are not changed, the general knowledge they hold cannot be overwritten by narrow task data, only added to, so PEFT-adapted models tend to retain broad competence better than fully fine-tuned ones. The trade-off is a modest ceiling: for tasks that demand large changes in behavior, the limited capacity of the trained parameters can fall short of full fine-tuning, though for most adaptation it is close.

Parameter-efficient fine-tuning is the practical, cost-conscious branch of fine-tuning and a concrete realization of transfer learning, reusing a frozen pretrained backbone while learning only a thin task-specific layer. LoRA is its flagship instance, and the whole family is the standard answer to the question of how to adapt ever-larger models without ever-larger budgets.
