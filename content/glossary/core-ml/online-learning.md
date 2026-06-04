---
title: Online Learning
slug: online-learning
kind: technique
category: Core Machine Learning
aliases: online learning, incremental learning, streaming learning
related: supervised-learning, stochastic-gradient-descent, catastrophic-forgetting, reinforcement-learning
summary: Learning from data that arrives in a never-ending stream, updating the model on each new example rather than training once over a fixed dataset. It suits any setting where data keeps coming and the world keeps changing, and its deep hazard is that absorbing the new tends to overwrite the old, the stability-plasticity dilemma.
---

Online learning treats data as a stream rather than a finished collection. Instead of training once over a fixed dataset and then freezing the model, an online learner updates itself continuously as new examples arrive, one at a time or in small batches, never assuming it has seen all the data there will be. This is the natural setting whenever data keeps coming and the world keeps shifting underneath it: recommendation systems, fraud detection, market prediction, and any deployed model that has to adapt to fresh behavior rather than relearn from scratch.

The contrast is with batch or offline learning, which assumes a static dataset available all at once and makes repeated passes over it. Online learning gives that up in exchange for two things: the ability to fold in new information immediately, and a bounded memory footprint, since it need not store the whole history. Mechanically it often looks like stochastic gradient descent taken to its logical end, one update per incoming example, and it overlaps with the bandit and reinforcement-learning settings, where data arrives through the learner's own interaction rather than from a fixed feed.

A defining challenge is concept drift: the statistical patterns in the stream change over time, so what the model learned last month may be wrong this month, and a model that settles into fixed beliefs will slowly go stale. This forces an online learner to keep adapting, weighting recent data more heavily and sometimes deliberately forgetting old data, which means it can never simply converge and stop the way a batch model does.

The deeper hazard sits underneath that. A model that updates on new data tends to overwrite what it learned from old data, a failure called catastrophic forgetting, and the central tension of online and continual learning is the stability-plasticity dilemma: a model plastic enough to absorb new patterns is also plastic enough to erase old ones, while a model stable enough to retain the old cannot take in the new. Holding those two needs in balance, staying responsive without forgetting, is the unsolved core problem the whole field circles around.
