---
title: Deep Q-Network
slug: deep-q-network
kind: technique
category: Reinforcement Learning
aliases: DQN, deep Q-learning
related: q-learning, reinforcement-learning, value-function, temporal-difference-learning, markov-decision-process
summary: A landmark deep-RL algorithm that uses a neural network to approximate the Q-function, the value of each action in a state, enabling reinforcement learning directly from high-dimensional input like pixels, famously learning to play Atari games from the raw screen.
---

The Deep Q-Network combined classic Q-learning with a deep neural network, and in doing so launched the modern era of deep reinforcement learning. Q-learning estimates the value of taking each action in each state, the Q-function, but in problems with enormous state spaces you cannot store a table of those values. DQN replaces the table with a neural network that takes a state and outputs a Q-value for each action, so the agent can generalize across states it has never exactly seen. Its celebrated demonstration learned to play dozens of Atari games straight from the screen pixels and the score, reaching human or superhuman level with no game-specific engineering.

Making deep networks and reinforcement learning work together was not obvious, because naive combination is unstable: the targets the network chases are computed from the same rapidly-changing network, and consecutive frames are highly correlated. DQN introduced two stabilizing tricks that became standard. Experience replay stores past transitions in a buffer and trains on random samples of them, breaking the correlation between consecutive updates and reusing data efficiently. A separate target network, a slowly-updated copy used to compute the learning targets, keeps the objective from shifting under the network's feet.

Its significance was less the Atari scores than the proof of concept: deep networks could serve as the function approximators that let reinforcement learning scale to raw perceptual input, which opened the door to everything that followed.

It also has clear limits. It is sample-inefficient, learns value functions rather than policies, and handles only discrete action sets, so continuous control and more stable training pushed the field toward policy-gradient and actor-critic methods such as proximal policy optimization. DQN remains the canonical entry point to deep reinforcement learning.
