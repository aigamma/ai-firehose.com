---
title: Large Language Model
slug: large-language-model
kind: technique
category: Transformers and LLMs
aliases: LLM, large language models
related: transformer, next-token-prediction, scaling-laws, self-attention, context-window, tokenization
summary: A transformer with billions of parameters trained on vast text by next-token prediction, which from that one simple objective acquires broad language and reasoning ability steerable to many tasks with no task-specific training. It is best understood not as a database or a reasoning engine but as an extremely capable next-token predictor, a framing that explains both its generality and its tendency to hallucinate.
---

A large language model is a neural network, almost always a transformer, trained on a very large body of text to predict the next token in a sequence. The "large" refers to two things at once: the number of parameters, typically billions to hundreds of billions, and the size of the training corpus, often trillions of tokens drawn from books, web pages, and code. From this single, simple objective, predicting what comes next, a model trained at this scale acquires a surprisingly broad command of grammar, facts, reasoning patterns, and styles.

The defining surprise is generality. A model trained only to continue text can, with the same weights, translate, summarize, write code, answer questions, and follow instructions, often with no examples or just a few provided in the prompt. This is in-context learning: the model adapts its behavior from what it reads in its context window rather than from any change to its parameters. Generality of this kind is why these models are also called foundation models, since one base model can be adapted to a wide range of downstream applications.

A large language model is typically built in stages. Pretraining does the heavy lifting, running next-token prediction over the giant corpus to absorb knowledge and capability, the expensive phase that the scaling laws describe and forecast. Pretraining is then usually followed by alignment, where techniques like instruction tuning and reinforcement learning from human feedback shape the raw model into one that follows instructions, stays helpful, and refuses unsafe requests. The base model knows a great deal but is unwieldy; alignment makes it usable.

Understanding a large language model means holding both its power and its limits in view, and the unifying frame is the keeper. It generates token by token, so its working memory is bounded by the context window, and its knowledge is frozen at training time unless given fresh information through retrieval or tools. Because it is optimized to produce plausible continuations rather than verified truth, it can state false claims fluently and confidently, a failure called hallucination. These models are best understood not as databases or reasoning engines but as extremely capable next-token predictors whose strengths and weaknesses both flow from that one objective scaled up enormously.
