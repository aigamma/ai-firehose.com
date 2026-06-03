---
title: Pretraining
slug: pretraining
kind: technique
category: Training and Fine-Tuning
aliases: pre-training, foundation training
related: fine-tuning, transfer-learning, instruction-tuning, mixture-of-experts, knowledge-distillation
summary: The first and most expensive training phase, in which a model learns broad, general-purpose representations from a very large unlabeled corpus before any task-specific adaptation.
---

Pretraining is the stage where a model acquires its general knowledge of the world from raw data, typically a very large corpus of text, code, or images. The defining feature is that it uses a self-supervised objective, one that needs no human labels: the data supplies its own targets. For a language model the canonical objective is next-token prediction, where the model repeatedly predicts the following token from the preceding context, and the true next token serves as the label for free. Because no annotation is required, pretraining can consume trillions of tokens scraped from the open web, books, and code repositories.

Pretraining matters because it is where almost all of a large model's capability is created. The later stages that adapt a model to follow instructions or behave safely adjust a relatively small fraction of what the network knows; the bulk of its factual recall, grammar, reasoning patterns, and latent skills are laid down here. It is also the single most expensive step in the entire lifecycle, often costing millions of dollars in compute, which is why a pretrained model is treated as a reusable asset rather than something rebuilt per task.

Mechanically, pretraining runs ordinary supervised learning under the hood: a loss (cross-entropy over the vocabulary for language models) is minimized by gradient descent and backpropagation across many passes over the data. What makes it self-supervised rather than supervised is only that the labels are extracted from the input itself. Scale is the central lever. Empirical scaling laws show that loss falls predictably as model parameters, dataset size, and compute grow together, which is why each generation of foundation model is larger and trained on more data than the last. Architectures like mixture-of-experts let parameter count grow without a proportional rise in per-token compute.

The output of pretraining is a base model, also called a foundation model. A base model is fluent and knowledgeable but not yet helpful in a conversational sense: it continues text rather than answering questions, and it has no notion of an instruction or a safe response. Turning that raw competence into a usable assistant is the job of the stages that follow, primarily instruction-tuning and reinforcement learning from human feedback (RLHF).

Pretraining is the foundation on which the rest of this category rests. Transfer learning is the broad principle that the representations learned here carry over to new tasks, and fine-tuning, including parameter-efficient methods like LoRA, is how that transfer is realized in practice. Understanding which capabilities are forged in pretraining versus instilled in later stages is essential for reasoning about what a model can and cannot do, and about where its knowledge cutoff and its blind spots come from.
