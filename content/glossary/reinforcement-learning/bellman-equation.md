---
title: Bellman Equation
slug: bellman-equation
kind: technique
category: Reinforcement Learning
aliases: Bellman equation, Bellman optimality equation
related: value-function, q-learning, temporal-difference-learning, markov-decision-process, reinforcement-learning, model-based-reinforcement-learning
summary: A recursive consistency condition stating that the value of a state equals the immediate reward plus the discounted value of the states that follow, the mathematical foundation of nearly every reinforcement learning algorithm. It turns an impossible question, the total reward stretching off into the infinite future, into a one-step relationship, which is why almost every RL method is at bottom a different strategy for solving or approximating it.
---

At the heart of reinforcement learning sits a single self-consistency condition: the long-run value of being in a state must equal the reward you collect now plus the discounted value of wherever you end up next. This is the Bellman equation, the central recursion of dynamic programming, named after Richard Bellman, who formalized it in the 1950s. By turning a question about an entire future trajectory into a relationship between adjacent states, it makes long-horizon planning tractable.

This matters because the quantity an agent ultimately cares about, the total reward stretching off into the future, is impossible to evaluate directly by summing infinitely many steps. The Bellman equation breaks that intractable sum into a one-step relationship that a value-function must satisfy everywhere, and that is the keeper: almost every reinforcement learning method is, at bottom, a different strategy for solving or approximating this equation, which is why understanding it unlocks the rest of the field.

There are two flavors. The Bellman expectation equation describes the value of a fixed policy: the value of a state is the average over the actions that policy takes of the immediate reward plus the discounted value of the next state. The Bellman optimality equation describes the best achievable value: it replaces the average with a maximum over actions, asserting that an optimal agent always picks the action whose reward-plus-discounted-future-value is greatest. The discount factor gamma weights how much future reward counts relative to immediate reward, and the transition probabilities come from the underlying markov-decision-process.

When the environment's dynamics are fully known, the Bellman equation can be solved by dynamic programming, sweeping through all states and repeatedly applying the recursion until the values stop changing, a procedure called value iteration. This is the planning approach that model-based-reinforcement-learning uses once it has learned or been given a model of the world. The equation defines a contraction mapping, which guarantees these iterations converge to a unique fixed point.

When the dynamics are unknown, the same equation is applied to sampled experience instead. The difference between the two sides of the Bellman equation, estimated from a single observed transition, is the temporal-difference error, the learning signal at the heart of temporal-difference-learning and q-learning. In this sense the Bellman equation is not just one method but the shared backbone connecting planning, value estimation, and the policy-improvement loops that train modern agents.
