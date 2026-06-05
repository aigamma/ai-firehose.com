---
title: Context Management
slug: context-management
kind: technique
category: AI Engineering
aliases: context engineering, context window management, context stacking
related: context-window, kv-cache, agent-memory, retrieval-augmented-generation, large-language-model, prompt-engineering, agentic-workflow
summary: Deciding what information occupies a model's limited context window at each step, and what to summarize, retrieve, or drop, so the model has what it needs without drowning in what it does not. It becomes the central engineering problem once an agent runs long enough to generate more history than it can hold.
---

A language model can only attend to what fits in its context window, and every token in that window competes for the same finite budget and dilutes attention across the rest. For a single question this is rarely a problem. For an agent that runs for hours, reads files, calls tools, and accumulates a transcript longer than any window, the question of what to keep in front of the model at each step becomes the thing that decides whether it stays coherent or loses the thread.

Context management is a set of moves against a fixed budget. Summarize: compress old turns into a shorter running state so their gist survives even when their tokens do not. Retrieve: pull in only the few documents or memories relevant to the step at hand, rather than everything that might be. Evict: drop stale observations and dead ends that take up room without earning it. And structure: order what remains so the most important material sits where the model attends best. Each move trades fidelity for room, and choosing the trade per step is the engineering.

The failure that makes this urgent is that more context is not better context. Stuffing the window with everything available degrades the model two ways: it raises cost and latency in proportion to length, and it buries the relevant tokens among irrelevant ones, so the model attends less to what matters, a dilution sometimes visible as the model forgetting an instruction it was given thousands of tokens earlier. A smaller, curated context routinely beats a larger, exhaustive one.

As windows grow toward millions of tokens, the temptation is to declare the problem solved by brute capacity. It is not. A bigger window raises the ceiling but not the principle: attention is still finite and still dilutes, cost still scales with length, and the model still does best when shown what it needs and spared what it does not. Context management is becoming to agents what the memory hierarchy is to a processor, the quiet discipline that decides whether raw capacity turns into real performance.
