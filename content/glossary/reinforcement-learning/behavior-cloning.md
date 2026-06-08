---
title: Behavior Cloning
slug: behavior-cloning
kind: technique
category: Reinforcement Learning
aliases: behavioral cloning, behavior cloning
related: imitation-learning, supervised-learning, reinforcement-learning, online-learning
summary: The simplest form of imitation learning, treating each expert state-action pair as a supervised example and training a policy to predict the expert's action, with no reward and no environment interaction. Its simplicity comes at a named cost, compounding errors from distribution shift: the moment the model strays from the demonstrated states, its mistakes snowball because nothing in the data shows how to recover.
---

Behavior cloning is imitation learning reduced to supervised learning. Collect a dataset of an expert acting, recording the state they saw and the action they took at each moment, and then train a model to predict the action from the state. That is the whole method: no reward, no environment interaction during training, just fitting a mapping from situations to actions on the demonstration data. Its simplicity is why it is often the first thing tried.

The simplicity comes at a real cost, and the cost has a name: compounding errors from distribution shift. The model is only ever trained on states the expert visited, which are the states a competent agent encounters, so the moment the model makes a small mistake, it lands in a slightly unfamiliar state, where its predictions are a little worse, which leads to a bigger mistake and a stranger state, and the errors snowball because nothing in the training data shows how to recover. A behavior-cloned driver that drifts toward the shoulder was never shown how to steer back.

This is why behavior cloning works best with abundant demonstrations that cover the states an agent will actually hit, and why fixes like DAgger, which iteratively collects expert corrections in the states the learner visits, exist to close the gap.

It is everywhere despite the flaw: self-driving from logged human driving, robot control from teleoperation, and, in language models, the supervised fine-tuning that clones human-written responses. When the demonstration coverage is good and the task is forgiving of small errors, it is a strong, cheap baseline.
