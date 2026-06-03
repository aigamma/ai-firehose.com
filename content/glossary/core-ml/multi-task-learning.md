---
title: Multi-Task Learning
slug: multi-task-learning
kind: technique
category: Core Machine Learning
aliases: multi-task learning, MTL, joint training
related: transfer-learning, fine-tuning, supervised-learning, instruction-tuning
summary: Training one model to perform several tasks at once, sharing representations across them, so that what is learned for one task helps the others and the shared model generalizes better than separate single-task models.
---

Multi-task learning trains a single model on several tasks simultaneously rather than building a separate model for each. The tasks share most of the model, typically a common backbone that learns general representations, with small task-specific heads on top, and the whole thing is optimized on all the tasks' objectives at once. The bet is that related tasks have shared structure, so learning them together is more than the sum of learning them apart.

The benefit comes from that sharing. A representation forced to serve many tasks tends to capture the underlying features they have in common, which acts as a useful inductive bias and a regularizer: each task constrains the shared parameters, making them less likely to overfit any single task's quirks. Pooling data across tasks also helps tasks that individually have little data borrow strength from those that have more.

This idea is woven through modern AI. Instruction tuning is multi-task learning at scale, teaching one model thousands of tasks framed as instructions, and a foundation model is in effect an extreme multi-task learner whose single set of weights handles an open-ended range of problems. Transfer learning is the close cousin where knowledge moves from one task to another rather than being learned jointly.

The main hazard is negative transfer: when tasks are unrelated or conflict, training them together can hurt rather than help, as the shared parameters get pulled in incompatible directions. Managing this, through how tasks are grouped and how their losses are balanced, is the practical craft of multi-task learning.
