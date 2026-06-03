---
title: Foundation Model
slug: foundation-model
kind: technique
category: Transformers and LLMs
aliases: foundation model, base model
related: pretraining, large-language-model, self-supervised-learning, transfer-learning, frontier-model
summary: A large model trained on broad data at scale, usually by self-supervision, that serves as a general-purpose base adaptable to many downstream tasks by fine-tuning or prompting, rather than being built for one task; the term names the pretrain-once, adapt-many paradigm.
---

A foundation model is a single large model meant to be a starting point for everything, rather than a model built for one job. It is pretrained on a broad sweep of data at scale, almost always by self-supervision, and the resulting general capabilities and transferable representations are then adapted to specific tasks by fine-tuning or simply by prompting. The name, coined by Stanford researchers in 2021, captures the shift from the old pattern of training a fresh task-specific model for each problem to the new one of building on a shared base.

The reason it works is the combination of scale and self-supervision: training a big model to predict held-out parts of a huge corpus forces it to learn rich, broadly useful structure, and at sufficient scale new capabilities emerge that were not explicitly trained for. Large language models are the most prominent foundation models, but vision-language models and image generators fit the same mold.

The paradigm reorganized the whole field. Capability now concentrates in a few expensive-to-train bases that countless applications build on, which is powerful but also homogenizing: when everyone builds on the same few foundations, those models' biases, blind spots, and failures propagate to everything downstream.

It is closely tied to the related notions of a base model (the raw pretrained model before instruction tuning) and a frontier model (the most capable foundation models at the cutting edge), and to transfer learning, which is the mechanism by which a foundation model's general knowledge is specialized to a task.
