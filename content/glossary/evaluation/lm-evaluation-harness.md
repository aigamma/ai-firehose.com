---
title: LM Evaluation Harness
slug: lm-evaluation-harness
kind: tool
category: Evaluation and Benchmarks
aliases: lm-eval-harness, lm-eval, evaluation harness
related: mmlu, perplexity, pass-at-k, benchmark-contamination
summary: A widely used open-source framework that standardizes how language models are evaluated across hundreds of benchmarks, fixing prompt formats, few-shot setups, and scoring so results are reproducible and comparable across models.
---

The LM Evaluation Harness exists because evaluation is far more fragile than it looks. The same model on the same benchmark can score very differently depending on the exact prompt wording, the number of few-shot examples, how answer choices are presented, and how the metric handles things like answer normalization or log-likelihood scoring. Without a shared procedure, two reported numbers for "MMLU" may not be comparable at all. The harness pins all of that down: it implements hundreds of tasks with fixed, documented evaluation procedures so a score means the same thing across models and across time.

This standardization is its whole value. It underpins many public leaderboards and lets a team evaluate a new model against established baselines with one consistent pipeline rather than reimplementing each benchmark and risking subtle, score-shifting differences. It supports the common task types, from multiple-choice knowledge questions scored by likelihood to generation tasks checked against references or execution.

The lesson it teaches is that a benchmark name alone is not a measurement; the harness and its settings are part of the measurement. Reproducible evaluation requires reporting not just the benchmark but the exact configuration used.

It does not eliminate every difficulty: results still depend on the chosen settings, and shared tooling does nothing about contamination, where a benchmark's data has leaked into training. But it removes a large source of accidental incomparability and makes honest, repeatable comparison the default.
