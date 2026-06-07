---
title: GPQA
slug: gpqa
kind: technique
category: Evaluation and Benchmarks
aliases: GPQA, Graduate-Level Google-Proof Q&A
related: mmlu, benchmark-contamination, reasoning-model, pass-at-k
summary: A benchmark of graduate-level, deliberately "Google-proof" multiple-choice questions in biology, physics, and chemistry, written and validated by domain experts to be extremely hard and resistant to shallow lookup. Its defining design is a gap: PhD experts answer well while skilled non-experts with unrestricted web access and ample time still score poorly, which certifies the questions need genuine reasoning, not lookup.
---

GPQA was built to be hard in a specific way: hard even for capable people with the internet open. Its several hundred questions are graduate-level problems in biology, physics, and chemistry, written by domain-PhD experts and then validated against two audiences. Experts in the matching field answer most of them correctly; highly skilled non-experts, given unrestricted web access and as much time as they want, still score far below the experts, not much better than informed guessing. That gap between the expert and the determined googler is the entire design: it certifies that a question cannot be cleared by lookup or shallow pattern-matching, only by reasoning that draws on real understanding.

The benchmark exists because older knowledge tests like mmlu have saturated, with frontier models scoring near the ceiling, so they no longer separate strong systems from one another and are increasingly exposed to contamination as their public answers leak into training data. GPQA answers with a high ceiling and a design that demands reasoning over recall, which makes it a favored probe of the deliberate, multi-step thinking that reasoning models aim to provide. The expert-validated core subset, GPQA Diamond, is the slice most often quoted, because its questions survived the strictest agreement filter between validators.

Its difficulty is also its scarcity. Writing and double-validating a single question costs expert hours, so the set is small, and a small public set is one that can eventually be optimized against or contaminated like any other. A multiple-choice format, even a brutally hard one, still allows some lucky guessing and rewards recognition over open-ended generation. So a strong GPQA number is best read as one expensive, high-quality signal of scientific reasoning, set beside open-ended and execution-based evaluations rather than trusted as a single verdict.
