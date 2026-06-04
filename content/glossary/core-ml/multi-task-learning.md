---
title: Multi-Task Learning
slug: multi-task-learning
kind: technique
category: Core Machine Learning
aliases: multi-task learning, MTL, joint training
related: transfer-learning, fine-tuning, supervised-learning, instruction-tuning
summary: Training one model on several tasks at once, sharing most of its parameters across them, on the bet that related tasks have shared structure, so learning them together teaches a better representation than learning each alone. It is the principle behind instruction tuning and the foundation model, and its hazard is negative transfer, when unrelated tasks pull the shared weights in incompatible directions.
---

Multi-task learning trains a single model to do several things at once instead of building a separate model for each. The tasks share most of the model, typically a common backbone that learns general representations, with small task-specific heads on top, and the whole thing is trained on all the tasks' objectives together. The bet is simple and, when it holds, powerful: related tasks share underlying structure, so a representation forced to serve all of them learns that structure more cleanly than one trained on any single task in isolation.

The benefit comes directly from the sharing. A representation that has to support translation and summarization and question answering at once is pushed toward the features those tasks have in common, which acts as a useful inductive bias and as a regularizer: each task constrains the shared parameters, making them less able to overfit any one task's quirks. Pooling data across tasks also lets a task with few examples borrow strength from tasks with many, so the whole can be more than the sum of its parts.

This idea is woven invisibly through modern AI. Instruction tuning is multi-task learning at enormous scale, teaching one model thousands of tasks all framed as natural-language instructions, and a foundation model is in effect the extreme limit of a multi-task learner, a single set of weights that handles an open-ended range of problems. Transfer learning is the close cousin where knowledge moves from one task to another in sequence rather than being learned jointly. Much of why one model can now do so many things traces back to this principle.

The main hazard is the mirror image of the benefit, and it is called negative transfer. When the tasks are unrelated or actively conflict, training them together hurts rather than helps, because the shared parameters get pulled in incompatible directions and end up serving none of the tasks well. Managing this, through which tasks are grouped together and how their losses are weighted against each other so a loud task does not drown out a quiet one, is the practical craft of multi-task learning, and the reason it is not simply a matter of throwing every task into one model.
