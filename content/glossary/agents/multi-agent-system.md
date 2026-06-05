---
title: Multi-Agent System
slug: multi-agent-system
kind: technique
category: Agents and Tool Use
aliases: multi-agent systems
related: ai-agent, autonomous-agent, agentic-workflow, planning, task-decomposition, agent-memory, reflection
summary: An arrangement in which several agents, often with specialized roles, work together by communicating and coordinating, dividing labor instead of relying on one agent to do everything. The appeal is specialization and separation of concerns, the same reason humans form teams, and the cost is coordination: more agents can talk past each other, loop, or compound mistakes, and they multiply model calls and latency.
---

A multi-agent system has more than one agent collaborating to accomplish a goal. Rather than tasking a single ai-agent with every part of a job, the work is split across multiple agents, each typically given a focused role, its own instructions, and sometimes its own tools. The agents communicate, passing messages, results, or critiques, and coordinate their actions so their separate contributions combine into a finished outcome. The system as a whole behaves as a team, with the overall result emerging from the interaction of its members rather than from any one of them alone.

The appeal of this design is specialization and separation of concerns, the keeper, the same reasons humans organize into teams. A single agent given a sprawling task must juggle every responsibility within one context and one prompt, which strains its attention and blurs its focus; splitting the task lets each agent hold a narrower, clearer mandate: a researcher gathers facts, a writer drafts, a critic checks the draft, a coordinator routes the work. Narrow roles keep each agent's prompt and context tight, and a critic agent that only judges is often more reliable at catching errors than the same model grading its own output inline.

Multi-agent systems are organized in a few recurring shapes. A supervisor or orchestrator pattern puts one agent in charge of decomposing the task, often via task-decomposition, and delegating subtasks to worker agents, then assembling their results. A pipeline arranges agents in sequence, each transforming the previous one's output. A debate or critique pattern has agents challenge and refine one another's reasoning, a multi-party form of reflection. Coordination depends on a shared communication channel and frequently on a shared agent-memory or blackboard through which agents read and write common state.

These systems extend the reach of agents but add coordination cost and new failure modes: agents can talk past each other, loop, or compound one another's mistakes, and more agents means more model calls and higher latency and cost. They are most valuable when a task genuinely decomposes into parallel or distinct subproblems, or when an adversarial check materially improves quality. Each participant is still an ordinary agent, usually running its own planning and tool-use loop; the multi-agent system is the layer of structure that makes several of them cooperate, and at the far end shades into teams of autonomous-agent peers tackling open-ended goals together.
