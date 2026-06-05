---
title: Agentic Workflow
slug: agentic-workflow
kind: technique
category: Agents and Tool Use
aliases: agentic workflows, agentic pipeline
related: ai-agent, autonomous-agent, react-prompting, planning, task-decomposition, reflection, tool-use, multi-agent-system
summary: A task structured so one or more language models drive it through multiple steps of reasoning, tool use, and self-correction, sitting between a single fixed prompt and a fully autonomous agent in how much latitude the model is given. It is the controlled middle where most working agent applications live, and its guiding principle is to use the least agency that works.
---

An agentic workflow is a way of building an application where a language model does not just produce one answer but drives a multi-step process, deciding and acting across several rounds. It occupies a middle ground between two extremes: at one end is a single model call, one prompt in, one completion out, no iteration; at the other is a fully autonomous-agent, handed a goal and left to chart its own course with broad freedom. An agentic workflow sits between them, giving the model meaningful latitude to reason, call tools, and revise, while keeping that latitude inside a structure the developer designed.

This framing matters because the two extremes have complementary weaknesses. A single prompt is predictable and cheap but cannot handle tasks that need information gathering, intermediate computation, or correction. A fully autonomous agent is flexible but harder to make reliable, debug, and bound. Agentic workflows let a builder dial in exactly as much agency as a task needs and no more: enough iteration and tool-use to solve the problem, enough imposed structure to keep behavior repeatable and observable. For many production systems this controlled middle is the sweet spot, more capable than a static prompt and more dependable than an open-ended agent.

Agentic workflows are assembled from a small vocabulary of recurring patterns. Prompt chaining runs a fixed sequence of steps, each model call consuming the last one's output. Routing classifies an input and sends it to the appropriate specialized path. A react-prompting loop interleaves reasoning and action when the next step depends on what a tool returns. An evaluator-optimizer loop pairs a generator with a critic, applying reflection so the work is checked and improved before it ships. Harder tasks add task-decomposition to split a goal into subtasks, and the most elaborate workflows hand subtasks to a multi-agent-system. Underneath, planning chooses which pattern applies and in what order.

In practice, an agentic workflow is the concrete shape most working agent applications take. It is the engineering discipline of composing an ai-agent's raw capabilities, reasoning, tool use, memory, and reflection, into a process that reliably solves a particular class of task. The guiding principle, the keeper, is to use the least agency that works: reach for a fixed chain before a loop, a loop before an autonomous agent, and add structure wherever predictability matters, so the system stays both capable and trustworthy.
