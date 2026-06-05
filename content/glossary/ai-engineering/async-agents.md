---
title: Async Agents
slug: async-agents
kind: tool
category: AI Engineering
aliases: asynchronous agents, background agents
related: ai-agent, agentic-workflow, task-parallelization, agent-orchestration, autonomous-agent, agentic-harness
summary: Agents that run in the background on long tasks and report back when done, rather than holding a live, turn-by-turn conversation. The shift from a chat you wait on to a delegated job you check on later, which is what lets agents take on work that takes minutes or hours.
---

A chat agent is synchronous: you send a message, you wait, it replies, you wait. That rhythm works for quick answers and falls apart for real work, because a task that takes an agent twenty minutes cannot hold you at the keyboard for twenty minutes. Async agents break the rhythm: you hand off a job, the agent works in the background, and it notifies you when it is done or stuck, the way you delegate to a colleague rather than dictate to a stenographer.

Going async changes what the agent needs. It needs durable state, because the task outlives the request and may span restarts. It needs a way to report progress and surface when it is blocked, since no one is watching the cursor. It needs a notification path back to the human, and often a way to run many such jobs at once, since the whole point is that you are not waiting on any single one. The design shifts from a fast conversational loop to a job system: queue, run, observe, notify.

The hard part of async is not running in the background; it is handling the moment the agent gets stuck. A synchronous agent simply asks and waits; an async one has no one there to ask, so it must decide whether to make a reasonable assumption and continue, block and wait for input, or give up, and each choice has a failure mode. Lean too far toward asking and the agent stalls constantly, defeating the purpose; lean too far toward assuming and it confidently does the wrong thing for an hour. The escalation policy, when to interrupt the human, is most of the design.

Async agents are the form that makes delegation real. A synchronous agent is a faster way to do a task yourself; an async one is a way to not do it at all, to hand off a goal and get back a result. That is a categorical shift in what an agent is for, and it raises the bar accordingly: you will tolerate a chat agent that needs babysitting, but you will only trust an async one with work you are genuinely willing to stop watching, which is a much higher standard than a convincing demo.
