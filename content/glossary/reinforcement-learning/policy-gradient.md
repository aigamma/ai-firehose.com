---
title: Policy Gradient
slug: policy-gradient
kind: technique
category: Reinforcement Learning
aliases: policy gradient methods, REINFORCE
related: reinforcement-learning, actor-critic, proximal-policy-optimization, value-function, reward-shaping, rlhf
summary: A family of methods that directly optimize a parameterized policy by following the gradient of expected reward, making high-reward actions more likely, rather than learning values and acting greedily. This direct route handles continuous and stochastic policies value-based methods struggle with, and its central problem is high variance, fixed by subtracting a value-function baseline, which leads straight to the advantage and actor-critic.
---

Policy gradient methods take a different route from value-based methods like q-learning. Instead of learning the value of actions and acting greedily, they parameterize the policy itself, usually as a neural-network that maps states to a probability distribution over actions, and adjust those parameters directly to increase expected reward. The policy is optimized end to end by gradient ascent on the very quantity we care about: the long-run return.

This direct approach matters because it handles cases value-based methods struggle with. It works naturally in continuous action spaces, where taking a max over actions is intractable; it can represent stochastic policies, which are sometimes optimal and which keep a useful amount of randomness for exploration; and because it optimizes the objective directly, it tends to behave smoothly as parameters change. These strengths are why policy gradients underpin much of modern reinforcement learning from human feedback, the policy-optimization step of rlhf being a policy gradient update on a language model.

The central result is the policy gradient theorem, which gives a usable expression for the gradient of expected return even though the environment's dynamics are unknown and non-differentiable. The gradient turns out to be the expectation of the score (the gradient of the log probability of the action taken) weighted by how good that action was. The simplest realization, REINFORCE, runs an episode, then pushes up the log-probability of every action in proportion to the total return that followed it: actions on high-reward trajectories become more likely, actions on poor ones less so.

The naive estimator is unbiased but notoriously high in variance, because a single scalar return is a noisy signal shared across many actions, and fixing that is the crux. The standard fix is to subtract a baseline, typically a learned value-function estimate of the state's worth, which leaves the gradient unbiased but greatly reduces its variance. Weighting the update by how much better an action did than the baseline, rather than by the raw return, yields the advantage and leads directly to actor-critic architectures.

Plain policy gradients are also sensitive to step size: too large an update can collapse the policy, and because the data was collected under the old policy, a big move makes that data stale. Taming this instability is exactly what later methods address, with trust regions and clipped objectives such as proximal-policy-optimization, now the default workhorse for fine-tuning large models with reinforcement learning.
