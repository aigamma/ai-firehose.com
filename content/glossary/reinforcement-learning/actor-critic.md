---
title: Actor-Critic
slug: actor-critic
kind: technique
category: Reinforcement Learning
aliases: actor-critic methods, advantage actor-critic
related: policy-gradient, value-function, temporal-difference-learning, proximal-policy-optimization, reinforcement-learning, bellman-equation
summary: A reinforcement learning architecture that combines a policy (the actor) with a learned value estimator (the critic), using the critic's estimates to reduce the variance of the policy's gradient updates.
---

Actor-critic methods fuse the two main families of reinforcement learning into one system. The actor is a parameterized policy that chooses actions, exactly as in policy-gradient methods. The critic is a learned value-function that estimates how good states or actions are, in the spirit of value-based methods. The actor learns by gradient ascent, and the critic supplies the signal that tells the actor which way is up. Each half does what it is best at, and the pair trains together.

The reason this combination is so widely used is that it fixes the chief weakness of plain policy gradients: high variance. A bare REINFORCE update weights each action by the full Monte Carlo return, a noisy scalar that makes learning slow and unstable. The critic replaces that raw return with a low-variance estimate of value, so the actor gets a far cleaner gradient. The cost is a small amount of bias from the critic's imperfect estimates, a trade that is almost always worth making in practice.

The signal the critic typically provides is the advantage, how much better an action did than the critic expected from that state. Concretely, the critic computes a temporal-difference error using the bellman-equation relationship: reward plus discounted value of the next state, minus value of the current state. That same temporal-difference-learning error trains the critic toward accuracy and simultaneously serves as the advantage estimate that scales the actor's update. One quantity does double duty.

Actor-critic is best understood as a spectrum between pure Monte Carlo policy gradients and pure value bootstrapping. By choosing how many real reward steps to use before deferring to the critic's estimate, often via a technique called generalized advantage estimation, a practitioner dials the bias-variance trade explicitly. This flexibility, plus the ability to update online from incomplete episodes, is why actor-critic is the backbone of most modern algorithms.

Many state-of-the-art methods are actor-critic at heart. Advantage Actor-Critic (A2C) and its asynchronous variant A3C popularized the design; proximal-policy-optimization adds a clipped objective on top of an actor-critic core, and it is the algorithm most often used to fine-tune large language models in rlhf. Whenever a single network has both a policy head and a value head, an actor-critic structure is usually what makes the training stable.
