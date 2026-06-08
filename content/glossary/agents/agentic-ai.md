---
title: Agentic AI
slug: agentic-ai
kind: technique
category: Agents and Tool Use
aliases: agentic artificial intelligence, agentic systems, agentic system
related: ai-agent, agentic-workflow, autonomous-agent, multi-agent-system, planning, tool-use, agentic-harness, reinforcement-learning
summary: The shift from models that respond to a single prompt toward systems that pursue a goal over many steps, choosing actions, calling tools, and reacting to results without a human directing each move. It names a paradigm and a market category more than one precise technique, which is both its usefulness and its vagueness.
---

For most of the deep-learning era a model was a function you called once: a prompt went in, an answer came out, and a human decided what to do with it. Agentic AI names the move away from that, toward systems that take a goal, break it into steps, act on the world through tools, observe what happened, and decide what to do next, looping until the goal is met or abandoned. The phrase marks a change in posture, from a model that answers to a system that pursues.

What turns a model into an agent is not a new architecture but a loop and a set of affordances around the same model. It needs the ability to act, through tools that change state rather than only describe it. It needs to plan, decomposing a goal into steps it can attempt. It needs memory, so a long task does not dissolve when the context window fills. And it needs feedback, reading the result of each action to correct the next. Strip any of these away and you are back to a chatbot that can describe a plan but not carry it out.

The term carries a warning inside it. Because agentic AI describes a posture rather than a precise method, it has become a label stretched across everything from a genuinely autonomous system to a thin wrapper that calls one tool and stops. The honest distinction is the length and openness of the loop: how many steps the system can take without a human, how much it decides for itself versus follows a fixed script, and, crucially, what stops it when it is wrong. Autonomy without that last part is not capability, it is unbounded risk.

The reason agentic AI is the dominant frame of this moment is economic as much as technical: a model that answers is a feature, while a model that acts is a worker, and the value of a worker you can hand a goal is far larger. That is also why the engineering attention has moved off the model and onto the scaffolding that makes acting safe and reliable, the tools, the verification, the escalation paths, which is to say that the agent is less the model than the harness built around it.
