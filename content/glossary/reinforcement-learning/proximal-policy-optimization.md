---
title: Proximal Policy Optimization
slug: proximal-policy-optimization
kind: technique
category: Reinforcement Learning
aliases: PPO
related: policy-gradient, actor-critic, reinforcement-learning, rlhf, reward-shaping, value-function
summary: A policy gradient algorithm that improves a policy in small, bounded steps by clipping how far each update can move the action probabilities, giving stable and reliable training; it is the default optimizer for reinforcement learning from human feedback.
---

Proximal Policy Optimization, or PPO, is a policy-gradient algorithm designed to be stable, sample-efficient, and simple to implement. It belongs to the actor-critic family, pairing a policy with a value estimate, and it has become the default choice across game playing, robotics, and the alignment of large language models. When a modern chatbot is tuned with reinforcement learning from human feedback, the optimizer doing the work is almost always PPO.

The problem PPO solves is the brittleness of vanilla policy gradients. A single update that is too aggressive can push the policy into a region where it performs badly, and because the experience was gathered under the old policy, that data no longer describes where the new policy now sits. Earlier methods like Trust Region Policy Optimization addressed this with a hard constraint on how far the policy may move, but that required heavy second-order computation. PPO captures most of the benefit with a simpler first-order objective, which is the core reason it caught on.

The mechanism is a clipped surrogate objective. PPO looks at the probability ratio between the new and old policy for each action and multiplies it by the advantage, the actor-critic estimate of how much better that action was than expected. The objective then clips this ratio to a narrow band around one, typically plus or minus 0.2, and takes the more pessimistic of the clipped and unclipped values. The effect is that once an update has moved the policy far enough in a direction, the objective flattens and stops rewarding further movement, so no single step can stray too far from the policy that generated the data. The advantages themselves usually come from generalized advantage estimation over a learned value-function.

PPO is on-policy, so it alternates between collecting a batch of fresh experience and running several gradient epochs over that batch before discarding it. Reusing each batch for multiple epochs makes it more sample-efficient than methods that take one step per sample, while the clip keeps those repeated updates from overshooting. The full loss usually adds a value-function term to train the critic and an entropy bonus to preserve exploration, balancing the exploration-exploitation tension.

In rlhf, PPO maximizes the score from a learned reward model while a Kullback-Leibler penalty keeps the tuned model close to its supervised starting point, a form of reward-shaping that prevents the policy from drifting into degenerate text that games the reward. This recipe, supervised fine-tuning followed by PPO against a reward model, was central to InstructGPT and ChatGPT. Simpler alternatives such as DPO now sidestep the reinforcement learning loop entirely, but PPO remains the reference method when an explicit reward signal must be optimized.
