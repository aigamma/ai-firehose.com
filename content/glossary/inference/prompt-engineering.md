---
title: Prompt Engineering
slug: prompt-engineering
kind: technique
category: Inference and Sampling
aliases: prompt engineering, prompt design
related: in-context-learning, few-shot-learning, chain-of-thought, system-prompt, react-prompting
summary: The craft of designing the text given to a model to reliably elicit the behavior you want, spanning phrasing, structure, examples, role-setting, and step-by-step instructions; the practical interface to a model whose weights you cannot change.
---

Prompt engineering is the discipline of getting a fixed model to do what you want by controlling its input. Because the weights are frozen and the prompt is the main lever a user has, how a request is phrased and structured turns out to matter a great deal: the same underlying capability can be unreliable under a vague prompt and dependable under a careful one. Prompt engineering is the practice of finding the careful one.

Its toolkit is by now well known. Give clear, specific instructions rather than hoping the model guesses intent. Supply a few examples when format or task is unusual, the few-shot move. Elicit reasoning with chain-of-thought prompting for problems that need working through. Set a role and rules with a system prompt. Specify the exact output format a downstream system expects. Break a hard task into steps. Each of these is a way of shaping the context so the model's most likely continuation is the one you want.

It is fundamentally empirical. Prompts are tested and iterated, behavior is brittle and can shift with wording, and a prompt tuned for one model may not transfer to another, so prompt engineering is closer to careful experimentation than to a fixed recipe.

Its character is also evolving. As models get better at following instructions, crude tricks matter less and plain, well-structured requests work more often, but specification, examples, and supplying the right context do not go away. For agents and retrieval systems it broadens into context engineering: assembling the right instructions, tools, and retrieved information into the model's limited window.
