---
title: Agent Design
slug: agent-design
kind: technique
category: AI Engineering
aliases: designing agents, agent architecture
related: ai-agent, agentic-workflow, agent-orchestration, agent-memory, planning, tool-use, agentic-harness, reflection
summary: The engineering discipline of deciding how an agent perceives, plans, acts, and remembers: which tools it holds, how it decomposes a goal, where its state lives, and what checks bound it. Good agent design is mostly about constraining a capable model into something reliable, not making it more capable.
---

Handed the same strong model, two engineers will build agents that behave completely differently, because the model is only the engine; the design is everything that decides how it is used. Agent design is the set of choices about how an agent takes in a situation, decides what to do, acts, and remembers what happened, choices that matter more to whether the agent works than another point of model benchmark score.

A handful of decisions define an agent. What tools it holds, since its reach is exactly the actions it can take and no more. How it plans, whether it commits to a full plan upfront or decides one step at a time from what it just observed. Where memory lives, so a long task survives a context window that cannot hold it. And what bounds it, the checks, confirmations, and stopping conditions that govern what happens when it is uncertain or wrong. Each is a dial, and the setting depends on how costly a mistake is and how reversible.

The counterintuitive heart of agent design is that most of the work is subtraction, not addition. A model given every tool, infinite steps, and no checks is not a better agent, it is an erratic one, because more freedom means more ways to wander, loop, or do damage. The reliable agents are the constrained ones: a small, sharp set of tools, a bounded loop, clear stopping conditions, and a human in the path of the irreversible actions. Designing an agent is mostly deciding what it is not allowed to do.

As models get stronger, agent design does not get easier; the leverage just moves. The questions stop being whether the model can do a step and become how to shape the space it acts in so that a capable, occasionally-wrong system stays useful and safe. That is why agent design overlaps so heavily with the idea of a harness: both are the recognition that turning a powerful model into a dependable worker is a design problem, solved around the model and not inside it.
