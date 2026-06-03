---
title: Computer Use
slug: computer-use
kind: technique
category: Agents and Tool Use
aliases: computer use, computer-using agent, GUI agent
related: ai-agent, tool-use, function-calling, autonomous-agent, vision-language-model
summary: An agent capability in which a model operates a computer the way a person does, by viewing the screen and issuing mouse and keyboard actions, letting it use arbitrary software through its graphical interface rather than a bespoke API.
---

Computer use lets an agent drive software the way a human does, through the graphical interface. Instead of calling a structured tool or API, the model is given a screenshot, decides what to do, and emits low-level actions: move the cursor to a coordinate, click, type, scroll, press a key. The system executes the action, captures a new screenshot, and the loop repeats. The agent is, in effect, a user.

The appeal is generality. Most software, internal tools, legacy applications, and websites without an API has no programmatic interface a model can call, but nearly all of it has a screen and accepts a mouse and keyboard. An agent that can see and operate a GUI therefore generalizes to almost any application without per-app integration work. This is built on a vision-language model: the model must read the screen, ground its intent in specific pixel locations, plan a sequence of actions, and recover when a click does not do what it expected.

The capability turns chat assistants into agents that can carry out real multi-step tasks: filling out forms, navigating an unfamiliar app, gathering information across several windows, or completing a workflow end to end.

It is also where agent safety becomes concrete rather than abstract. A model with live control of a mouse and keyboard can take consequential, hard-to-reverse actions, and it is exposed to prompt injection from whatever appears on screen. So computer use in practice is wrapped in guardrails: restricted environments, confirmation steps for sensitive actions, and human oversight. It is powerful precisely because it is unconstrained, which is also why it must be constrained deliberately.
