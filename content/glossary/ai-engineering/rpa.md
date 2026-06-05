---
title: Robotic Process Automation
slug: rpa
kind: tool
category: AI Engineering
aliases: RPA, robotic process automation
related: automation, agentic-workflow, ai-agent, computer-use, tool-use, workflow-orchestration
summary: The older paradigm of automating repetitive computer tasks with brittle, explicitly-scripted bots that mimic a human clicking through software, and the foil against which AI agents are defined. RPA's rigidity is exactly what agents promise to fix, and what makes the comparison instructive.
---

Before AI agents, the way to automate a repetitive computer task was Robotic Process Automation: a bot programmed to click the same buttons, copy the same fields, and follow the same script a human would, step by literal step. It works, and a large industry runs on it, but it is brittle in a specific way: the bot does exactly what it was told and nothing more, so it breaks the moment a button moves, a form changes, or anything happens that its script did not anticipate.

RPA matters now mostly as the contrast that defines what AI agents are for. An RPA bot follows a fixed path; an agent decides the path at runtime from what it observes, so it can absorb a layout change or an unexpected dialog that would stop a bot cold. RPA encodes the how, every click in advance; an agent is given the what, the goal, and figures out the clicks. That is the difference between automation that must be re-scripted whenever the world shifts and automation that can adapt to the shift.

The instructive tension is that RPA's brittleness and an agent's flexibility are two sides of one trade. RPA is rigid, but its rigidity is also predictability: it does precisely the same thing every time, which is auditable and safe. An agent is flexible, but its flexibility is also unpredictability: it might handle the surprise gracefully or might confidently do the wrong thing, and you cannot be sure in advance which. So the move from RPA to agents is not pure progress; it trades a brittle, predictable worker for an adaptable, less predictable one, and which you want depends on how much the task varies and how costly a wrong action is.

The likely future is not agents replacing RPA wholesale but the two merging: the reliability of scripted steps where the process is fixed, with an agent's judgment dropped in exactly where the process varies or breaks. RPA is worth understanding precisely because it is what agents are improving on, and because its hard-won lessons, that unattended automation needs predictability, auditing, and graceful failure, are exactly the lessons agentic systems are now relearning at a higher level of capability.
