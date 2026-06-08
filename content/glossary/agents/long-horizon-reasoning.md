---
title: Long-Horizon Reasoning
slug: long-horizon-reasoning
kind: technique
category: Agents and Tool Use
aliases: long-horizon reasoning, long-horizon planning, long-horizon tasks
related: planning, autonomous-agent, reasoning-model, task-decomposition, agent-memory, reflection
summary: Reasoning and acting coherently across many steps toward a goal far from the starting point, where each step depends on earlier ones and an early mistake can doom everything after. It is what separates an agent that finishes a long task from one that drifts, and the place where errors compound most punishingly.
---

A model can answer a hard question in one shot, but many real goals are not one shot. They are a hundred dependent steps, debug this system, run this multi-day research project, refactor this codebase, where step ninety rests on choices made at step three. Long-horizon reasoning is the capability of staying coherent across that whole arc, and it is hard for a reason short tasks are not: errors compound.

Over a long horizon, small problems turn fatal. A step that is 95 percent reliable is fine once, but chained fifty times it succeeds only about one run in ten, so reliability that looks excellent locally collapses globally. The agent also has to hold the goal, the plan, and the relevant state in a context window that cannot fit the entire history, so it must constantly decide what to keep and what to drop. And it must notice when it has gone wrong and recover, rather than confidently building on a mistake.

The governing fact is that long-horizon performance is set by the multiplication of per-step reliability, not its average, which is why the lever is rarely a smarter single step and almost always structure around the steps: decomposing the goal so pieces can be checked and recovered independently, grounding each step in real feedback so errors surface early, and external memory so the thread is not lost. The agent that finishes is the one whose mistakes are caught and corrected before they compound, not the one that never errs.

This is the current frontier of agency. Models are strong at the individual step and weak at the long arc, so progress on autonomous agents is largely progress on long-horizon reliability, won through reasoning models that think longer, harnesses that verify and retry, and memory that persists across the run. How long an horizon an agent can sustain before it drifts is, increasingly, the real measure of how capable it is.
