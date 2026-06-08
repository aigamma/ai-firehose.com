---
title: Reasoning Model
slug: reasoning-model
kind: technique
category: Frontier Architectures
aliases: reasoning models, large reasoning model, inference-time reasoning
related: chain-of-thought, test-time-compute, self-consistency, group-relative-policy-optimization, reinforcement-learning
summary: A language model trained to spend variable inference-time compute on an extended internal chain of thought before answering, usually via reinforcement learning on verifiable rewards, trading latency for sharply better performance on math, code, and logic. It made test-time compute a first-class axis of capability, a lever separate from model size, and its hidden chain can be unfaithful to the real computation.
---

A reasoning model is a language model taught to think at length before it answers. Where an ordinary model maps a prompt to a response in a single forward pass per token, a reasoning model first generates a long internal chain of thought, working through the problem, trying approaches, checking itself, and only then commits to a final answer. The defining feature is that the amount of this thinking is variable and can be scaled up at inference for harder problems.

The capability is usually instilled with reinforcement learning on problems that have checkable answers, such as mathematics and programming, where a correct final result gives a reliable reward. Trained against that signal, the model learns on its own to produce longer and more structured reasoning, to backtrack, and to verify intermediate steps, because those behaviors raise its success rate. This is different from simply prompting a base model to show its work; the long-form reasoning is learned and reinforced rather than merely elicited, and public examples that brought the approach to prominence include OpenAI's o1 and DeepSeek-R1.

Reasoning models made test-time compute a first-class axis of capability. For years gains came from scaling parameters and training data; reasoning models show that letting a model spend more tokens thinking at inference can lift accuracy on hard problems by a large margin, a separate lever from model size, which reframes the cost of intelligence as something partly paid per query rather than only once at training.

The trade is latency and price: a reasoning model may emit thousands of hidden tokens before answering, so it is overkill for simple tasks and best reserved for problems where correctness is worth the wait. The internal chain is also often hidden from the user and can be unfaithful to the model's true computation, which complicates interpretation and oversight, a caveat that matters as these models take on higher-stakes work.
