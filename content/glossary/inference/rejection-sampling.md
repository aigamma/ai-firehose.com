---
title: Rejection Sampling
slug: rejection-sampling
kind: technique
category: Inference and Sampling
aliases: rejection sampling, rejection sampling fine-tuning
related: best-of-n-sampling, reasoning-model, synthetic-data, verifier, rlhf
summary: A method that generates candidates and keeps only those passing a check (a verifier, a test suite, or a quality threshold), discarding the rest; used both at inference to enforce constraints and in training to distill a model's own correct outputs.
---

Rejection sampling is the simple, powerful idea of generate-then-filter: produce candidates, keep the ones that pass an acceptance criterion, and throw away the rest. The criterion can be anything checkable, a unit test passing, a math answer matching, a format being valid, or a quality threshold from a judge.

It shows up in two important places. At inference, it enforces a requirement the model cannot be trusted to meet on the first try: sample until an output passes the verifier, which is how you reliably get, say, code that compiles or output that satisfies a constraint. In training, it is a major engine of modern model improvement: have the model generate many solutions to problems with known answers, keep only the verified-correct ones, and fine-tune the model on its own successful outputs. This rejection-sampling fine-tuning (in the spirit of self-taught reasoner methods) is a primary way reasoning models and high-quality synthetic data are produced, letting a model bootstrap from the fraction of attempts it gets right.

It is closely related to best-of-N sampling; the difference is the selection rule. Best-of-N keeps the single highest-scoring candidate, while rejection sampling keeps all candidates that clear a bar (or the first that does).

Its efficiency hinges on the acceptance rate and the checker. If correct outputs are rare, you waste many samples to find a few, and if the verifier is wrong, you keep bad outputs or discard good ones, so a trustworthy, ideally hard, verifier is what makes it work.
