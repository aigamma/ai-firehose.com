---
title: Benchmark
slug: benchmark
kind: technique
category: Evaluation and Benchmarks
aliases: AI benchmark, evaluation benchmark
related: mmlu, swe-bench, llm-as-judge, agent-evaluation, perplexity, frontier-model, scaling-laws, hallucination
summary: A fixed, shared task with a scoring rule, used to compare models on a capability and to track progress over time. Benchmarks make the field measurable, but a number is only as honest as the gap between the test and the real ability it stands in for.
---

A field cannot improve what it cannot measure, and "the model seems smarter" is not a measurement. A benchmark turns a fuzzy capability into a number: a fixed set of tasks, a rule for scoring an answer, and a leaderboard that lets two models, or two versions of one model, be compared on the same ground. Benchmarks are how progress in AI became legible, fundable, and competitive.

Designing one is a series of consequential choices. What tasks represent the capability, whether multiple-choice questions, coding problems, or multi-step agent tasks. How an answer is scored, by exact match, by comparison to a reference, or by another model acting as judge. And how to keep the test honest, since a benchmark is only meaningful if the model has not already seen its answers during training. Each choice shapes what the score actually certifies, which is rarely exactly the capability the name promises.

The central failure is that a benchmark is a proxy, and a proxy under pressure stops measuring what it proxied. Once a benchmark matters, models are optimized toward it, by tuning, by training on similar data, or by contamination when the test questions leak into the training set, and the score rises faster than the underlying ability. This is Goodhart's law in its purest form: when a measure becomes a target, it ceases to be a good measure. It is why saturated benchmarks get retired, and why a single headline number deserves suspicion.

The arc of evaluation is a race between benchmarks and the models they measure. Each generation of models saturates the previous generation's tests, forcing harder ones, from trivia to graduate exams to open-ended agent tasks no exact-match rule can grade. The honest use of a benchmark is therefore comparative and provisional: it tells you which model is ahead on this slice today, not how capable either truly is, and certainly not how either will behave on the messy task you actually care about.
