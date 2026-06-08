---
title: Advantage Function
slug: advantage-function
kind: technique
category: Reinforcement Learning
aliases: advantage, advantage estimate
related: value-function, actor-critic, policy-gradient, proximal-policy-optimization, bellman-equation, temporal-difference-learning
summary: The quantity that measures how much better taking a particular action is than the state's average value, the action value minus the state value, the low-variance learning signal at the heart of modern policy optimization. Its power is isolation: it strips away how good the situation already was and leaves a signal centered on the action's own contribution.
---

The advantage function answers a sharper question than the value-function alone. Where a state value asks "how good is it to be here?" and an action value asks "how good is it to take this action here?", the advantage asks the difference: "how much better or worse is this action than the typical action from here?" Formally it is the action value minus the state value, A(s, a) equals Q(s, a) minus V(s). An advantage of zero means the action is exactly average for that state, a positive advantage means it is better than average, and a negative advantage means it is worse.

This framing matters because it isolates the part of the return that a decision actually controls. The raw return from a trajectory mixes together two things: how good the situation already was, and how good the chosen action was given that situation, and only the second part is information about the action; the first is noise as far as choosing actions goes. Subtracting the state value, which serves as a baseline, strips away that situational component and leaves a signal centered on the action's own contribution, an estimator with the same expected direction but far lower variance, which is why advantages, rather than raw returns, drive almost every competitive policy-gradient method.

The advantage is the bridge between value-based and policy-based reinforcement learning, and it defines the actor-critic architecture. The actor is a policy that proposes actions; the critic is a learned value estimate that supplies the baseline. Multiplying each action's log-probability gradient by its advantage pushes up the probability of better-than-expected actions and pushes down the probability of worse-than-expected ones, in proportion to how surprising the outcome was. A one-step advantage can be read directly off the bellman-equation as the temporal-difference error, the reward plus the discounted next-state value minus the current-state value, which connects the advantage to temporal-difference-learning.

Because a single-step estimate is low variance but biased by the imperfect critic, while a full Monte Carlo return is unbiased but high variance, practitioners interpolate between them. Generalized advantage estimation blends multi-step temporal-difference errors with an exponential weighting to trade bias against variance with one tunable knob. The advantages it produces are exactly what proximal-policy-optimization clips and optimizes, making the advantage function the quiet workhorse behind the algorithms that fine-tune large language models with reinforcement learning.
