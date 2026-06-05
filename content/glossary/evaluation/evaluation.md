---
title: Evaluation
slug: evaluation
kind: technique
category: Evaluation and Benchmarks
aliases: model evaluation, LLM evaluation, evals
related: benchmark, mmlu, swe-bench, llm-as-judge, agent-evaluation, perplexity, hallucination
summary: The practice of measuring what a model can actually do, how well, and where it fails, through benchmarks, human judgment, model-graded scoring, and task-specific tests. It is the feedback signal the whole field steers by, and far harder than it looks because the thing being measured is open-ended.
---

You cannot improve, compare, or trust a model you cannot measure, and measuring a system that can produce almost any text in response to almost any input is genuinely hard. Evaluation is the discipline of pinning that down: deciding what good output is, building tests that elicit it, and scoring the results in a way that means something. Every claim about a model, that it is better, safer, ready to ship, rests on an evaluation, which makes the quality of the evals a ceiling on the quality of the decisions.

Evaluation runs on a few methods, each with a weakness. Benchmarks give a fixed, comparable number but only measure the narrow slice they contain. Human judgment captures nuance a benchmark misses but is slow, costly, and inconsistent. Using a strong model as an automated judge scales human-like judgment cheaply but inherits the judge's blind spots and biases. And task-specific evals, does this actually do the job in production, are the most honest but the hardest to build. Serious evaluation triangulates across several, because no single method is trustworthy alone.

The hardest truth in evaluation is that a model will quietly optimize for whatever you measure, so a flawed eval does not just give a wrong number, it steers development in the wrong direction. Optimizing toward a benchmark that does not capture real usefulness produces a model that scores well and helps little, and because the score went up, the failure stays invisible until users meet it. This is why evaluation is not a final checkpoint but a continuous design problem: the eval is the target, and you become what you measure.

As models grow more capable, evaluation gets harder, not easier, because the tasks that distinguish a great model from a good one are exactly the open-ended ones no exact-match rule can grade, writing, reasoning, agentic work. The frontier of AI is increasingly bottlenecked less by building stronger models than by knowing whether they are stronger, which makes evaluation, the unglamorous work of measuring honestly, one of the highest-leverage and least-solved problems in the field.
