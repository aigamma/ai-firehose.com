---
title: Skills
slug: skills
kind: tool
category: Agents and Tool Use
aliases: agent skills, Claude Skills
related: tool-use, function-calling, ai-agent, agentic-workflow, model-context-protocol, agent-memory, code-interpreter
summary: Packaged, reusable capabilities an agent loads on demand, bundling instructions, code, and resources for a specific kind of task so the agent gains an ability without that knowledge permanently crowding its context. A way to extend what an agent can do without retraining it or bloating every prompt.
---

An agent's competence is bounded by two things: what its model knows, and what it can be told within the context window at the moment it acts. Retraining to add an ability is slow and expensive; stuffing every possible instruction into every prompt is wasteful and dilutes attention. Skills are the answer to that bind: self-contained packages of instructions, code, and resources that an agent loads only when a task calls for them, gaining a capability on demand instead of carrying it always.

A skill bundles what an agent needs to do one kind of job: a description of when to use it, the steps to follow, and often executable code or reference files it can draw on. The agent keeps a lightweight index of the skills available and pulls the full contents of one into context only when the situation matches, then sets it aside. This is progressive disclosure applied to capability: the working context stays small while the potential repertoire grows large, because the detail lives on disk until the moment it is relevant.

The elegant part is that a skill is mostly just structured context, not new model weights, which means a capability can be authored, versioned, shared, and improved like a document rather than trained like a model. A team can write a skill once and every agent inherits it; a bad step is fixed by editing text, not by retraining. The cost is that skills are only as reliable as the model's judgment about when to invoke them and how faithfully to follow them, so a poorly scoped skill can be ignored when it was needed or misapplied when it was not.

Skills point at a particular vision of how agents scale: not one ever-larger model that knows everything, but a modest model plus a growing library of composable, inspectable abilities it can reach for. That mirrors how human expertise actually works, a general reasoner who knows where to find the procedure rather than memorizing every procedure, and it locates progress in the library and the retrieval, not only in the weights.
