---
title: Learning Rate Warmup
slug: learning-rate-warmup
kind: technique
category: Optimization
aliases: warmup, linear warmup
related: learning-rate, learning-rate-schedule, adam, gradient-clipping, weight-initialization, loss-landscape
summary: Beginning training with a near-zero learning rate and ramping it up over the first hundreds or thousands of steps, to survive the most fragile moment in a run: the start. It is near-mandatory for transformers trained with Adam, because the optimizer's early per-parameter statistics are estimated from almost no data and would otherwise take wild, high-variance steps.
---

Learning rate warmup starts training gently. Rather than applying the full target rate from the first step, the rate is set near zero and increased, usually linearly, over an initial window until it reaches the intended value, after which the main schedule takes over. The maneuver lasts only a small fraction of training, often a few hundred to a few thousand steps, but it governs the most fragile moment in the whole run: the very beginning, when the parameters are freshly random and the optimizer knows almost nothing about the loss landscape.

The early instability warmup cures has two distinct sources. First, a randomly initialized network can sit in a region where gradients are large or erratic, so a full-size step can overshoot violently and push the model into a bad region it never recovers from; a tiny initial rate keeps those first steps small while the parameters settle. Second, and this is the subtle one, adaptive optimizers like Adam estimate per-parameter gradient statistics from running averages that are nearly empty at the start, so their early step sizes are computed from a handful of noisy samples and carry enormous variance. Warmup gives those estimates time to accumulate enough history to be trustworthy before full steps are allowed, which is why warmup is close to mandatory when training transformers with Adam.

The payoff is that warmup is one of the cheapest interventions deciding whether a large run succeeds at all. Without it, deep transformers frequently diverge or land in a worse final solution, especially at the large batch sizes and high peak rates modern recipes use; with it, the same configuration trains stably. It is paired almost universally with a decay phase, the canonical large-model schedule warming up linearly and then decaying along a cosine curve so the rate rises to a peak and falls toward the end, and it interacts with gradient clipping, another guard against destructive early steps, the two commonly used together.

The main knob is the length of the warmup window, usually set as a small percentage of total training: too short and the early instability is only partly tamed, too long and training time is wasted at sub-target rates. The peak rate warmup climbs to is the learning rate the rest of the schedule then manages, so warmup is best understood not as a separate mechanism but as the opening segment of the overall learning-rate schedule, the careful first stretch before the optimizer is trusted at full speed.
