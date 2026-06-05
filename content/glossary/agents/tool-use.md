---
title: Tool Use
slug: tool-use
kind: technique
category: Agents and Tool Use
aliases: tool calling, tools
related: function-calling, ai-agent, react-prompting, model-context-protocol, planning, agentic-workflow, agent-memory
summary: The general capability of a language model to extend itself by invoking external tools (search, code execution, APIs, databases) and folding their results back into its reasoning, rather than relying only on what it learned in training. It is the bridge from a model that knows to an agent that acts, closing the three gaps a static model has: stale knowledge, unreliable computation, and the inability to change anything outside its own text.
---

Tool use lets a language model reach beyond its own weights by calling external tools. A model on its own can only generate text from what it absorbed during training; it cannot look up today's news, run a calculation it cannot do in its head, or change the state of an outside system. Tool use closes that gap: the model is told what tools exist (a web search, a Python interpreter, a calendar API, a vector database) and is allowed to invoke them mid-task. The tool runs in the real environment, its output is returned to the model, and the model continues its reasoning with that fresh information in hand.

This capability matters because it addresses the three things a static model lacks, and naming them is the keeper: current knowledge, exact computation, and the ability to act. A model's training data has a cutoff, so tools that fetch live data keep it current; models are unreliable at precise arithmetic, long lookups, and strict logic, so handing those to a calculator, a database, or a code runner trades a probabilistic guess for a deterministic answer; and a pure model can only produce words, so tools that send an email or commit a file are what let it actually do things rather than merely describe them. Tool use is therefore the bridge from a model that knows to an agent that acts.

In modern systems, tool use is implemented through function-calling: tools are described to the model with names and parameter schemas, the model emits a structured request, and the host validates and executes it. The control loop around this, often an instance of react-prompting, decides when to call a tool, reads the observation, and decides whether to call another or to answer. Sound tool design includes guarding what each tool can touch, since a tool that writes to a database or runs shell commands grants the model real power and real ways to cause harm, which is why permissioning and sandboxing are part of the discipline.

Tool use is the defining behavior of an ai-agent and the foundation of nearly every agentic-workflow. It pairs naturally with agent-memory, which lets an agent remember what earlier tool calls returned, and with planning, which sequences which tools to call in what order. As tool catalogs have grown, standards like model-context-protocol have emerged to expose tools to models uniformly, so the same set of tools can serve many agents. Whenever a model does something it could not have done from its training alone, tool use is what made it possible.
