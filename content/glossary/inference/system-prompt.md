---
title: System Prompt
slug: system-prompt
kind: technique
category: Inference and Sampling
aliases: system prompt, system message, developer message
related: prompt-engineering, prompt-injection, instruction-tuning, in-context-learning, context-window
summary: A high-priority instruction placed before the conversation that sets a model's role, rules, tone, and constraints for the whole session; the developer's standing brief to the model, given more weight than ordinary user turns.
---

A system prompt is the instruction block that frames an entire interaction. It sits before the back-and-forth of user and assistant messages and tells the model who it is supposed to be and how it should behave: its persona, the rules it must follow, the tone to take, the tools or context it has, and the format to answer in. Where a user message is a single request, the system prompt is a standing brief that persists across the whole conversation.

It carries special weight because models are trained to give it one. Through instruction tuning and an explicit instruction hierarchy, a model learns to treat the system message as more authoritative than user messages, so when the two conflict the system prompt is supposed to win. This is what lets a developer set behavior that a user cannot casually override, and it is where application-level policy, persona, and safety guidance are encoded.

In practice the system prompt is the main place a product defines its assistant: a coding tool, a customer-service bot, and a tutor differ largely in their system prompts even atop the same model.

Its authority is real but not absolute, and that gap matters for security. The hierarchy is a soft, learned priority rather than a hard boundary, so a determined jailbreak or a prompt-injection attack carried in untrusted content can still talk the model out of its system instructions, because to the model it is all just text in the context. Treating the system prompt as a strong default rather than an unbreakable rule, and backing it with guardrails, is the safe posture.
