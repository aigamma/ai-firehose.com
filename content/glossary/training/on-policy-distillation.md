---
title: On-Policy Distillation
slug: on-policy-distillation
kind: technique
category: Training and Fine-Tuning
aliases: on-policy distillation
related: knowledge-distillation, rejection-sampling-fine-tuning, synthetic-data, rlhf, reasoning-model
summary: Distilling a teacher model into a student by training on the student's own outputs, graded or corrected by the teacher, rather than on a fixed set of teacher-written examples. It closes the gap that ordinary distillation leaves, where a student trained only on the teacher's text never learns to recover from the mistakes it actually makes.
---

Ordinary knowledge distillation trains a student on a fixed corpus the teacher produced: the teacher writes good answers, the student imitates them. The trouble is that the student never sees its own failure modes. At deployment it generates from its own distribution, drifts into states the teacher's clean examples never covered, and has no idea how to recover, the same compounding-error problem that haunts imitation learning. On-policy distillation fixes the mismatch by training on what the student actually produces.

The loop is the change. The student generates outputs from its current policy, the teacher then judges or corrects them, scoring each response, supplying the probability it would have assigned, or rewriting where the student went wrong, and the student is trained on that feedback. Because the training data is drawn from the student's own evolving distribution rather than the teacher's, every update targets the exact situations the student encounters, including the ones where it tends to fail.

The payoff is sample efficiency and robustness, and the reason is the distribution it trains on. A fixed dataset teaches the average case the teacher likes to write; on-policy data teaches the cases the student actually reaches, which is where the errors live, so the same number of tokens buys more correction. This is the distillation analogue of why on-policy reinforcement learning can beat learning from a static log: the signal is about where you are, not where the expert was.

The cost is that the teacher has to stay in the loop, grading generations as training proceeds rather than being run once up front, which is more expensive and more complex than dumping a corpus. The technique has become prominent in training smaller reasoning models, where the gap between a student's clean imitation and its real step-by-step behavior is widest, and where teaching it to recover its own chains of thought matters most.
