---
title: Regret Minimization
slug: regret-minimization
kind: technique
category: Reinforcement Learning
aliases: regret minimization, no-regret learning, minimizing regret
related: exploration-exploitation, reinforcement-learning, markov-decision-process, online-learning, monte-carlo-tree-search
summary: A framework for learning under uncertainty that measures performance by regret, the gap between the reward you actually earned and the reward you would have earned with the best fixed choice in hindsight, and seeks algorithms that drive that gap's growth as slow as possible. It is the theoretical backbone of bandits, online learning, and the solvers that cracked poker.
---

How do you measure a learning algorithm that has to act before it knows what is best? Regret minimization answers with a precise yardstick: regret is the difference between the total reward you actually collected and the total you would have collected had you known the single best action all along and stuck to it. You cannot avoid some regret, since you start ignorant, but a good algorithm makes its regret grow slowly relative to the number of decisions, so the per-decision regret shrinks toward zero. Such algorithms are called no-regret.

The framework's home is the bandit and online-learning setting, where regret makes the exploration-exploitation tradeoff quantitative. Explore too little and you may never find the best action, suffering linear regret forever; explore too much and you waste pulls on known-bad options. The celebrated algorithms, upper confidence bounds and Thompson sampling, are precisely the strategies that balance the two well enough to guarantee regret grows only logarithmically or as a square root in the number of rounds, a provable promise rather than a heuristic hope.

What makes regret minimization more than a bandit tool is its reach into games. Counterfactual regret minimization, run as self-play, converges to a Nash equilibrium in large imperfect-information games, and it is the engine behind the systems that reached superhuman play in poker. The connection is deep: minimizing regret against an adversary is mathematically tied to finding equilibria, so the same machinery that learns a good policy under uncertainty also solves strategic games where opponents are adapting too.

Regret minimization matters because it provides guarantees in exactly the messy online setting where reinforcement learning usually offers only empirical results. By defining success as a measurable gap against the best hindsight choice, it turns "learn well while acting" into a problem with provable bounds, which is why it underpins not just bandits and game solvers but also the analysis of how quickly any sequential decision-maker can be expected to stop leaving reward on the table.
