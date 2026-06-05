---
title: Agent Optimization
slug: agent-optimization
kind: technique
category: AI Engineering
aliases: optimizing agents, agent tuning
related: agent-design, agentic-workflow, agent-evaluation, prompt-engineering, reflection, agentic-harness
summary: Systematically improving an agent's reliability, cost, and speed after it works at all, by tuning its prompts, tools, memory, and control flow against measured outcomes. It is the move from an agent that works in a demo to one that works in production, and it is impossible without good evaluation.
---

Getting an agent to work once is the easy part; getting it to work reliably, cheaply, and quickly is the rest of the job. Agent optimization is that rest: the systematic improvement of an existing agent against measured outcomes, tuning the parts that determine how often it succeeds, how much it costs per task, and how long it takes. It is what separates the agent that wowed in a demo from the one a business can actually depend on.

The levers are every part of the agent's design. Prompts can be sharpened so the model misreads the task less often. The tool set can be trimmed or clarified so the agent chooses the right action. The control flow can be tightened, with fewer steps and better stopping conditions, so it wanders less. Memory and context can be managed so it stays coherent longer for less. Each is a knob, and the discipline is to turn one at a time against a fixed test set, because changing several at once tells you the agent got better or worse but not why.

The hard prerequisite, the one that stops most agent optimization before it starts, is measurement. You cannot optimize what you cannot measure, and agents are notoriously hard to measure, because their tasks are open-ended and a run can fail in subtle, non-deterministic ways. Without a reliable evaluation set, optimization degenerates into vibes: a change feels better, ships, and quietly regresses something untested. So the real first step of agent optimization is almost always building the eval, and teams that skip it are not optimizing, they are guessing with extra steps.

Agent optimization is where building agents stops being prompt-craft and becomes engineering, with the same character as performance tuning anywhere: measure, change one thing, measure again, keep what helps. The leverage it reveals is that most of an agent's reliability is won after the first working version, in the unglamorous loop of evaluation and adjustment, which is why the teams that win at agents are rarely the ones with the cleverest initial idea and usually the ones with the most disciplined feedback loop.
