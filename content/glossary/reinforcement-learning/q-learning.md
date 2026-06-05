---
title: Q-Learning
slug: q-learning
kind: technique
category: Reinforcement Learning
aliases: Q-function, action-value learning
related: reinforcement-learning, bellman-equation, value-function, temporal-difference-learning, markov-decision-process, exploration-exploitation
summary: A reinforcement learning algorithm that learns the long-run value of taking each action in each state, then acts greedily with respect to those values, with no model of the environment. Its defining property is that it is off-policy: it can learn the value of the optimal policy while actually behaving more exploratorily, which is exactly what lets modern systems train on stored, logged experience rather than only fresh interaction.
---

Q-learning is one of the foundational algorithms of reinforcement learning. It learns a function Q(s, a), the expected cumulative reward of taking action a in state s and then behaving optimally thereafter. Once that action-value function is known, choosing the best action is trivial: in any state, pick the action with the highest Q-value. The agent never needs a model of how the environment transitions or pays out, which is why Q-learning is called model-free.

What makes Q-learning matter is that it is off-policy and provably convergent under mild conditions, the keeper. Off-policy means the agent can learn the value of the optimal policy while actually behaving according to some other, more exploratory policy, and this decoupling is powerful: an agent can wander, make mistakes, even replay old logged experience, and still converge toward optimal action values. The same property is what lets modern systems train on stored transitions rather than only on fresh interaction.

The learning rule is a sampled application of the bellman-equation. After observing a transition from state s through action a to reward r and next state s', the agent nudges Q(s, a) toward the target r plus the discounted maximum Q-value available at s'. The gap between that target and the current estimate is the temporal-difference error, and this update is a direct instance of temporal-difference-learning. Crucially, the target uses the max over next actions, so Q-learning bootstraps off its own best estimate of future value rather than off the action it actually takes next.

Because the agent must try actions to discover their value, Q-learning sits squarely inside the exploration-exploitation dilemma. A common compromise is the epsilon-greedy rule: act greedily most of the time, but with small probability pick a random action to keep gathering information. The discount factor, usually written gamma, controls how far-sighted the agent is, trading immediate reward against long-term return.

Classic Q-learning stores values in a table with one entry per state-action pair, which is exact but only feasible when the state space is small. Scaling to large or continuous spaces means replacing the table with a function approximator, most famously a neural-network, giving the Deep Q-Network (DQN) that learned to play Atari games from raw pixels. That move from table to network trades guaranteed convergence for the reach to handle high-dimensional problems, and it connects Q-learning to the broader value-function methods that underpin much of deep reinforcement learning.
