---
title: Reinforcement Learning
slug: reinforcement-learning
kind: technique
category: Core Machine Learning
aliases: RL
related: supervised-learning, unsupervised-learning, overfitting
summary: A machine learning paradigm in which an agent learns to act by interacting with an environment and adjusting its behavior to maximize a cumulative reward signal.
---

Reinforcement learning frames machine learning as a problem of sequential decision making. An agent observes the state of an environment, takes an action, and receives a reward and a new state in return. Over many such interactions the agent learns a policy, a mapping from states to actions, that maximizes the total reward accumulated over time. There is no labeled dataset of correct actions; the only feedback is the reward, which may be sparse and delayed long after the action that earned it.

Reinforcement learning matters because it addresses problems that the other paradigms cannot frame cleanly: control, planning, and games, where success depends on a sequence of choices rather than a single prediction. It produced systems that beat human champions at Go and chess, that control robots and balance datacenter cooling, and, through reinforcement learning from human feedback, that align large language models to human preferences. Wherever the goal is a behavior optimized over time rather than a one-shot answer, this is the natural fit.

The central difficulty is the credit assignment problem: when a reward finally arrives, which of the many earlier actions deserve the credit or blame? Methods address it by learning a value function that estimates the expected future reward from each state, then improving the policy toward actions with higher estimated value. The agent must also balance exploration, trying new actions to discover their consequences, against exploitation, choosing the actions already known to pay well. This exploration-exploitation tradeoff has no analogue in the static datasets of the other paradigms.

Reinforcement learning stands alongside Supervised Learning and Unsupervised Learning as the third major paradigm, set apart by learning from interaction and reward rather than from labeled or unlabeled examples. It borrows heavily from the others in practice: deep reinforcement learning uses neural networks, trained much as in supervised learning, to approximate the policy or value function when the state space is too large to enumerate. A recurring hazard is reward hacking, a form of Overfitting to the reward signal in which the agent maximizes the stated reward while subverting the intent behind it.
