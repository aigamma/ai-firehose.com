---
title: Cognitive Architecture
slug: cognitive-architecture
kind: technique
category: Agents and Tool Use
aliases: cognitive architecture
related: agent-design, agentic-harness, planning, agent-memory, working-memory, reflection
summary: The fixed structural blueprint of a mind or an agent: the standing components, memory, perception, reasoning, action, and the rules by which they interact, into which specific knowledge is then poured. It is the claim that intelligence needs an organized scaffold around the learning, not just a big undifferentiated model.
---

A cognitive architecture is a theory of the parts of a mind and how they fit together: what memories exist and how they are written and read, how perception feeds reasoning, how decisions become actions, and what loop ties it all together. Classical architectures from cognitive science, SOAR and ACT-R, were built to model human cognition, proposing specific machinery like a production-rule engine and separate working and long-term memories. The idea is that intelligence is not one homogeneous process but a structured system of interacting components.

The concept has returned with force in AI agents, because a raw language model is missing exactly this structure. A model is a powerful but stateless function: brilliant at the single step, with no persistent memory, no standing goals, and no built-in loop. An agent's cognitive architecture is the scaffold built around it to supply those, a memory it can write to and retrieve from, a planning component that sets and tracks goals, a perception layer that turns tool results into usable state, and a control loop that sequences perceive, reason, and act.

The distinction worth holding is architecture versus knowledge: the architecture is the fixed structure, the knowledge is what flows through it. Two agents on the same model can behave completely differently because their architectures differ, just as the same model in a richer harness becomes a more capable worker. This is why the term overlaps so heavily with agent design and the agentic harness: all three name the recognition that the engine is necessary but the structure around it is what produces reliable behavior.

The open question a cognitive architecture poses is how much structure intelligence actually needs. One camp expects ever-larger end-to-end models to absorb planning, memory, and control into the weights, dissolving the explicit architecture; another holds that durable, inspectable structure around the model is essential for reliability and will persist. The truth so far is pragmatic: the most capable agents today are not the biggest models alone but capable models inside a deliberate architecture, the bitter lesson and the harness in tension.
