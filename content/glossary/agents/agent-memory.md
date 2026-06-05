---
title: Agent Memory
slug: agent-memory
kind: technique
category: Agents and Tool Use
aliases: agent memory, long-term memory
related: ai-agent, planning, react-prompting, reflection, autonomous-agent, multi-agent-system, tool-use
summary: The mechanisms an agent uses to retain and recall information across the steps of a task and across sessions, compensating for a language model that is stateless between calls and bounded by its context window. Its job is to give a forgetful model a usable, selective past: store the full history elsewhere and feed back only the fragments relevant now.
---

Agent memory is how an agent keeps and retrieves information over time. The language model at an agent's core is stateless: each call sees only what is placed in its context window, and it forgets everything once the call returns. For a single short task that may be fine, but any agent that runs across many steps, or that should remember a user across sessions, needs a memory layer that lives outside the model. Agent memory is the collection of stores and retrieval strategies that supply the model with the right past information at the right moment, so the agent behaves as if it has continuity rather than starting blank every turn.

This matters because the context window is both finite and the only thing the model actually sees, and the keeper follows. A long-running agent accumulates far more history (observations, intermediate results, prior decisions) than can fit in context at once, and stuffing everything in is both impossible and counterproductive, since irrelevant detail dilutes the model's attention. Memory solves this by storing the full history elsewhere and feeding back only the fragments that are relevant now. Without it, an agent repeats work it already did, forgets constraints it was given, and loses the thread of a long task.

Memory is commonly split into short-term and long-term forms. Short-term, or working, memory is the running transcript of the current task, the recent thoughts, actions, and observations that the agent carries forward turn to turn, often summarized or trimmed to fit the window. Long-term memory persists beyond a single task: facts, past episodes, and learned preferences are written to an external store, frequently a vector database, and recalled later by semantic similarity, the same retrieval pattern used in retrieval-augmented generation. Some agents also keep procedural memory, reusable skills or routines that worked before and can be invoked again.

Agent memory is a load-bearing component of any serious ai-agent and especially of an autonomous-agent operating over a long horizon. It works hand in hand with planning, holding the plan and its progress so the agent knows what it has done and what remains, and with reflection, storing the lessons of past attempts so the agent can avoid repeating mistakes. In a multi-agent-system, a shared memory can act as a common blackboard through which agents exchange state. In every case the purpose is the same: to give a forgetful model a usable, selective past.
