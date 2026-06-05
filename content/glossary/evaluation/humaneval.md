---
title: HumanEval
slug: humaneval
kind: technique
category: Evaluation and Benchmarks
aliases: HumanEval
related: pass-at-k, mmlu, benchmark-contamination, llm-as-judge
summary: A benchmark of 164 hand-written Python programming problems that scores a model by whether the code it generates passes hidden unit tests, measuring functional correctness rather than text similarity, and reported as pass-at-k. Its departure from similarity metrics like BLEU is the whole point: BLEU rewards looking like a reference answer, HumanEval rewards being right.
---

HumanEval is the benchmark that made code generation measurable in the way that matters: does the code actually run correctly. Each of its 164 problems gives the model a function signature and a docstring describing what the function should do, and the model must write the body. The completion is then executed against a set of held-out unit tests, and it counts as correct only if it passes all of them. This is a sharp departure from text-similarity metrics like BLEU, which reward looking like a reference answer, the keeper; HumanEval rewards being right.

Results are reported with pass@k, the probability that at least one of k sampled completions passes the tests. Pass@1 measures one-shot reliability, while pass@10 or pass@100 reflects how often the model can solve a problem given several attempts, which matters for workflows that sample and filter. The execution-based, functional framing is why HumanEval became a standard reference point for coding ability and why later coding benchmarks adopted the same run-the-tests philosophy.

Its limits are now well known. With only 164 Python problems it is small and narrow, it covers self-contained functions rather than real software, and as a famous public benchmark it is heavily exposed to training-data contamination, so frontier models score near the ceiling and high scores no longer discriminate well. These pressures pushed the field toward harder, more realistic successors such as benchmarks built on real repository issues and pull requests.

It remains a useful, fast sanity check and a historical baseline, best read alongside contamination-aware and repository-level evaluations rather than trusted alone.
