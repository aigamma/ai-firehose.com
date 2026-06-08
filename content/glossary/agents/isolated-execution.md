---
title: Isolated Execution
slug: isolated-execution
kind: tool
category: Agents and Tool Use
aliases: isolated execution, sandboxing, sandboxed execution, code sandbox
related: code-interpreter, computer-use, tool-use, human-in-the-loop, guardrails, ai-agent
summary: Running an agent's code, commands, or tool calls inside a confined environment, a sandbox, that limits what they can touch, so a mistake or an attack cannot damage the host system or reach data it should not. It is the containment layer that makes it safe to let a probabilistic agent actually execute things.
---

The moment an agent can run code or shell commands, it can do real damage: delete files, leak secrets, spend money, or be talked by a prompt injection into doing any of those on an attacker's behalf. Isolated execution is the containment that makes giving an agent real hands tolerable. Run its actions inside a sandbox, a confined environment where what it can read, write, reach, and spend is bounded by construction rather than by trusting it to behave.

The sandbox is built from limits. A container or virtual machine isolates the filesystem and processes from the host; network access is cut or allowlisted so the agent cannot reach arbitrary services; resource caps bound CPU, memory, and runtime so a runaway cannot exhaust the machine; and the environment is ephemeral, discarded after the task so nothing persists between runs. The design choice is how tight to make it: too loose and the containment is theater, too tight and the agent cannot do the legitimate work.

What isolation really does is replace trust with structure. You cannot make a probabilistic agent provably well-behaved, so instead of relying on its judgment you bound the blast radius of its worst possible action, the only assumption that holds against both honest mistakes and adversarial inputs at once. It is the same logic as guardrails and a human in the loop, pushed down to the level of execution: assume the agent will eventually do the wrong thing, and arrange in advance for that to be survivable.

Isolated execution is what lets the code-interpreter and computer-use patterns be deployed at all, because their power, running real code against real systems, is precisely their danger. As agents take on more consequential and less-supervised actions, the sandbox stops being an optional safety nicety and becomes the precondition for autonomy: you can only safely walk away from an agent whose mistakes are contained.
