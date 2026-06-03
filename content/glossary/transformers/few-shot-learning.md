---
title: Few-Shot Learning
slug: few-shot-learning
kind: technique
category: Transformers and LLMs
aliases: few-shot prompting, few shot, k-shot
related: in-context-learning, zero-shot-learning, prompt-engineering, instruction-tuning, large-language-model
summary: Prompting a model to perform a task by including a handful of worked examples in the prompt so it infers the pattern and applies it, a use of in-context learning that often needs no fine-tuning at all.
---

Few-shot learning, in the language-model sense, means teaching a task by example, in the prompt. Instead of training on thousands of labeled cases, you show the model a few demonstrations, each an input paired with the desired output, and then give it a new input. The model infers the pattern from those examples and continues it. The "few" is the small number of shots, often a handful, and the whole thing happens at inference with no weight updates, which is why it is a direct application of in-context learning.

The idea moved to the center of the field with the observation that sufficiently large language models are strong few-shot learners: given just a few examples of a task in the prompt, they perform it well, sometimes rivaling models fine-tuned on far more data. That decoupled doing a task from training for it, and made prompting a practical alternative to building a dataset and a custom model for every problem.

In practice few-shot prompting earns its keep when the task is unusual, when the desired output format is specific, or when zero-shot instructions alone leave the model unsure. The examples pin down both what to do and how to present the answer.

It has costs and quirks. Examples consume context-window space, which bounds how many you can include, and results can be surprisingly sensitive to which examples you pick and the order you put them in. When plenty of training data exists, fine-tuning usually wins, so few-shot prompting is best seen as a fast, flexible first resort rather than the end state.
