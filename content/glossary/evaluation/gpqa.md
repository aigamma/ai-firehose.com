---
title: GPQA
slug: gpqa
kind: technique
category: Evaluation and Benchmarks
aliases: GPQA, Graduate-Level Google-Proof Q&A
related: mmlu, benchmark-contamination, reasoning-model, pass-at-k
summary: A benchmark of graduate-level, deliberately "Google-proof" multiple-choice questions in biology, physics, and chemistry, written and validated by domain experts to be extremely hard and resistant to shallow lookup, used to probe deep reasoning in frontier models.
---

GPQA was built to be hard in a specific way: hard even for capable people with the internet open. Its questions are graduate-level problems in biology, physics, and chemistry, written by domain experts and validated so that PhD-level experts in the field answer them well while highly skilled non-experts, given unrestricted web access and ample time, still score poorly. That gap is the point. It certifies that the questions cannot be solved by quick lookup or shallow pattern-matching, only by genuine domain reasoning.

The benchmark exists because older knowledge tests like MMLU have saturated, with frontier models scoring near the ceiling, so they no longer discriminate between strong systems and are increasingly exposed to training-data contamination. GPQA offers a high ceiling and, by design, demands reasoning rather than recall, which makes it a useful probe of the deliberate, multi-step thinking that reasoning models aim to provide. A smaller expert-validated subset, often called GPQA Diamond, is the most-cited slice.

Its difficulty and expert-validation make it a favored measure of whether a model can handle real scientific reasoning, and gains on it are read as evidence of genuine capability rather than benchmark familiarity.

Like any prominent benchmark it is not immune to eventual contamination or to being optimized against, and a multiple-choice format still permits some lucky guessing, so it is best read alongside open-ended and execution-based evaluations rather than as a single verdict.
