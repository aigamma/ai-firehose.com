---
title: YAML Workflows
slug: yaml-workflows
kind: tool
category: AI Engineering
aliases: declarative workflows, workflow as code
related: agentic-workflow, workflow-orchestration, agent-orchestration, automation, agentic-harness, task-decomposition
summary: Defining an agent or automation pipeline declaratively in a configuration file, typically YAML, listing the steps, tools, and order, rather than writing it in code. It trades the flexibility of a programming language for readability, versionability, and changing a workflow without redeploying.
---

As agent pipelines became common, a question followed: should a multi-step workflow be written in code, or declared in configuration? YAML workflows take the second path, describing the steps, the tools each calls, and the order they run in, in a structured text file rather than a program. The appeal is that a workflow becomes a readable, versionable document a non-programmer can follow and edit, and one the system can change without a code deploy.

The pattern separates the what from the how. The YAML file declares the structure, this step, then that one, using these tools, with this branching, while the engine that reads it supplies the execution: calling the model, invoking tools, passing state between steps. This is the same declarative idea behind build pipelines and infrastructure-as-code, applied to agents. The trade is the classic one: declarative configuration is clearer and safer for the common shapes but hits a wall on anything the format's authors did not anticipate, where code's full flexibility is needed.

The recurring lesson, learned repeatedly across software, is that a configuration format under pressure slowly grows into a bad programming language. It starts clean, then real needs arrive, conditionals, loops, variables, expressions, and each gets bolted on until the YAML is a clumsy program written in a language never designed to be one. The discipline is to keep declarative workflows for the genuinely declarative parts and reach for actual code when the logic gets complex, rather than torturing the config into doing what a function should.

YAML workflows are a bet that most agent pipelines are simple enough to declare, and for many they are, which buys real benefits in clarity and governance. But the boundary between configuration and code is exactly the boundary between a fixed pipeline and a flexible agent, and it tends to drift toward code as ambitions grow. The honest design keeps the simple cases simple and declarative and resists making the config do everything, because the moment it must, it has become the programming language it was meant to avoid.
