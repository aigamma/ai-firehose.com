---
title: Markov Decision Process
slug: markov-decision-process
kind: technique
category: Reinforcement Learning
aliases: MDP
related: reinforcement-learning, bellman-equation, value-function, temporal-difference-learning, model-based-reinforcement-learning, exploration-exploitation
summary: The mathematical framework that formalizes sequential decision making under uncertainty, defined by states, actions, transition probabilities, and rewards, the standard model on which reinforcement learning is built. Its load-bearing assumption is the Markov property, that the present state is a sufficient summary of the past, which is exactly the condition that lets the Bellman equation decompose a long trajectory into a one-step recursion.
---

A Markov decision process, or MDP, is the formal model almost all of reinforcement learning assumes underneath. It describes an agent interacting with an environment over time: at each step the agent observes a state, chooses an action, receives a reward, and transitions to a new state. An MDP is specified by four pieces, often summarized as a tuple: the set of states, the set of actions, the transition probabilities that say how likely each next state is given the current state and action, and the reward function. A discount factor is usually added to weigh near-term reward against the distant future.

The defining assumption is the Markov property, which gives the framework its name and is the keeper: the next state and reward depend only on the current state and action, not on the full history of how the agent arrived there. In other words, the present state is a sufficient summary of the past for the purpose of deciding what to do next, and this property is what makes the problem tractable, exactly the condition that lets the bellman-equation decompose a long trajectory into a one-step recursion.

MDPs matter because they give reinforcement learning a precise vocabulary. Concepts that would otherwise be vague become well-defined objects on top of an MDP: a policy is a mapping from states to actions, a value-function is the expected discounted return under a policy, and the goal is to find the policy that maximizes that return. Without this scaffolding, claims about an agent learning to behave optimally would have no rigorous meaning.

Solving an MDP means finding an optimal policy. When the transition probabilities and rewards are known, dynamic programming methods like value iteration and policy iteration compute the answer directly by repeatedly applying the Bellman recursion. When they are unknown, which is the usual case, the agent must learn from sampled experience using temporal-difference-learning or policy-gradient methods, or first estimate the model and plan with it as in model-based-reinforcement-learning. Either way the agent faces the exploration-exploitation tradeoff, since it can only learn the transitions and rewards by trying actions.

Many real problems violate the clean assumptions, and the framework extends to cover them. When the agent cannot see the full state, the model becomes a partially observable MDP, where the agent must infer a belief over hidden states. When rewards are sparse or misleading, designers turn to reward-shaping. These variations are all departures from the basic MDP, which remains the reference point that gives the whole field its shared structure.
