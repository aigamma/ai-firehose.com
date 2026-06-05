---
title: Differential Privacy
slug: differential-privacy
kind: technique
category: Alignment and Safety
aliases: differential privacy, DP, DP-SGD
related: membership-inference, ai-safety, federated-learning, overfitting
summary: A mathematical framework that bounds how much any single training example can influence a model's outputs, giving a provable privacy guarantee: an observer cannot tell whether any one individual's data was used, even with arbitrary side knowledge. The guarantee is about the mechanism itself, not a hope the attacker lacks knowledge, and it is composable, so a privacy budget can be tracked, at the cost of accuracy.
---

Differential privacy puts a rigorous, worst-case bound on privacy. An algorithm is differentially private if adding or removing any single individual's record barely changes the distribution of its outputs, where "barely" is quantified by a parameter, epsilon, the privacy budget. Small epsilon means strong privacy: whatever the algorithm outputs, you cannot confidently infer whether any particular person was in the input, no matter how much outside information you bring. This is a guarantee about the mechanism itself, not a hope that an attacker lacks knowledge.

In machine learning the standard realization is differentially private stochastic gradient descent. During training it clips each example's gradient so no single record can dominate an update, then adds calibrated random noise to the aggregated gradient. The result is a model trained such that its parameters, and therefore its predictions, are provably insensitive to any one training example, which directly defends against the membership-inference and data-extraction attacks that exploit a model's tendency to memorize its data.

The defining property, and the reason it is trusted, is the keeper: the guarantee is mathematical and composable. The privacy cost of multiple analyses adds up in a quantifiable way, so a total budget can be tracked and enforced.

The cost is accuracy. The clipping and noise that protect individuals also blur the signal, so stronger privacy (smaller epsilon) generally means lower utility, the central privacy-utility tradeoff. Choosing epsilon is therefore a policy decision as much as a technical one, and differential privacy is often combined with federated learning so that data is both kept local and provably protected in the model that leaves.
