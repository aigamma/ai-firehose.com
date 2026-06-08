---
title: Constitutional AI
slug: constitutional-ai
kind: technique
category: Training and Fine-Tuning
aliases: CAI
related: rlhf, dpo, instruction-tuning, fine-tuning, pretraining
summary: An alignment method that trains a model to be helpful and harmless using AI-generated feedback guided by a written set of principles (a constitution), reducing reliance on human-labeled comparisons. Its distinctive contribution is making a model's values explicit and auditable in a document that can be reviewed and revised, rather than leaving them implicit in thousands of individual human labels.
---

Constitutional AI (CAI) steers a language model by an explicit, written set of principles, called a constitution, rather than primarily by case-by-case human judgments. The constitution is a list of natural-language rules describing the desired behavior, for example to avoid harmful, deceptive, or discriminatory responses and to be helpful and honest, and the model uses these principles to critique and improve its own outputs, so the supervision that shapes its behavior comes largely from the model itself, guided by the constitution, instead of from large volumes of human-labeled examples.

Constitutional AI matters because it addresses two practical limits of reinforcement learning from human feedback (RLHF). First, collecting human preference labels at the scale alignment requires is slow and costly, and exposing human raters to harmful content to label it has real downsides; second, behavior defined implicitly through thousands of individual labels is hard to inspect or audit. CAI makes the values explicit and legible in a written document that can be reviewed and revised, and it shifts much of the labeling burden from humans to the model, an approach often called reinforcement learning from AI feedback (RLAIF).

The method has two phases. In a supervised phase, the model generates responses, then is prompted to critique each against a principle from the constitution and revise it accordingly, and the revised responses become fine-tuning data, instilling the constitutional behavior through ordinary supervised learning. In a reinforcement phase, the model compares pairs of its own responses and chooses which better satisfies the constitution, producing AI-generated preference labels that train a preference model, which then guides optimization exactly where human comparisons would sit in RLHF. Humans still write the constitution and oversee the process, but they no longer hand-label most outputs.

The trade-offs are real. The quality of alignment depends heavily on how well the constitution is written and on the model's ability to apply its principles faithfully, and a capable model is needed to generate useful self-critiques in the first place; AI-generated feedback can also inherit the model's own blind spots. In practice CAI is often combined with some human feedback rather than replacing it entirely, and the optimization can use RLHF-style reinforcement learning or simpler preference methods such as direct preference optimization (DPO).

Constitutional AI is best understood as a variation on the preference-alignment stage that builds on instruction-tuning and parallels RLHF and DPO, swapping much of the human feedback for principle-guided AI feedback. It is notable both as a scalable alignment technique and as an attempt to make a model's values explicit and reviewable, which connects training methodology to the broader project of building transparent, trustworthy systems.
