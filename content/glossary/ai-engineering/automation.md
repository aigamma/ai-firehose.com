---
title: Automation
slug: automation
kind: technique
category: AI Engineering
aliases: AI automation, agentic automation, workflow automation
related: agentic-workflow, ai-agent, workflow-orchestration, tool-use, task-decomposition, human-in-the-loop, agentic-harness
summary: Handing a recurring, multi-step task to a system that carries it out without a human driving each step, increasingly by wrapping a language model in tools, triggers, and checks. The hard part is rarely the model's competence on any single step; it is reliability across the whole chain when no one is watching.
---

The dream of automation predates AI by more than a century: take a task a person does over and over, encode the steps once, and let a machine repeat them faithfully. What language models change is the kind of task that can be encoded. Steps that used to resist automation because they required reading an email, judging a tone, or deciding which of three branches applies are now within reach, because a model can make that judgment in the middle of an otherwise mechanical pipeline.

An automation has three parts that matter more than the model itself. A trigger decides when it runs: a schedule, a webhook, a new file. Tools give it hands to act, an API call or a shell command or a database write, rather than only describing what should happen. And a contract defines what done and correct look like, because an automation runs unattended, so a quiet failure is worse than a loud one. The craft is choosing how much to delegate to the model's judgment versus pin down in deterministic code, since every step left to the model is a step that can drift.

The counterintuitive lesson is that adding intelligence to a pipeline can make it less reliable, not more. A deterministic script either works or throws; a model-driven step can succeed ninety-five times and quietly do the wrong thing on the ninety-sixth, and across a chain of ten such steps the odds of an unattended run passing cleanly compound downward fast. Robust automation therefore spends most of its engineering not on the clever model call but on the boring scaffolding around it: validation, retries, idempotency, and an escalation path back to a human when confidence is low.

The frontier is the shift from automations a person configures step by step to agents handed a goal and trusted to compose the steps themselves. That trades the brittleness of a fixed script for the unpredictability of an open-ended agent, and it is why the practical question has moved from whether the model can do the task to whether you can bound what it does when it is wrong, the same question that governs whether any unsupervised system can be left running.
