---
title: Supervised Fine-Tuning
slug: supervised-fine-tuning
kind: technique
category: Training and Fine-Tuning
aliases: SFT, supervised finetuning
related: fine-tuning, instruction-tuning, pretraining, rlhf, dpo
summary: Training a pretrained model on labeled input-output demonstrations with the ordinary next-token objective, the first alignment stage that teaches a base model to follow instructions before any reinforcement learning. It works by imitation, which is exactly its limit: the model can only be as good as its demonstrations and gets no signal about what is wrong, the gap preference optimization fills.
---

Supervised fine-tuning turns a raw pretrained language model into something that behaves like an assistant. A base model has read enormous amounts of text and can continue it fluently, but it has no particular inclination to follow an instruction, answer a question directly, or adopt a helpful tone. Supervised fine-tuning fixes that by continuing training on a curated dataset of demonstrations, pairs of an input (a prompt or instruction) and an ideal output, using the same next-token prediction loss as pretraining, just on this targeted data.

It is the first stage of the standard post-training pipeline: pretrain, then supervised fine-tune on demonstrations, then optionally refine with preference optimization such as RLHF or DPO. Supervised fine-tuning is where the model learns format and behavior by imitation: how to structure an answer, when to refuse, how to use tools, how to reason step by step if the demonstrations do. When the demonstrations are framed as instructions across many tasks, this is instruction tuning, a particular flavor of supervised fine-tuning aimed at broad instruction-following.

Its defining limitation is also its definition, and that is the keeper: the model learns to imitate the demonstrations, so it can only be as good as they are and cannot easily exceed them. It also has no signal about what is wrong, only examples of what is right, which is precisely the gap the later preference-optimization stage fills, by teaching the model from comparisons between better and worse responses rather than from single gold answers.

In practice supervised fine-tuning does most of the visible work of making a model usable, while the reinforcement or preference stage sands down the rough edges, and the quality of the demonstration data, increasingly model-generated and filtered, dominates the outcome.
