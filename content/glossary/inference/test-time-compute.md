---
title: Test-Time Compute
slug: test-time-compute
kind: technique
category: Inference and Sampling
aliases: inference-time compute, test-time scaling
related: chain-of-thought, speculative-decoding, greedy-decoding, beam-search, temperature
summary: The strategy of spending more computation at inference time, rather than only at training time, to improve a model's answers: generating longer reasoning, sampling many candidates, or searching, so accuracy scales with the compute spent per query.
---

Test-time compute refers to the deliberate use of extra computation when a model answers a question, as opposed to the computation spent once during training. The traditional picture of a language model is that all the cost is paid up front in training, after which each inference is a cheap single pass. Test-time compute breaks that assumption: it treats the amount of work done per query as a dial that can be turned up to buy better answers, trading latency and money at inference for accuracy.

It matters because, for hard reasoning problems, spending more compute at inference can rival or exceed the gains from making the model itself larger. A smaller model that is allowed to think longer, by producing an extended chain-of-thought, sampling many independent solutions and voting, or searching over candidate steps, can match a much bigger model answering in one shot. This reframing, that inference is a place to invest compute and not just to harvest a trained model, is the basis of the reasoning-model wave and the rationale behind systems that visibly deliberate before answering.

The mechanisms come in several shapes. The simplest is sequential: let the model generate a long reasoning trace so it can work through intermediate steps before committing to a final answer. Another is parallel: sample many candidate solutions at a nonzero temperature and aggregate them, by majority vote or by scoring with a verifier model. A third is search: expand and prune a tree of reasoning steps, closer in spirit to beam search than to plain decoding. These can be layered, and a separate model is often trained to judge which candidate reasoning is actually correct.

The defining property of test-time compute is a smooth scaling curve: accuracy tends to rise predictably as the compute budget per query grows, giving a knob that can be set per request according to how much the answer is worth. That makes inference efficiency directly valuable, since cheaper tokens mean more thinking for the same cost, which is why test-time scaling is usually deployed alongside serving optimizations like speculative-decoding and quantization. The cost is real, more latency and more spend on every hard query, so the budget is matched to the difficulty of the task rather than applied uniformly.
