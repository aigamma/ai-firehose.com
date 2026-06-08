---
title: Subagents
slug: subagents
kind: technique
category: Agents and Tool Use
aliases: sub-agents, agent spawning, child agents
related: multi-agent-system, agent-orchestration, task-parallelization, task-decomposition, context-management, ai-agent
summary: Specialized helper agents that a main agent spawns to handle a piece of a task, each with its own fresh context, tools, and instructions, reporting a result back. The point is less parallelism than context isolation: each subagent works in a clean window and returns only its conclusion, which keeps the main agent's context focused.
---

A single agent on a large task drowns in its own context. Every file it reads, every tool result, every dead end piles into one window, diluting its attention and eventually crowding out the goal. Subagents are the response: rather than doing everything in one context, the main agent delegates a sub-task to a fresh helper agent, which does the work in its own window and hands back only the result.

A subagent is spawned with a narrow brief, its own tools, and a blank context, runs to completion, and returns a summary. The design choices are what to delegate and what comes back. Delegate work that is self-contained and verbose in the doing but compact in its result, reading a whole codebase to answer one question, or trying several approaches and reporting the best, so the expensive exploration happens off to the side. The return contract matters most: the subagent should hand back the conclusion, not its transcript, or the main agent inherits the very clutter delegation was meant to avoid.

The obvious benefit is parallelism, running many subagents at once, but the deeper one is context isolation. Each subagent reasons in a clean window sized to its sub-task, so a job far larger than any single context could hold becomes tractable, decomposed into pieces that each fit. A subagent is, at bottom, a way to spend a fresh context budget on a sub-problem and keep only the answer, which is why subagents help even when they are run one at a time.

The cost is coordination and trust. The main agent sees only each subagent's summary, the same one-layer-removed position a manager occupies with a report, so a confident but wrong summary propagates unchecked unless the result is verifiable. Subagents are therefore most powerful when paired with a checkable contract on what they return, the same discipline that governs delegating to any agent: force the result to be evidence, not assurance.
