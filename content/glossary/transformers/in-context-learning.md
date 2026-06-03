---
title: In-Context Learning
slug: in-context-learning
kind: technique
category: Transformers and LLMs
aliases: ICL, in context learning
related: large-language-model, few-shot-learning, zero-shot-learning, emergent-ability, prompt-engineering
summary: The ability of a large language model to learn a task from examples or instructions placed in its prompt, at inference time, with no change to its weights, the emergent capability that turned models from fixed tools into general few-shot learners.
---

In-context learning is the property that makes large language models feel general. A model performs a task it was never explicitly trained for simply because the task is described or demonstrated in the prompt, and it does so without any gradient updates or change to its parameters. The "learning" happens entirely in the forward pass, as the model conditions its next-token predictions on the context it was given. Show it a few translations and it translates; describe a classification scheme and it classifies.

What makes this remarkable is that the model was trained only to predict the next token over a huge corpus, yet that objective, at sufficient scale, produces a system that can pick up new tasks from a handful of in-prompt examples. In-context learning is one of the headline emergent abilities: small models barely do it, and it strengthens sharply as models grow. It is the foundation on which the whole discipline of prompting rests, in both its few-shot and zero-shot forms.

Exactly how it works is still debated. The model appears to infer, from the prompt, what task it is being asked to do and then apply skills absorbed during pretraining, and one influential line of theory frames it as the model implicitly running a learning algorithm over the in-context examples, a kind of gradient descent performed inside the attention layers. The mechanism is an active research question.

Its practical significance is hard to overstate: in-context learning decoupled teaching a model a task from training it. One frozen model can serve countless tasks, defined on the fly in natural language, which is what made general-purpose assistants and the prompt-as-interface paradigm possible. Its limits are the context window and the fact that, for tasks with abundant data, fine-tuning still beats prompting.
