---
title: Task Decomposition
slug: task-decomposition
kind: technique
category: Agents and Tool Use
aliases: task decomposition, subtask decomposition
related: planning, ai-agent, agentic-workflow, multi-agent-system, reflection, autonomous-agent, agent-memory
summary: Breaking a large or complex goal into smaller, tractable subtasks an agent can solve one at a time and then combine, rather than attempting the whole goal in one step. The reason it works is that both difficulty and reliability scale badly with size: smaller subtasks fit in the model's attention and fail in isolation, and decomposition exposes the dependency structure that planning needs.
---

Task decomposition is splitting a hard goal into a set of smaller subtasks. Faced with an objective too large to accomplish in one move ("write a research report", "refactor this module", "plan a launch"), an agent first breaks it into parts, a sequence or tree of subtasks, each simpler and more directly solvable. The agent then works the subtasks individually and assembles their results into the finished whole. Decomposition is the bridge between a goal too big to attack head-on and the concrete, bite-sized actions an agent can actually carry out.

The technique matters because both the difficulty and the reliability of a task scale badly with its size, the keeper. A model asked to do too much at once tends to lose track of requirements, conflate steps, and make compounding errors, all within a single overloaded context, whereas smaller subtasks each fit comfortably in the model's attention, can be checked individually, and fail in isolation rather than dragging down the entire effort. Decomposition also exposes structure: once a goal is broken into parts, their dependencies become visible, which is precisely what planning needs in order to sequence the work correctly.

In language-model agents, decomposition is usually prompted. The model is asked to enumerate the steps or subgoals needed to reach the objective, sometimes producing a flat to-do list, sometimes a tree where subtasks spawn further subtasks. It can be done up front (decompose fully, then execute) or recursively and on the fly (break off the next piece, solve it, then decompose what remains). The subtasks may be tackled in sequence when they depend on one another, or in parallel when they are independent. Carrying the list of subtasks and their completion state is a job for agent-memory, so the agent always knows what is done and what is left.

Task decomposition is tightly bound to planning, which it feeds, and is a core move in almost every non-trivial agentic-workflow. It is what makes a long-horizon autonomous-agent tractable, since such an agent must continually break its overarching goal into the next actionable step. It also underlies the supervisor pattern in a multi-agent-system, where one agent decomposes the work and hands the resulting subtasks to specialized workers. Pairing decomposition with reflection, checking whether the subtasks truly cover the goal and whether each was done correctly, is what keeps a divided task from quietly drifting away from its original aim.
