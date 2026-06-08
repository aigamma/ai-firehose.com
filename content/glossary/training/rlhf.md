---
title: RLHF
slug: rlhf
kind: technique
category: Training and Fine-Tuning
aliases: reinforcement learning from human feedback, RLHF
related: dpo, instruction-tuning, fine-tuning, constitutional-ai, pretraining
summary: A training method that aligns a model with human preferences by learning a reward model from human comparisons, then optimizing the model against it with reinforcement learning. It is the standard way to bake in qualities easy for humans to recognize but hard to write as an explicit loss, refusing harm, admitting uncertainty, staying on task, and its signature failure is reward hacking.
---

RLHF, reinforcement learning from human feedback, turns a knowledgeable but raw language model into a helpful, well-behaved assistant. Pretraining and instruction-tuning teach a model what is plausible and how to follow instructions, but they do not directly teach it which of many plausible responses humans actually prefer, and RLHF closes that gap by using human judgments as the training signal, optimizing the model to produce outputs people rate as more helpful, honest, and harmless.

RLHF matters because it was the breakthrough that made conversational assistants usable and was central to the leap in perceived quality that brought large language models to a mass audience. Many of the qualities users associate with a good assistant, refusing harmful requests, admitting uncertainty, formatting answers helpfully, staying on task, are not reliably produced by next-token prediction alone, and here is why: they are preferences, and RLHF is the standard way to bake preferences into a model when those preferences are easy for humans to recognize but hard to specify as an explicit loss.

The classic pipeline has three stages. First, supervised fine-tuning (instruction-tuning) on human-written demonstrations gives a reasonable starting policy; second, a reward model is trained, with humans shown pairs of model outputs for the same prompt picking the better one and a separate model learning to predict those preferences as a scalar reward; third, the language model is optimized with reinforcement learning, typically Proximal Policy Optimization (PPO), to maximize the reward model's score, while a penalty keeps it from drifting too far from the supervised starting point and degenerating. The result is a policy tuned toward human-preferred behavior.

RLHF has well-known difficulties. It is complex and unstable to run, requires a continuous supply of human comparison labels, and is vulnerable to reward hacking, where the model exploits quirks in the imperfect reward model to score highly without genuinely improving. These costs motivated simpler alternatives, most prominently direct preference optimization (DPO), which optimizes the same preference data directly without training a separate reward model or running reinforcement learning, and Constitutional AI replaces much of the human feedback with model-generated feedback guided by a written set of principles.

RLHF is the original and still influential approach to the alignment stage that follows pretraining and instruction-tuning. Understanding it clarifies the whole post-training landscape, because DPO, constitutional AI, and related methods are best understood as responses to the strengths and the pain points of RLHF.
