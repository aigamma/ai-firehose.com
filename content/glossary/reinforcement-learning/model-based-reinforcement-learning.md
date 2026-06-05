---
title: Model-Based Reinforcement Learning
slug: model-based-reinforcement-learning
kind: technique
category: Reinforcement Learning
aliases: model-based RL
related: reinforcement-learning, markov-decision-process, bellman-equation, value-function, monte-carlo-tree-search, temporal-difference-learning
summary: A family of reinforcement learning methods in which the agent learns or is given a model of the environment's dynamics and rewards, then uses it to plan or generate simulated experience, typically improving sample efficiency. Its draw is doing more with less real interaction, and its catch is model error: a planner will happily exploit the model's mistakes, optimizing imagined rewards that do not exist.
---

Model-based reinforcement learning is the branch of reinforcement learning in which the agent has, or learns, an internal model of how the world works: a predictor of the next state and reward given the current state and action. With such a model the agent can plan, imagining the consequences of actions before committing to them, and can learn from simulated rollouts rather than only from costly real interaction. This stands in contrast to model-free methods like q-learning, which learn values or policies directly from experience and never form an explicit model of the dynamics.

The reason to bother with a model is sample efficiency. Real interaction is often expensive, slow, or risky, think of a robot wearing out its joints or a recommendation system experimenting on real users. A model that captures the environment's transition structure, the same transitions that define the underlying markov-decision-process, lets the agent generate large quantities of cheap synthetic experience and reason about the future, so it can reach good behavior from far fewer real interactions. This advantage is why model-based methods are attractive wherever data is the bottleneck.

There are two broad ways to use a model. The first is background planning, where the model produces imagined transitions that are fed into an otherwise model-free learner; the Dyna architecture interleaves real and simulated updates this way, and modern systems like the Dreamer agents learn a compact latent world model and train a policy entirely inside it. The second is decision-time planning, where the agent uses the model to search forward from the current state and pick the best action, as monte-carlo-tree-search does inside AlphaZero. In both cases the model lets the agent apply the bellman-equation to states it has never actually visited.

The catch is model error, the keeper. A learned model is never perfect, and a planner will happily exploit the model's mistakes, optimizing for imagined rewards that do not exist in reality, a failure sometimes called model exploitation. Errors also compound over long rollouts, so a small per-step inaccuracy can make a hundred-step prediction useless. Much of the research in the area is about being robust to this: keeping rollouts short, planning with ensembles of models to quantify uncertainty, or learning models in a latent space tuned for prediction rather than pixel-perfect reconstruction.

The model-based and model-free families are not rivals so much as endpoints of a spectrum, and the strongest systems often combine them. AlphaZero pairs a learned value-function and policy (model-free components) with explicit tree search through a known game model. The practical question is always what to learn explicitly and what to leave implicit: a perfect simulator favors pure planning, while a hard-to-model, high-dimensional world may favor leaning more on model-free learning. Choosing that balance is one of the defining design decisions in applied reinforcement learning.
