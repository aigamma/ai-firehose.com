---
title: Value Function
slug: value-function
kind: technique
category: Reinforcement Learning
aliases: state-value function, action-value function
related: bellman-equation, q-learning, temporal-difference-learning, actor-critic, reinforcement-learning, markov-decision-process
summary: A function that estimates the expected long-run reward an agent will accumulate from a given state, or state-action pair, under a policy, the core predictive object most reinforcement learning algorithms learn. It converts the daunting goal of maximizing cumulative reward into something local and learnable, and it plays a dual role: a target for greedy action selection and a low-variance baseline for policy learning.
---

A value function is the central predictive quantity in reinforcement learning. It answers the question that matters most to a decision maker: starting from here and behaving in a certain way, how much reward should I expect to collect over the long run? Because immediate reward is a poor guide to good decisions, an action that pays little now may lead somewhere valuable, value functions let an agent reason about the future consequences of its choices in a single learned number.

There are two standard forms. The state-value function, written V(s), gives the expected discounted return from a state s under a given policy. The action-value function, written Q(s, a), gives the expected return from taking action a in state s and following the policy thereafter. The two are tightly linked: a state's value is the policy-weighted average of the action values available there, and the difference between an action's value and the state's value is the advantage, the quantity actor-critic methods use to improve a policy.

Value functions matter because they convert the daunting goal of maximizing cumulative reward into something local and learnable. Every value function obeys the bellman-equation, the recursion stating that the value of a state equals the immediate reward plus the discounted value of the next state, and that self-consistency is what makes learning possible: an agent can improve its estimates by enforcing the Bellman relation on sampled experience, which is exactly what temporal-difference-learning does, nudging each estimate toward a target built from the next reward plus its own current estimate.

Once an accurate value function is known, good behavior often follows for free. Acting greedily with respect to an action-value function, always choosing the action with the highest Q-value, yields a better policy, which is the principle behind q-learning and the policy-improvement step of dynamic programming. In a small problem the function can be stored as a table; in large or continuous problems it is approximated by a neural-network, the move that produced Deep Q-Networks and the value heads inside modern actor-critic agents.

Value functions also serve as low-variance critics for policy optimization. A bare policy-gradient update weighted by raw returns is noisy; subtracting a value-function baseline, or weighting by the advantage, sharply reduces that variance without introducing bias in expectation. This dual role, both as a target for greedy action selection and as a stabilizing baseline for policy learning, is why the value function recurs in nearly every corner of reinforcement learning, from classical control to the reward-model critics used when fine-tuning large language models.
