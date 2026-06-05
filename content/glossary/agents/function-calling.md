---
title: Function Calling
slug: function-calling
kind: technique
category: Agents and Tool Use
aliases: function calls, structured tool invocation
related: tool-use, ai-agent, react-prompting, model-context-protocol, agentic-workflow, autonomous-agent
summary: A capability where a language model, given machine-readable descriptions of available functions, emits a structured request naming a function and its arguments, which the host then validates and executes. Its real contribution is reliability: it turns the brittle text-parsing of early agents into a typed, schema-validated contract, and a well-written schema does double duty by steering the model toward valid calls.
---

Function calling lets a language model ask a program to run a specific function with specific arguments. The host gives the model a set of function descriptions, typically a name, a natural-language purpose, and a JSON schema for the parameters; when the model decides a function is needed, it does not run anything itself but emits a structured object, usually JSON, that names the function and fills in the arguments. The host validates that object against the schema, executes the real function, and returns the result to the model. Function calling is the disciplined, parseable interface beneath the broader idea of tool-use.

The reason this capability matters is reliability, the keeper. Early agents had to coax tools out of free-form text and then parse that text with brittle regular expressions, which broke whenever the model phrased things slightly differently; by training and prompting the model to produce a constrained, schema-validated structure, function calling turns an unreliable text-parsing problem into a contract. The arguments arrive typed and named, malformed requests can be rejected or repaired before anything runs, and the boundary between what the model proposes and what the system actually does stays explicit and enforceable.

The schema does more than catch errors; it steers the model. A well-written parameter description, with types, enums, and required fields, tells the model exactly what information it must supply and in what shape, which sharply raises the rate of valid calls. Some implementations enforce this further through constrained decoding, restricting the model's token choices so the output is guaranteed to conform to the schema. Either way, the function description is part of the prompt, so writing clear, unambiguous schemas is as much a part of agent design as writing the functions themselves.

Function calling is the connective tissue of modern agent systems. It is the concrete substrate under react-prompting, where each "action" is a function call, and under any agentic-workflow that needs to touch external systems. It is also what protocols like model-context-protocol standardize and expose at scale, so that one catalog of functions can be offered to many models and many agents through a common interface. Wherever an ai-agent reaches out of its own text to query, compute, or change something, a function call is almost always the wire it travels on.
