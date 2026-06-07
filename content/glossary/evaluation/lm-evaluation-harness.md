---
title: LM Evaluation Harness
slug: lm-evaluation-harness
kind: tool
category: Evaluation and Benchmarks
aliases: lm-eval-harness, lm-eval, evaluation harness
related: mmlu, perplexity, pass-at-k, benchmark-contamination
summary: A widely used open-source framework that standardizes how language models are evaluated across hundreds of benchmarks, fixing prompt formats, few-shot setups, and scoring so results are reproducible and comparable. Its lesson is that a benchmark name alone is not a measurement: the harness and its exact settings are part of the measurement, which is why two reported numbers for the same benchmark can disagree.
---

The LM Evaluation Harness exists because evaluation is far more fragile than it looks. The same model on the same benchmark can score very differently depending on the exact prompt wording, the number of few-shot examples, how answer choices are presented, and whether the metric scores a generated string or compares the log-likelihoods of the answer tokens. Without a shared procedure, two reported numbers for "MMLU" may not be comparable at all. The harness, built by EleutherAI, pins all of that down: it implements hundreds of tasks with fixed, documented evaluation procedures, so a score means the same thing across models and across time.

That standardization is its whole value. It underpins public leaderboards, including the Open LLM Leaderboard, and lets a team measure a new model against established baselines through one consistent pipeline rather than reimplementing each benchmark and risking subtle, score-shifting differences. It handles the common task shapes, from multiple-choice knowledge questions scored by likelihood to generation tasks checked against references or by execution.

The lesson it teaches is that a benchmark name alone is not a measurement: the harness and its exact settings are part of the measurement, which is why a responsible result reports not just "MMLU 80" but the harness, the shot count, and the scoring mode that produced it. It does not solve every problem. Results still depend on the chosen settings, and shared tooling does nothing about contamination, where the test data has leaked into training. But it removes a large source of accidental incomparability and makes honest, repeatable comparison the default rather than the exception.
