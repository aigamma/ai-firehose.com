---
title: Curriculum Learning
slug: curriculum-learning
kind: technique
category: Training and Fine-Tuning
aliases: curriculum learning, easy-to-hard training
related: pretraining, fine-tuning, transfer-learning, reinforcement-learning, supervised-fine-tuning
summary: A training strategy that orders examples from easy to hard rather than presenting them randomly, so a model builds competence gradually. Its payoff is clearest on hard optimization, rugged loss landscapes, reasoning, sparse-reward RL, where a random start rarely stumbles onto success and a curriculum supplies the intermediate footholds, though defining "difficulty" well is itself the hard part.
---

Curriculum learning takes a cue from how people are taught: start with the easy material and work up to the hard, rather than throwing everything in at once. Applied to model training, it means presenting examples in a meaningful order of increasing difficulty instead of sampling them uniformly at random, on the intuition that early exposure to simple, clean cases lets the model form good representations and a stable footing, which then make the harder cases learnable rather than overwhelming.

Putting it into practice requires two ingredients: a way to measure difficulty and a schedule for introducing it. Difficulty might come from a heuristic (sequence length, noise level, problem complexity), from a separate model's confidence, or from the model's own loss in a self-paced variant where the learner effectively gates its own progression, taking on harder material only as it masters the easier, and the schedule then ramps the mix from easy toward hard over training.

The payoff is clearest on hard optimization problems, the keeper: tasks with rugged loss landscapes, reasoning problems, and reinforcement learning with sparse rewards, where a random start rarely stumbles onto success and a curriculum can supply the intermediate footholds. It also appears, less explicitly, in how pretraining data is ordered and mixed and in staged post-training, and it is part of how reasoning models are trained on progressively harder verifiable problems.

The main caveat is that defining difficulty is itself hard and task-specific, and a poorly chosen curriculum can help little or even hurt by starving the model of the variety it needs. The gains are real but depend on getting the ordering right.
