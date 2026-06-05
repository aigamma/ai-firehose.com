---
title: Autoresearch
slug: autoresearch
kind: technique
category: AI Engineering
aliases: autonomous research, automated research, AI research agent
related: ai-agent, agentic-workflow, agentic-harness, tool-use, planning, multi-agent-system, reflection
summary: Using an agent to carry out an open-ended research task end to end, formulating questions, gathering and reading sources, running experiments or searches, and synthesizing findings, with little step-by-step human direction. A demanding test of agency because research has no fixed procedure and no obvious stopping point.
---

Most automation targets tasks with a known shape: a form to fill, a pipeline to run, a query to answer. Research has none of that. It is open-ended, recursive, and self-directed: you do not know in advance what questions you will need to ask, what you will find, or when you are done. Autoresearch is the attempt to hand that open-endedness to an agent, asking it not to answer a question but to conduct the inquiry that answers it.

An autoresearch agent runs a loop that resembles how a person actually researches. It decomposes a vague goal into concrete sub-questions, gathers sources by searching, reading, or running code, evaluates what it found and decides whether it is enough, and either digs deeper or synthesizes. The hard parts are the judgments between steps: knowing which thread is worth pulling, when a source is trustworthy, when a line of inquiry is a dead end, and, crucially, when to stop, since an agent with no stopping sense will either research forever or quit too early.

The failure mode that makes autoresearch hard is confident shallowness. An agent can produce a fluent, well-structured report that looks thorough while having skimmed, misread, or invented its sources, and because the output reads authoritative, the gaps are invisible to a reader who did not do the work themselves. This is why the trustworthy versions force the agent to show its sources and reasoning, so the human reviews an audit trail rather than a polished conclusion; a research result you cannot trace is a guess in formal clothing.

Autoresearch is a sharp probe of how far agency has actually come, because it strips away the scaffolding that makes other agent tasks tractable: there is no fixed workflow to follow and no automatic check on whether the answer is right. Progress on it therefore measures not the model's knowledge but its judgment under open-endedness, which is exactly the capability that separates a tool that retrieves from a colleague you can delegate to.
