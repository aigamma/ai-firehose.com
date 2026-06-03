---
title: Process Reward Model
slug: process-reward-model
kind: technique
category: Alignment and Safety
aliases: PRM, process reward model, step-level reward
related: reward-model, reward-bench, reasoning-model, chain-of-thought, rlhf
summary: A reward model that scores each step of a model's reasoning rather than only the final answer, giving dense feedback that better guides training and search for multi-step problems; contrasted with an outcome reward model that judges only the result.
---

A process reward model judges the journey, not just the destination. Where an outcome reward model looks only at a final answer and says good or bad, a process reward model, or PRM, scores each intermediate step of a chain of thought, marking where the reasoning is sound and where it goes wrong. The reward signal becomes dense rather than sparse, attached to every step instead of only the end.

This matters because outcome-only rewards have a known failure: a model can reach the right answer through faulty or lucky reasoning and be rewarded for it, or get a hard problem almost entirely right and be punished for a single final slip. Dense, step-level feedback fixes the credit-assignment problem, telling the model which specific steps helped, which is especially valuable for the long multi-step reasoning that math and code demand. PRMs are used both to guide search at inference, scoring partial solutions so a search can prune bad branches, and to train and select reasoning models.

The catch is the labels. Training a PRM requires judgments at the level of individual steps, which are far more expensive to collect than a single right-or-wrong outcome label, so a practical line of work bootstraps step labels automatically, for instance by checking how often continuing from a given step leads to a correct final answer.

It sits in the reward-model family alongside the outcome reward models evaluated by benchmarks like RewardBench, and the choice between process and outcome supervision is one of the central design questions in training models to reason.
