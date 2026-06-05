---
title: Prompt Chaining
slug: prompt-chaining
kind: technique
category: AI Engineering
aliases: prompt pipelines, chained prompts
related: agentic-workflow, chain-of-thought, prompt-engineering, workflow-orchestration, task-decomposition, large-language-model
summary: Breaking a complex task into a sequence of separate model calls, each handling one step and feeding its output into the next, rather than asking a single prompt to do everything at once. It trades more calls and latency for reliability, because each focused step is easier for the model to get right.
---

The instinct with a hard task is to write one big prompt that asks for everything: read this, analyze it, decide, and produce the result. Models often do that poorly, because a single pass has to juggle every sub-goal at once. Prompt chaining takes the opposite approach: split the task into a sequence of smaller prompts, each doing one thing, with the output of each feeding the next, so the model only has to succeed at one focused step at a time.

The chain is a pipeline of model calls. Step one extracts; step two analyzes what was extracted; step three drafts; step four checks the draft. Each step gets a clean, narrow prompt and the previous step's output as input, which keeps the model's attention on a single objective and makes each step's result inspectable. It differs from chain-of-thought, where one model reasons step by step inside a single call: here the steps are separate calls, so each can be tested, retried, or swapped independently, at the cost of more round-trips.

The trade that defines prompt chaining is reliability against error propagation. Each focused step is more reliable than one overloaded prompt, but the steps are now coupled in series, so a mistake early in the chain is inherited and amplified by everything downstream, and the final output can be confidently wrong because step two faithfully built on step one's error. A good chain is therefore not just decomposed but defended: validate the output of each step before passing it on, because the chain is only as strong as its weakest link and has no way to notice a bad one on its own.

Prompt chaining is the simplest form of the idea that structure beats brute force in getting reliable work from a model: a task decomposed into verifiable steps outperforms the same task demanded in one shot, not because the model got smarter but because each piece got easier. It is the gateway from prompting to engineering, the point where you stop trying to write the perfect single prompt and start designing the pipeline of modest ones, the same move, at smaller scale, that agentic workflows make.
