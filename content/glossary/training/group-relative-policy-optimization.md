---
title: Group Relative Policy Optimization
slug: group-relative-policy-optimization
kind: technique
category: Training and Fine-Tuning
aliases: GRPO
related: proximal-policy-optimization, policy-gradient, rlhf, reward-model, reasoning-model, reinforcement-learning
summary: A reinforcement-learning algorithm for language models that estimates each response's advantage by comparing it to a group of responses to the same prompt, deleting the separate value network proximal policy optimization needs. That single change makes reasoning-style training cheaper and simpler, and the group baseline is naturally matched to verifiable rewards like math and code correctness.
---

Group relative policy optimization is a reinforcement-learning method designed for fine-tuning language models, and it is the algorithm behind much of the recent wave of reasoning models. Its central idea is how it computes advantage, the quantity that tells the model whether a given response was better or worse than expected: rather than learning a separate model to predict expected reward, it samples a group of responses to the same prompt, scores them all, and judges each one relative to the group's average.

This is best understood against proximal policy optimization, the workhorse of reinforcement learning from human feedback, and the contrast is the keeper. Proximal policy optimization trains a second network, the value model or critic, roughly the size of the policy itself, to estimate the baseline reward to subtract from each outcome, and that critic doubles the memory and adds its own training instability. Group relative policy optimization deletes it: because every response in a group answers the identical prompt, the group's mean reward is itself a fair baseline, so the advantage of a response is simply its reward normalized against its siblings, with no critic learned.

The payoff is practical. Dropping the value network cuts memory and complexity, which matters when the policy is already a large model, and the group-relative baseline is naturally well matched to tasks with verifiable rewards, where a simple correctness check can score each sampled answer. This made it a good fit for training models to reason on math and code at scale, and its public use in that setting is what brought it to wide attention.

Like other policy-gradient methods it keeps a clipped update and a penalty that keeps the new policy close to a reference, so training does not drift too far in one step. Its quality still depends entirely on the reward: a noisy or gameable signal invites reward hacking just as it does for any reinforcement-learning approach.
