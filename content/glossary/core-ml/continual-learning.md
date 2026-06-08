---
title: Continual Learning
slug: continual-learning
kind: technique
category: Core Machine Learning
aliases: continual learning, lifelong learning
related: catastrophic-forgetting, transfer-learning, online-learning, fine-tuning, regularization
summary: Training a model on a stream of new tasks or data over time without erasing what it already learned, the open problem that standard training, which assumes all data is available at once, does not solve. Its central obstacle is catastrophic forgetting: naive updating on new data overwrites the old.
---

Standard training assumes you have all the data at once and can shuffle it together. The real world rarely cooperates: new tasks, new classes, and new data arrive over time, and you want a model that keeps up without retraining from scratch on everything each time. Continual learning is that goal, and it runs straight into a wall, because a neural network trained on new data tends to overwrite the weights that encoded the old, the failure called catastrophic forgetting.

The methods are organized around protecting old knowledge while admitting new. Regularization-based approaches add a penalty that anchors the weights most important to previous tasks, letting the rest move freely. Replay-based approaches keep or synthesize a sample of old data and interleave it with the new, reminding the model of what it must not forget. Architecture-based approaches give each task its own dedicated parameters, isolating them so new learning cannot trample old. Each trades off memory, compute, and how much the tasks are allowed to share.

Underneath the methods is a single tension wearing different names: stability versus plasticity. A model rigid enough never to forget cannot learn anything new, and a model plastic enough to learn instantly forgets everything else, so every approach is a point on that spectrum, buying retention with some loss of adaptability or the reverse. There is no free setting; you choose where on the dial to sit for the task at hand.

Continual learning matters more as models get expensive, because retraining a frontier model from scratch to absorb a little new knowledge is absurdly costly, which is why cheaper adaptation, fine-tuning, parameter-efficient methods, and retrieval that sidesteps weight updates entirely, is where most practical "continual" learning actually happens. The pure version, a single model that learns forever without forgetting, remains largely unsolved, a standing reminder that the brain's effortless lifelong learning is a capability current AI has not matched.
