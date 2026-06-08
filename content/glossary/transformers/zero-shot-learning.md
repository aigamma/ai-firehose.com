---
title: Zero-Shot Learning
slug: zero-shot-learning
kind: technique
category: Transformers and LLMs
aliases: zero-shot prompting, zero shot
related: few-shot-learning, in-context-learning, instruction-tuning, prompt-engineering, transfer-learning
summary: Doing a task from an instruction alone, with no examples, relying on what a model absorbed in pretraining and instruction tuning. It is the default way to use a modern instruction-following model, which is why chatting with an assistant feels like just asking, and the term carries a second, older sense: recognizing classes never seen in training from their descriptions.
---

Zero-shot learning is doing a task with no examples at all, only a description. You tell the model what you want in plain language ("classify the sentiment of this review") and it does it, drawing on everything it learned in pretraining and on its trained habit of following instructions. There are no demonstrations in the prompt, which is what distinguishes it from few-shot prompting.

For modern instruction-tuned models, zero-shot is the normal way to interact. Instruction tuning explicitly trains a model to follow plain directives across many tasks, so a well-phrased instruction is usually enough and the extra examples that few-shot prompting supplies become unnecessary. This is why chatting with an assistant feels like zero-shot use: you just ask.

It helps to know the term has two senses, and the gap between them is the point. The classic machine-learning meaning is recognizing classes never seen in training by reasoning over shared attributes or descriptions, identifying an animal you never trained on from a list of its traits; the language-model meaning, the one usually intended now, is simply prompting without in-prompt examples. Both share the spirit of generalizing beyond explicit demonstrations.

The trade against few-shot is straightforward: zero-shot is cheaper and simpler, spending no context-window budget on examples, but few-shot can pull ahead on harder tasks, on unusual formats, or when the model needs the pattern pinned down. A common workflow is to start zero-shot and add examples only if the instruction alone proves unreliable.
