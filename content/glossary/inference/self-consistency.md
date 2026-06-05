---
title: Self-Consistency
slug: self-consistency
kind: technique
category: Inference and Sampling
aliases: self consistency, majority voting, sample and vote
related: chain-of-thought, test-time-compute, temperature, reasoning-model, top-p
summary: A decoding strategy that samples several independent chain-of-thought solutions at nonzero temperature and returns the answer they agree on most often. Its premise is that a correct answer can be reached by many distinct valid routes while errors are idiosyncratic and scatter, so agreement concentrates on the truth, and it needs only a crisp comparable final answer, no training.
---

Self-consistency improves a model's reasoning by sampling instead of trusting a single attempt. A greedy chain-of-thought produces one line of reasoning, and if that line takes a wrong turn early, the final answer is wrong with it; self-consistency draws many chains for the same question at a nonzero temperature, so each explores a somewhat different path, then takes a majority vote over the final answers. The intuition, and the keeper, is that a correct answer can be reached by many distinct valid routes, while errors tend to be idiosyncratic and scatter, so agreement concentrates on the truth.

In practice the method is simple: prompt for step-by-step reasoning, sample some number of completions with temperature high enough to create diversity, extract the final answer from each, and return the most common one. It requires no training and no change to the model, only more generation, and on arithmetic, commonsense, and symbolic reasoning benchmarks it gives a substantial lift over a single chain, especially for models large enough to reason at all.

Self-consistency is one of the clearest early examples of test-time compute: accuracy bought with inference rather than with a bigger model or more training, which connects it to the reasoning models that later made variable inference-time thinking a first-class capability. It also has obvious limits: the cost grows linearly with the number of samples, and a plain majority vote needs answers that can be compared for equality, so it suits problems with a crisp final answer more than open-ended generation.

It can be sharpened by weighting votes by the model's confidence, by checking each chain against a verifier, or by combining it with search over reasoning steps. In its basic form it remains a strong, cheap default whenever a task has a checkable answer and a few extra samples are affordable.
